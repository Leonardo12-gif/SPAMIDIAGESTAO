export enum BudgetStatus {
  PENDING_APPROVAL = 'Aguardando Aprovação',
  APPROVED = 'Aprovado',
  REJECTED = 'Reprovado',
  IN_PRODUCTION = 'Em Produção',
  COMPLETED = 'Finalizado',
}

export enum PaymentMethod {
  CASH = 'À vista',
  CARD = 'Cartão',
  PIX = 'Pix',
  BOLETO_30 = 'Boleto 30 dias',
  BOLETO_28 = 'Boleto 28 dias',
  BOLETO_30_60 = 'Boleto 30/60 dias',
  INSTALLMENTS = 'Parcelado',
}

export interface Client {
  id: string;
  name: string;
  phone: string;
}

export interface Budget {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'm' | 'cm';
  };
  material: string;
  technique: string;
  complexity: 'Baixa' | 'Média' | 'Alta';
  productionDate: string;
  observations: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  
  // Calculated Costs
  inkConsumptionMl: number;
  inkCost: number;
  estimatedTotalCost: number; // Material + Ink + Labor
  finalPrice: number;

  status: BudgetStatus;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  
  // Finance specific
  boletoIssued?: boolean;
  boletoDueDate?: string;
  boletoPaid?: boolean;
}

export interface AppSettings {
  inkCostPerMl: number;
  inkConsumptionFactor: number; // ml per m2
  apiKey: string;
}