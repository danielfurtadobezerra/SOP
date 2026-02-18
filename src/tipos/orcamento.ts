export type TipoOrcamento = "Obra de Edificação" | "Obra de Rodovias" | "Outros";
export type StatusOrcamento = "Aberto" | "Finalizado";
export type StatusMedicao = "Aberta" | "Validada";

export interface ItemOrcamento {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  accumulatedQuantity: number;
  budgetId: string;
}

export interface Orcamento {
  id: string;
  protocolNumber: string;
  type: TipoOrcamento;
  totalValue: number;
  createdAt: string;
  status: StatusOrcamento;
  items: ItemOrcamento[];
}

export interface ItemMedicao {
  id: string;
  measuredQuantity: number;
  totalMeasuredValue: number;
  budgetItemId: string;
  measurementId: string;
}

export interface Medicao {
  id: string;
  measurementNumber: string;
  date: string;
  value: number;
  status: StatusMedicao;
  observation: string;
  budgetId: string;
  items: ItemMedicao[];
}
