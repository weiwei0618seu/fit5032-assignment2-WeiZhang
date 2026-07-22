import { computed, reactive, readonly, watch } from 'vue'
import { collectionKeys } from '../data/defaultData.js'
import {
  readAuthSession,
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
  if (!user || user.role !== 'user') return false

  const duplicateUser = state.users.some(
    (existingUser) =>
      existingUser.id === user.id || existingUser.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (duplicateUser) return false

  state.users.push(user)
  persistSnapshot()
  return true
}

const hasActiveSessionFor = (userId) => readAuthSession()?.userId === userId

export const createBooking = (userId, sessionId) => {
  if (!hasActiveSessionFor(userId)) {
    return { ok: false, message: 'Log in before booking a support session.' }
  }

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
  if (!hasActiveSessionFor(userId)) {
    return { ok: false, message: 'Log in before changing a booking.' }
  }

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
  if (!hasActiveSessionFor(userId)) {
    return { ok: false, message: 'Log in before joining a peer circle.' }
  }

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

const ratingTargetExists = (targetType, targetId) => {
  if (targetType === 'peerCircle') {
    return state.peerCircles.some((circle) => circle.id === targetId)
  }

  if (targetType === 'supportSession') {
    return state.supportSessions.some((session) => session.id === targetId)
  }

  return false
}

export const getUserRating = (userId, targetType, targetId) =>
  state.ratings.find(
    (rating) =>
      rating.userId === userId &&
      rating.targetType === targetType &&
      rating.targetId === targetId,
  )?.score ?? null

export const getRatingSummary = (targetType, targetId) => {
  const targetRatings = state.ratings.filter(
    (rating) =>
      rating.targetType === targetType &&
      rating.targetId === targetId &&
      Number.isInteger(rating.score) &&
      rating.score >= 1 &&
      rating.score <= 5,
  )

  if (targetRatings.length === 0) {
    return { average: null, count: 0 }
  }

  const total = targetRatings.reduce((sum, rating) => sum + rating.score, 0)
  return {
    average: total / targetRatings.length,
    count: targetRatings.length,
  }
}

export const submitRating = (userId, targetType, targetId, score) => {
  const userExists = state.users.some((user) => user.id === userId)

  if (!userExists || !hasActiveSessionFor(userId)) {
    return { ok: false, message: 'Log in before submitting a rating.' }
  }

  if (!ratingTargetExists(targetType, targetId)) {
    return { ok: false, message: 'The item you are rating is no longer available.' }
  }

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { ok: false, message: 'Choose a whole-number rating from 1 to 5.' }
  }

  const existingRating = state.ratings.find(
    (rating) =>
      rating.userId === userId &&
      rating.targetType === targetType &&
      rating.targetId === targetId,
  )

  const now = new Date().toISOString()

  if (existingRating) {
    existingRating.score = score
    existingRating.updatedAt = now
    persistSnapshot()
    return { ok: true, created: false, rating: existingRating, message: 'Your rating was updated.' }
  }

  const rating = {
    id: `rating-${globalThis.crypto.randomUUID()}`,
    userId,
    targetType,
    targetId,
    score,
    createdAt: now,
    updatedAt: now,
  }

  state.ratings.push(rating)
  persistSnapshot()
  return { ok: true, created: true, rating, message: 'Thank you for sharing your rating.' }
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
