import { computed, reactive, readonly } from 'vue'
import { addUser, useCareBloomData } from './careBloomStore.js'
import {
  createPasswordSalt,
  createUserId,
  hashPassword,
  normaliseEmail,
  verifyPassword,
} from '../services/authService.js'
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from '../services/storageService.js'

const { state: dataState } = useCareBloomData()

const state = reactive({
  currentUserId: null,
  isReady: false,
})

const userRecord = computed(() =>
  dataState.users.find((user) => user.id === state.currentUserId) ?? null,
)

const currentUser = computed(() => {
  if (!userRecord.value) return null

  const { passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...profile } =
    userRecord.value
  return profile
})

const isAuthenticated = computed(() => currentUser.value !== null)

const startSession = (userId) => {
  state.currentUserId = userId
  writeAuthSession(userId)
}

export const initialiseAuth = () => {
  if (state.isReady) return

  const savedSession = readAuthSession()
  const savedUserExists = dataState.users.some((user) => user.id === savedSession?.userId)

  if (savedUserExists) {
    state.currentUserId = savedSession.userId
  } else if (savedSession) {
    clearAuthSession()
  }

  state.isReady = true
}

export const register = async ({ displayName, email, suburb, password }) => {
  const normalisedEmail = normaliseEmail(email)
  const emailExists = dataState.users.some(
    (user) => normaliseEmail(user.email) === normalisedEmail,
  )

  if (emailExists) {
    return { ok: false, field: 'email', message: 'An account with this email already exists.' }
  }

  const passwordSalt = createPasswordSalt()
  const passwordHash = await hashPassword(password, passwordSalt)
  const user = {
    id: createUserId(),
    displayName: displayName.trim(),
    email: normalisedEmail,
    role: 'user',
    suburb: suburb.trim(),
    passwordSalt,
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  if (!addUser(user)) {
    return { ok: false, message: 'Your account could not be created. Please try again.' }
  }

  startSession(user.id)
  return { ok: true, user: currentUser.value }
}

export const login = async ({ email, password }) => {
  const normalisedEmail = normaliseEmail(email)
  const user = dataState.users.find(
    (candidate) => normaliseEmail(candidate.email) === normalisedEmail,
  )

  const passwordMatches = user
    ? await verifyPassword(password, user.passwordSalt, user.passwordHash)
    : false

  if (!user || !passwordMatches) {
    return { ok: false, message: 'Email or password is incorrect.' }
  }

  startSession(user.id)
  return { ok: true, user: currentUser.value }
}

export const logout = () => {
  state.currentUserId = null
  clearAuthSession()
}

const publicState = readonly(state)

export const useAuth = () => {
  initialiseAuth()

  return {
    state: publicState,
    currentUser,
    isAuthenticated,
    register,
    login,
    logout,
  }
}
