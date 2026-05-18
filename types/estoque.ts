export type LoteStatus = "Encomendado" | "Chegou" | "Em Estoque" | "Embalado" | "Vendido";

export interface Lote {
    id: string;
    name: string;
    quantity: number;
    costPrice: number;
    salePrice: number;
    supplier: string | null;
    category: "Blend" | "Single Origin";
    variety: string | null;
    process: string | null;
    roastDate: string | null;
    entryDate: string;
    expiryDate: string | null;
    status: LoteStatus;
}

export interface EstatisticasEstoque {
    totalLots: number;
    totalCost: number;
    totalSaleValue: number;
    profitMargin: number;
    expiringLots: number;
}
