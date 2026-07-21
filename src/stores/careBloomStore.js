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

const persistSnapshot = () => {
  state.storageAvailable = writeCareBloomData(createSnapshot())
}

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

export const addUser = (user) => {
  const duplicateUser = state.users.some(
    (existingUser) =>
      existingUser.id === user.id || existingUser.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (duplicateUser) return false

  state.users.push(user)
  persistSnapshot()
  return true
}

export const createBooking = (userId, sessionId) => {
  const user = state.users.find((candidate) => candidate.id === userId)
  const session = state.supportSessions.find((candidate) => candidate.id === sessionId)

  if (!user || user.role !== 'user') {
    return { ok: false, message: 'Only young carer accounts can book support sessions.' }
  }

  if (!session) {
    return { ok: false, message: 'This support session is no longer available.' }
  }

  const duplicateBooking = state.bookings.some(
    (booking) =>
      booking.userId === userId &&
      booking.sessionId === sessionId &&
      booking.status === 'confirmed',
  )

  if (duplicateBooking) {
    return { ok: false, message: 'You already have a confirmed booking for this session.' }
  }

  const confirmedBookings = state.bookings.filter(
    (booking) => booking.sessionId === sessionId && booking.status === 'confirmed',
  ).length

  if (confirmedBookings >= session.capacity) {
    return { ok: false, message: 'This session is currently full.' }
  }

  const booking = {
    id: `booking-${globalThis.crypto.randomUUID()}`,
    userId,
    sessionId,
    status: 'confirmed',
    bookedAt: new Date().toISOString(),
  }

  state.bookings.push(booking)
  persistSnapshot()
  return { ok: true, booking, message: 'Your session booking is confirmed.' }
}

export const cancelBooking = (userId, bookingId) => {
  const booking = state.bookings.find((candidate) => candidate.id === bookingId)

  if (!booking || booking.userId !== userId) {
    return { ok: false, message: 'This booking does not belong to your account.' }
  }

  if (booking.status !== 'confirmed') {
    return { ok: false, message: 'This booking has already been cancelled.' }
  }

  booking.status = 'cancelled'
  booking.cancelledAt = new Date().toISOString()
  persistSnapshot()
  return { ok: true, message: 'Your booking has been cancelled.' }
}

export const joinPeerCircle = (userId, circleId) => {
  const user = state.users.find((candidate) => candidate.id === userId)
  const circle = state.peerCircles.find((candidate) => candidate.id === circleId)

  if (!user || user.role !== 'user') {
    return { ok: false, message: 'Only young carer accounts can join peer circles.' }
  }

  if (!circle) {
    return { ok: false, message: 'This peer circle is no longer available.' }
  }

  const joinedCircleIds = Array.isArray(user.joinedCircleIds) ? user.joinedCircleIds : []

  if (joinedCircleIds.includes(circleId)) {
    return { ok: false, message: 'You have already joined this peer circle.' }
  }

  if (circle.memberCount >= circle.capacity) {
    return { ok: false, message: 'This peer circle is currently full.' }
  }

  user.joinedCircleIds = [...joinedCircleIds, circleId]
  circle.memberCount += 1
  persistSnapshot()
  return { ok: true, message: 'You have joined this peer circle.' }
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
