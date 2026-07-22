import { collectionKeys, createDefaultData } from '../data/defaultData.js'

export const STORAGE_KEY = 'carebloom:data:v3'
export const AUTH_SESSION_KEY = 'carebloom:auth:v1'
export const SCHEMA_VERSION = 3
const LEGACY_STORAGE_KEYS = ['carebloom:data:v2', 'carebloom:data:v1']
const USER_ROLES = new Set(['user', 'admin'])
const SESSION_FORMATS = new Set(['Online', 'In person', 'Phone'])
const CIRCLE_FORMATS = new Set(['Online', 'In person', 'Hybrid'])
const BOOKING_STATUSES = new Set(['confirmed', 'cancelled'])
const RATING_TARGET_TYPES = new Set(['peerCircle', 'supportSession'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const ID_PATTERN = /^[A-Za-z0-9-]{1,100}$/
const HASH_PATTERN = /^[a-f0-9]{64}$/i
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const UNSAFE_TEXT_PATTERN = /[<>\u0000-\u001f\u007f]/
const trustedAdminAccounts = new Map(
  createDefaultData()
    .users.filter((user) => user.role === 'admin')
    .map((user) => [user.id, user]),
)

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

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isText = (value, maximumLength, minimumLength = 1) =>
  typeof value === 'string' &&
  value.trim().length >= minimumLength &&
  value.length <= maximumLength &&
  !UNSAFE_TEXT_PATTERN.test(value)

const isId = (value) => typeof value === 'string' && ID_PATTERN.test(value)

const isTimestamp = (value) =>
  typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value))

const isTextList = (value, maximumItems = 20) =>
  Array.isArray(value) &&
  value.length <= maximumItems &&
  value.every((item) => isText(item, 100))

const hasUniqueIds = (records) =>
  new Set(records.map((record) => record.id)).size === records.length

const isValidUser = (user) => {
  if (
    !isRecord(user) ||
    !isId(user.id) ||
    !isText(user.displayName, 50, 2) ||
    !isText(user.email, 100) ||
    !EMAIL_PATTERN.test(user.email) ||
    !USER_ROLES.has(user.role) ||
    !isText(user.suburb, 50, 0) ||
    !Array.isArray(user.joinedCircleIds) ||
    !user.joinedCircleIds.every(isId) ||
    new Set(user.joinedCircleIds).size !== user.joinedCircleIds.length ||
    !isText(user.passwordSalt, 128) ||
    typeof user.passwordHash !== 'string' ||
    !HASH_PATTERN.test(user.passwordHash) ||
    !isTimestamp(user.createdAt)
  ) {
    return false
  }

  const trustedAdmin = trustedAdminAccounts.get(user.id)
  const expectedRole = trustedAdmin ? 'admin' : 'user'

  if (user.role !== expectedRole) return false

  return !trustedAdmin || (
    user.email.toLowerCase() === trustedAdmin.email.toLowerCase() &&
    user.passwordSalt === trustedAdmin.passwordSalt &&
    user.passwordHash === trustedAdmin.passwordHash
  )
}

const isValidSession = (session) =>
  isRecord(session) &&
  isId(session.id) &&
  isText(session.title, 100) &&
  isText(session.focus, 80) &&
  SESSION_FORMATS.has(session.format) &&
  typeof session.date === 'string' &&
  DATE_PATTERN.test(session.date) &&
  typeof session.time === 'string' &&
  TIME_PATTERN.test(session.time) &&
  Number.isInteger(session.durationMinutes) &&
  session.durationMinutes >= 15 &&
  session.durationMinutes <= 240 &&
  isText(session.facilitator, 100) &&
  isText(session.location, 150) &&
  Number.isInteger(session.capacity) &&
  session.capacity >= 1 &&
  session.capacity <= 500 &&
  isText(session.description, 500) &&
  isTextList(session.accessibility)

const isValidCircle = (circle) =>
  isRecord(circle) &&
  isId(circle.id) &&
  isText(circle.name, 100) &&
  isText(circle.audience, 150) &&
  CIRCLE_FORMATS.has(circle.format) &&
  isText(circle.schedule, 150) &&
  typeof circle.nextMeeting === 'string' &&
  DATE_PATTERN.test(circle.nextMeeting) &&
  isText(circle.location, 150) &&
  isText(circle.facilitator, 100) &&
  Number.isInteger(circle.capacity) &&
  circle.capacity >= 1 &&
  circle.capacity <= 500 &&
  Number.isInteger(circle.memberCount) &&
  circle.memberCount >= 0 &&
  circle.memberCount <= circle.capacity &&
  isText(circle.description, 500) &&
  isTextList(circle.topics)

const isValidBooking = (booking) =>
  isRecord(booking) &&
  isId(booking.id) &&
  isId(booking.userId) &&
  isId(booking.sessionId) &&
  BOOKING_STATUSES.has(booking.status) &&
  isTimestamp(booking.bookedAt) &&
  (booking.cancelledAt === undefined || isTimestamp(booking.cancelledAt))

