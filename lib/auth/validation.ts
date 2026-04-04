const EMAIL_MAX_LENGTH = 254
const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 100
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function validateEmail(email: string) {
  if (!email || email.length > EMAIL_MAX_LENGTH) {
    return false
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateName(name: string) {
  const trimmedName = name.trim()

  return trimmedName.length >= NAME_MIN_LENGTH && trimmedName.length <= NAME_MAX_LENGTH
}

export function validatePasswordPolicy(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      message: `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres`,
    }
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      valid: false,
      message: "A senha deve conter pelo menos uma letra e um numero",
    }
  }

  return {
    valid: true,
    message: "",
  }
}
