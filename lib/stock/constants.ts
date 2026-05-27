export const LOT_CATEGORIES = ["Blend", "Single Origin"] as const

export const LOT_STATUSES = ["Encomendado", "Chegou", "Em Estoque", "Embalado", "Vendido"] as const

export const DEFAULT_LOT_STATUS = "Em Estoque" as const

export const ACTIVE_LOT_STATUSES = ["Encomendado", "Chegou", DEFAULT_LOT_STATUS, "Embalado"] as const

export type LotCategory = (typeof LOT_CATEGORIES)[number]
export type LotStatus = (typeof LOT_STATUSES)[number]
