import { computed, reactive, readonly, watch } from 'vue'
import { collectionKeys } from '../data/defaultData.js'
import {
  readCareBloomData,
  resetCareBloomData,
  writeCareBloomData,
} from '../services/storageService.js'

const state = reactive({
  users: [],
  supportSessions: [],
  peerCircles: [],
  bookings: [],
  ratings: [],
  isReady: false,
  storageAvailable: true,
  dataSource: 'memory',
})

let persistenceStarted = false

const replaceCollections = (data) => {
  collectionKeys.forEach((key) => {
    state[key] = data[key]
  })
}

const createSnapshot = () =>
  Object.fromEntries(collectionKeys.map((key) => [key, state[key]]))

const startPersistence = () => {
  if (persistenceStarted) return

  watch(
    () => collectionKeys.map((key) => state[key]),
    () => {
      if (state.isReady) {
        state.storageAvailable = writeCareBloomData(createSnapshot())
      }
    },
    { deep: true },
  )

  persistenceStarted = true
}

export const initialiseCareBloomData = () => {
  if (state.isReady) return

  const result = readCareBloomData()
  replaceCollections(result.data)
  state.storageAvailable = result.storageAvailable
  state.dataSource = result.source
  state.isReady = true
  startPersistence()
}

export const restoreDefaultData = () => {
  const result = resetCareBloomData()
  replaceCollections(result.data)
  state.storageAvailable = result.storageAvailable
  state.dataSource = 'defaults'
}

const collectionCounts = computed(() =>
  Object.fromEntries(collectionKeys.map((key) => [key, state[key].length])),
)

const publicState = readonly(state)

export const useCareBloomData = () => {
  initialiseCareBloomData()

  return {
    state: publicState,
    collectionCounts,
  }
}
