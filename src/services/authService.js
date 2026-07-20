const textEncoder = new TextEncoder()

const bytesToHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

export const normaliseEmail = (email) => email.trim().toLowerCase()

export const createPasswordSalt = () => {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

export const hashPassword = async (password, salt) => {
  const value = textEncoder.encode(`${salt}:${password}`)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', value)
  return bytesToHex(new Uint8Array(digest))
}

export const verifyPassword = async (password, salt, expectedHash) => {
  if (!salt || !expectedHash) return false
  return (await hashPassword(password, salt)) === expectedHash
}

export const createUserId = () => `user-${globalThis.crypto.randomUUID()}`
