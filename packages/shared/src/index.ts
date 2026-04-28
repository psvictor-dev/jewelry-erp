// Tipos e constantes compartilhados entre apps

export enum UserRole {
  ADMIN      = 'ADMIN',
  GERENTE    = 'GERENTE',
  VENDEDOR   = 'VENDEDOR',
  ESTOQUISTA = 'ESTOQUISTA',
}

export enum StockMovementType {
  ENTRADA   = 'ENTRADA',
  SAIDA     = 'SAIDA',
  AJUSTE    = 'AJUSTE',
  DEVOLUCAO = 'DEVOLUCAO',
}

export enum ProductStatus {
  ATIVO       = 'ATIVO',
  INATIVO     = 'INATIVO',
  CONSIGNADO  = 'CONSIGNADO',
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
