-- Add new enum values (must be committed before they can be used)
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'RECEBIDO';
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'EM_PRODUCAO';
ALTER TYPE "SaleStatus" ADD VALUE IF NOT EXISTS 'ENTREGUE';
