export const LOT_CATEGORIES = ["Blend", "Single Origin"] as const

export const LOT_STATUSES = ["Encomendado", "Chegou", "Em Estoque", "Embalado", "Vendido"] as const

export const DEFAULT_LOT_STATUS = "Em Estoque" as const

// Lotes ativos = ainda fazem parte do estoque (não vendidos). É o conjunto
// usado em toda a análise "potencial". "Vendido" é o único desfecho de saída.
export const ACTIVE_LOT_STATUSES = ["Encomendado", "Chegou", DEFAULT_LOT_STATUS, "Embalado"] as const

export const SOLD_LOT_STATUS = "Vendido" as const

// Agrupamento usado na UI: separa as etapas operacionais (o lote ainda é nosso)
// do desfecho de saída (o lote foi vendido integralmente). Um único campo
// `status` continua guardando o valor; o agrupamento é só apresentação.
export const LOT_STATUS_GROUPS = [
  {
    label: "Em processo",
    description: "O lote ainda faz parte do estoque",
    statuses: ACTIVE_LOT_STATUSES,
  },
  {
    label: "Saída",
    description: "Lote vendido integralmente (100%)",
    statuses: [SOLD_LOT_STATUS],
  },
] as const

export type LotCategory = (typeof LOT_CATEGORIES)[number]
export type LotStatus = (typeof LOT_STATUSES)[number]
