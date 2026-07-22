const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\p{N} .,'’()-]*$/u
const SUBURB_PATTERN = /^[\p{L}\p{M}\p{N} .,'’()-]*$/u

const asString = (value) => (typeof value === 'string' ? value : '')

export const validateRegistration = (values) => {
  const errors = {}
  const displayName = asString(values?.displayName).trim()
  const email = asString(values?.email).trim()
  const suburb = asString(values?.suburb).trim()
  const password = asString(values?.password)
  const confirmPassword = asString(values?.confirmPassword)

  if (!displayName) {
    errors.displayName = 'Enter your name.'
  } else if (displayName.length < 2) {
    errors.displayName = 'Name must contain at least 2 characters.'
  } else if (displayName.length > 50) {
    errors.displayName = 'Name must be 50 characters or fewer.'
  } else if (!NAME_PATTERN.test(displayName)) {
    errors.displayName = 'Use letters, numbers, spaces, and standard name punctuation only.'
  }

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (email.length > 100) {
    errors.email = 'Email must be 100 characters or fewer.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, such as name@example.com.'
  }

  if (suburb.length > 50) {
    errors.suburb = 'Suburb must be 50 characters or fewer.'
  } else if (suburb && !SUBURB_PATTERN.test(suburb)) {
    errors.suburb = 'Use letters, numbers, spaces, and standard punctuation only.'
  }

  if (!password) {
    errors.password = 'Create a password.'
  } else if (password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.'
  } else if (password.length > 64) {
    errors.password = 'Password must be 64 characters or fewer.'
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must include at least one letter and one number.'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (confirmPassword.length > 64) {
    errors.confirmPassword = 'Confirmation must be 64 characters or fewer.'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export const validateLogin = (values) => {
  const errors = {}
  const email = asString(values?.email).trim()
  const password = asString(values?.password)

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (email.length > 100) {
    errors.email = 'Email must be 100 characters or fewer.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Enter your password.'
  } else if (password.length > 64) {
    errors.password = 'Password must be 64 characters or fewer.'
  }

  return errors
}
