import { collectionKeys, createDefaultData } from '../data/defaultData.js'

export const STORAGE_KEY = 'carebloom:data:v1'
export const SCHEMA_VERSION = 1

const getStorage = () => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

const hasValidCollections = (data) =>
  data !== null &&
  typeof data === 'object' &&
  collectionKeys.every((key) => Array.isArray(data[key]))

const createPayload = (data) => ({
  schemaVersion: SCHEMA_VERSION,
  savedAt: new Date().toISOString(),
  data,
})

export const writeCareBloomData = (data) => {
  const storage = getStorage()

  if (!storage || !hasValidCollections(data)) return false

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(createPayload(data)))
    return true
  } catch (error) {
    console.warn('CareBloom could not save data to Local Storage.', error)
    return false
  }
}

export const readCareBloomData = () => {
  const storage = getStorage()
  const fallbackData = createDefaultData()

  if (!storage) {
    return { data: fallbackData, storageAvailable: false, source: 'memory' }
  }

  try {
    const savedValue = storage.getItem(STORAGE_KEY)

    if (savedValue) {
      const payload = JSON.parse(savedValue)

      if (payload.schemaVersion === SCHEMA_VERSION && hasValidCollections(payload.data)) {
        return { data: payload.data, storageAvailable: true, source: 'localStorage' }
      }
    }

    const saved = writeCareBloomData(fallbackData)
    return {
      data: fallbackData,
      storageAvailable: saved,
      source: saved ? 'defaults' : 'memory',
    }
  } catch (error) {
    console.warn('CareBloom found invalid Local Storage data and restored defaults.', error)
    const saved = writeCareBloomData(fallbackData)
    return {
      data: fallbackData,
      storageAvailable: saved,
      source: saved ? 'recovered' : 'memory',
    }
  }
}

export const resetCareBloomData = () => {
  const freshData = createDefaultData()
  const storageAvailable = writeCareBloomData(freshData)
  return { data: freshData, storageAvailable }
}
