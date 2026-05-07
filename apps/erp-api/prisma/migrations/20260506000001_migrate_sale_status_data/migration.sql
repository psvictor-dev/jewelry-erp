-- Migrate existing data: PENDENTE → RECEBIDO, PAGO → ENTREGUE
UPDATE "sales" SET "status" = 'RECEBIDO'::"SaleStatus" WHERE "status" = 'PENDENTE'::"SaleStatus";
UPDATE "sales" SET "status" = 'ENTREGUE'::"SaleStatus" WHERE "status" = 'PAGO'::"SaleStatus";

-- Change column default
ALTER TABLE "sales" ALTER COLUMN "status" SET DEFAULT 'RECEBIDO'::"SaleStatus";
