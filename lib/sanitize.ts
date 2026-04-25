export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .trim()
    .substring(0, 1000) // Limita tamanho
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .substring(0, 255)
}

export function sanitizeNumber(input: any): number | null {
  const num = Number.parseFloat(input)
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return null
  }
  return num
}

export function sanitizeInteger(input: any, min?: number, max?: number): number | null {
  const num = Number.parseInt(input, 10)
  if (Number.isNaN(num)) {
    return null
  }
  
  if (min !== undefined && num < min) {
    return null
  }
  
  if (max !== undefined && num > max) {
    return null
  }
  
  return num
}
