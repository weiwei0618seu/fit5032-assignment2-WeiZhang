const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export const validateRegistration = (values) => {
  const errors = {}
  const displayName = values.displayName.trim()
  const email = values.email.trim()
  const suburb = values.suburb.trim()

  if (!displayName) {
    errors.displayName = 'Enter your name.'
  } else if (displayName.length < 2) {
    errors.displayName = 'Name must contain at least 2 characters.'
  } else if (displayName.length > 50) {
    errors.displayName = 'Name must be 50 characters or fewer.'
  }

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, such as name@example.com.'
  } else if (email.length > 100) {
    errors.email = 'Email must be 100 characters or fewer.'
  }

  if (suburb.length > 50) {
    errors.suburb = 'Suburb must be 50 characters or fewer.'
  }

  if (!values.password) {
    errors.password = 'Create a password.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.'
  } else if (values.password.length > 64) {
    errors.password = 'Password must be 64 characters or fewer.'
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Password must include at least one letter and one number.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export const validateLogin = (values) => {
  const errors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Enter your password.'
  }

  return errors
}