const isValidRating = (rating) =>
  isRecord(rating) &&
  isId(rating.id) &&
  isId(rating.userId) &&
  RATING_TARGET_TYPES.has(rating.targetType) &&
  isId(rating.targetId) &&
  Number.isInteger(rating.score) &&
  rating.score >= 1 &&
  rating.score <= 5 &&
  isTimestamp(rating.createdAt) &&
  isTimestamp(rating.updatedAt)

const hasValidRelationships = (data) => {
  const userIds = new Set(data.users.map((user) => user.id))
  const sessionIds = new Set(data.supportSessions.map((session) => session.id))
  const circleIds = new Set(data.peerCircles.map((circle) => circle.id))

  const adminsPresent = [...trustedAdminAccounts.keys()].every((adminId) => userIds.has(adminId))
  const membershipsAreValid = data.users.every((user) =>
    user.joinedCircleIds.every((circleId) => circleIds.has(circleId)),
  )
  const bookingReferencesAreValid = data.bookings.every(
    (booking) => userIds.has(booking.userId) && sessionIds.has(booking.sessionId),
  )
  const ratingReferencesAreValid = data.ratings.every(
    (rating) =>
      userIds.has(rating.userId) &&
      (rating.targetType === 'peerCircle'
        ? circleIds.has(rating.targetId)
        : sessionIds.has(rating.targetId)),
  )
  const confirmedBookingKeys = data.bookings
    .filter((booking) => booking.status === 'confirmed')
    .map((booking) => `${booking.userId}:${booking.sessionId}`)
  const ratingKeys = data.ratings.map(
    (rating) => `${rating.userId}:${rating.targetType}:${rating.targetId}`,
  )

  return (
    adminsPresent &&
    membershipsAreValid &&
    bookingReferencesAreValid &&
    ratingReferencesAreValid &&
    new Set(confirmedBookingKeys).size === confirmedBookingKeys.length &&
    new Set(ratingKeys).size === ratingKeys.length
  )
}

const hasValidDataModel = (data) =>
  hasValidCollections(data) &&
  data.users.every(isValidUser) &&
  data.supportSessions.every(isValidSession) &&
  data.peerCircles.every(isValidCircle) &&
  data.bookings.every(isValidBooking) &&
  data.ratings.every(isValidRating) &&
  collectionKeys.every((key) => hasUniqueIds(data[key])) &&
  hasValidRelationships(data)

const createPayload = (data) => ({
  schemaVersion: SCHEMA_VERSION,
  savedAt: new Date().toISOString(),
  data,
})

const migrateLegacyData = (data) => {
  const defaults = createDefaultData()
  const defaultUsersByEmail = new Map(defaults.users.map((user) => [user.email, user]))

  return {
    ...data,
    users: data.users.map((user) => {
      const defaultUser = defaultUsersByEmail.get(user.email)

      return {
        ...user,
        joinedCircleIds: Array.isArray(user.joinedCircleIds)
          ? user.joinedCircleIds
          : (defaultUser?.joinedCircleIds ?? []),
        passwordSalt: user.passwordSalt ?? defaultUser?.passwordSalt,
        passwordHash: user.passwordHash ?? defaultUser?.passwordHash,
      }
    }),
  }
}

export const writeCareBloomData = (data) => {
  const storage = getStorage()

  if (!storage || !hasValidDataModel(data)) return false

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

      if (payload.schemaVersion === SCHEMA_VERSION && hasValidDataModel(payload.data)) {
        return { data: payload.data, storageAvailable: true, source: 'localStorage' }
      }
    }

    for (const legacyStorageKey of LEGACY_STORAGE_KEYS) {
      const legacyValue = storage.getItem(legacyStorageKey)

      if (legacyValue) {
        const legacyPayload = JSON.parse(legacyValue)

        if (hasValidCollections(legacyPayload.data)) {
          const migratedData = migrateLegacyData(legacyPayload.data)
          if (hasValidDataModel(migratedData)) {
            const saved = writeCareBloomData(migratedData)
            return {
              data: migratedData,
              storageAvailable: saved,
              source: saved ? 'migrated' : 'memory',
            }
          }
        }
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

export const readAuthSession = () => {
  const storage = getStorage()
  if (!storage) return null

  try {
    const savedValue = storage.getItem(AUTH_SESSION_KEY)
    if (!savedValue) return null

    const session = JSON.parse(savedValue)
    return session.schemaVersion === 1 && isId(session.userId) && isTimestamp(session.signedInAt)
      ? session
      : null
  } catch {
    return null
  }
}

export const writeAuthSession = (userId) => {
  const storage = getStorage()
  if (!storage || !isId(userId)) return false

  try {
    storage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        schemaVersion: 1,
        userId,
        signedInAt: new Date().toISOString(),
      }),
    )
    return true
  } catch {
    return false
  }
}

export const clearAuthSession = () => {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(AUTH_SESSION_KEY)
    return true
  } catch {
    return false
  }
}
