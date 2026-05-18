type ValidationResult<T> =
  | {
      valid: true
      value: T
    }
  | {
      valid: false
      error: string
    }

type TextOptions = {
  field: string
  maxLength: number
  required?: boolean
}

export function validatePositiveInteger(value: unknown, field = "ID"): ValidationResult<number> {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return invalid(`${field} inválido`)
  }

  const parsed = Number(value)

  if (!Number.isSafeInteger(parsed)) {
    return invalid(`${field} inválido`)
  }

  return valid(parsed)
}

export function validateText(value: unknown, { field, maxLength, required = false }: TextOptions): ValidationResult<string | null> {
  if (value === undefined || value === null) {
    return required ? invalid(`${field} é obrigatório`) : valid(null)
  }

  if (typeof value !== "string") {
    return invalid(`${field} inválido`)
  }

  const trimmed = value.trim()

  if (required && trimmed.length === 0) {
    return invalid(`${field} é obrigatório`)
  }

  if (trimmed.length > maxLength) {
    return invalid(`${field} deve ter no máximo ${maxLength} caracteres`)
  }

  if (/[<>]/.test(trimmed)) {
    return invalid(`${field} não pode conter HTML`)
  }

  return valid(trimmed)
}

export function validateNumber(value: unknown, field: string, { min, required = true }: { min: number; required?: boolean }) {
  if (value === undefined || value === null || value === "") {
    return required ? invalid(`${field} é obrigatório`) : valid(null)
  }

  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN

  if (!Number.isFinite(parsed) || parsed < min) {
    return invalid(`${field} inválido`)
  }

  return valid(parsed)
}

export function validateEnum<T extends readonly string[]>(value: unknown, allowedValues: T, field: string): ValidationResult<T[number]> {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    return invalid(`${field} inválido`)
  }

  return valid(value)
}

export function validateOptionalDate(value: unknown, field: string): ValidationResult<Date | null> {
  if (value === undefined || value === null || value === "") {
    return valid(null)
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return invalid(`${field} inválida`)
  }

  const parsed = new Date(`${value}T00:00:00.000Z`)

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return invalid(`${field} inválida`)
  }

  return valid(parsed)
}

function valid<T>(value: T): ValidationResult<T> {
  return {
    valid: true,
    value,
  }
}

function invalid<T = never>(error: string): ValidationResult<T> {
  return {
    valid: false,
    error,
  }
}
