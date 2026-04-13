export interface Lote {
    id: string;
    nome: string;
    quantidade: number;
    unidade: string;
    status: 'ativo' | 'alerta' | 'esgotado';
    dataEntrada: string;
    valorTotal: number;
}

export interface EstatisticasEstoque {
    totalLotes: number;
    itensEmAlerta: number;
    valorTotalEstoque: number;
}