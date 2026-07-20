import { collectionKeys, createDefaultData } from '../data/defaultData.js'

export const STORAGE_KEY = 'carebloom:data:v2'
export const AUTH_SESSION_KEY = 'carebloom:auth:v1'
export const SCHEMA_VERSION = 2
const LEGACY_STORAGE_KEY = 'carebloom:data:v1'

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

const migrateLegacyData = (data) => {
  const defaults = createDefaultData()
  const defaultUsersByEmail = new Map(defaults.users.map((user) => [user.email, user]))

  return {
    ...data,
    users: data.users.map((user) => {
      if (user.passwordHash && user.passwordSalt) return user

      const defaultUser = defaultUsersByEmail.get(user.email)
      if (!defaultUser) return user

      return {
        ...user,
        passwordSalt: defaultUser.passwordSalt,
        passwordHash: defaultUser.passwordHash,
      }
    }),
  }
}

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

    const legacyValue = storage.getItem(LEGACY_STORAGE_KEY)

    if (legacyValue) {
      const legacyPayload = JSON.parse(legacyValue)

      if (hasValidCollections(legacyPayload.data)) {
        const migratedData = migrateLegacyData(legacyPayload.data)
        const saved = writeCareBloomData(migratedData)
        return {
          data: migratedData,
          storageAvailable: saved,
          source: saved ? 'migrated' : 'memory',
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
    return session.schemaVersion === 1 && typeof session.userId === 'string' ? session : null
  } catch {
    return null
  }
}

export const writeAuthSession = (userId) => {
  const storage = getStorage()
  if (!storage) return false

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
