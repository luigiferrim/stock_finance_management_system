import {
  validateEnum,
  validateNumber,
  validateOptionalDate,
  validateText,
} from "@/lib/security/validation"

export const LOT_CATEGORIES = ["Blend", "Single Origin"] as const
export const LOT_STATUSES = ["Encomendado", "Chegou", "Em Estoque", "Embalado", "Vendido"] as const

type LotCategory = (typeof LOT_CATEGORIES)[number]
type LotStatus = (typeof LOT_STATUSES)[number]

export type LotPayload = {
  name: string
  quantity: number
  costPrice: number
  salePrice: number
  supplier: string | null
  category: LotCategory
  variety: string | null
  process: string | null
  roastDate: Date | null
  status: LotStatus
}

export type LotUpdatePayload = {
  name?: string
  quantity?: number
  costPrice?: number
  salePrice?: number
  supplier?: string | null
  category?: LotCategory
  variety?: string | null
  process?: string | null
  roastDate?: Date | null
  status?: LotStatus
}

type ValidationResult<T> =
  | {
      valid: true
      value: T
    }
  | {
      valid: false
      error: string
    }

export function validateCreateLotPayload(body: Record<string, unknown>): ValidationResult<LotPayload> {
  const name = validateText(body.name, { field: "Nome", maxLength: 120, required: true })
  if (!name.valid) return name

  const quantity = validateNumber(body.quantity, "Quantidade", { min: 0.01 })
  if (!quantity.valid) return quantity

  const costPrice = validateNumber(body.costPrice, "Preço de compra", { min: 0 })
  if (!costPrice.valid) return costPrice

  const salePrice = validateNumber(body.salePrice, "Preço de venda", { min: 0 })
  if (!salePrice.valid) return salePrice

  const category = validateEnum(body.category, LOT_CATEGORIES, "Categoria")
  if (!category.valid) return category

  const status = body.status === undefined || body.status === "" ? { valid: true as const, value: "Em Estoque" as const } : validateEnum(body.status, LOT_STATUSES, "Status")
  if (!status.valid) return status

  const supplier = validateText(body.supplier, { field: "Fornecedor", maxLength: 120 })
  if (!supplier.valid) return supplier

  const variety = validateText(body.variety, { field: "Variedade", maxLength: 120 })
  if (!variety.valid) return variety

  const process = validateText(body.process, { field: "Processo", maxLength: 120 })
  if (!process.valid) return process

  const roastDate = validateOptionalDate(body.roastDate, "Data da torra")
  if (!roastDate.valid) return roastDate

  return {
    valid: true,
    value: {
      name: name.value ?? "",
      quantity: quantity.value ?? 0,
      costPrice: costPrice.value ?? 0,
      salePrice: salePrice.value ?? 0,
      supplier: supplier.value,
      category: category.value,
      variety: variety.value,
      process: process.value,
      roastDate: roastDate.value,
      status: status.value,
    },
  }
}

export function validateUpdateLotPayload(body: Record<string, unknown>): ValidationResult<LotUpdatePayload> {
  const payload: LotUpdatePayload = {}

  if ("name" in body) {
    const name = validateText(body.name, { field: "Nome", maxLength: 120, required: true })
    if (!name.valid) return name
    payload.name = name.value ?? ""
  }

  if ("quantity" in body) {
    const quantity = validateNumber(body.quantity, "Quantidade", { min: 0.01 })
    if (!quantity.valid) return quantity
    payload.quantity = quantity.value ?? 0
  }

  if ("costPrice" in body) {
    const costPrice = validateNumber(body.costPrice, "Preço de compra", { min: 0 })
    if (!costPrice.valid) return costPrice
    payload.costPrice = costPrice.value ?? 0
  }

  if ("salePrice" in body) {
    const salePrice = validateNumber(body.salePrice, "Preço de venda", { min: 0 })
    if (!salePrice.valid) return salePrice
    payload.salePrice = salePrice.value ?? 0
  }

  if ("supplier" in body) {
    const supplier = validateText(body.supplier, { field: "Fornecedor", maxLength: 120 })
    if (!supplier.valid) return supplier
    payload.supplier = supplier.value
  }

  if ("category" in body) {
    const category = validateEnum(body.category, LOT_CATEGORIES, "Categoria")
    if (!category.valid) return category
    payload.category = category.value
  }

  if ("variety" in body) {
    const variety = validateText(body.variety, { field: "Variedade", maxLength: 120 })
    if (!variety.valid) return variety
    payload.variety = variety.value
  }

  if ("process" in body) {
    const process = validateText(body.process, { field: "Processo", maxLength: 120 })
    if (!process.valid) return process
    payload.process = process.value
  }

  if ("roastDate" in body) {
    const roastDate = validateOptionalDate(body.roastDate, "Data da torra")
    if (!roastDate.valid) return roastDate
    payload.roastDate = roastDate.value
  }

  if ("status" in body) {
    const status = validateEnum(body.status, LOT_STATUSES, "Status")
    if (!status.valid) return status
    payload.status = status.value
  }

  if (Object.keys(payload).length === 0) {
    return {
      valid: false,
      error: "Nenhum campo válido informado",
    }
  }

  return {
    valid: true,
    value: payload,
  }
}
