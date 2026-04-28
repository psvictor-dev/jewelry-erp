/*
  Warnings:

  - You are about to alter the column `stock` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `minStock` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "codigoFornecedor" TEXT,
ADD COLUMN     "comprado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "custoMedio" DECIMAL(12,2),
ADD COLUMN     "estocado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fatorConversao" DECIMAL(10,4) DEFAULT 1,
ADD COLUMN     "favorito" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fornecedorCodigo" TEXT,
ADD COLUMN     "fornecedorNome" TEXT,
ADD COLUMN     "grupoProdutos" TEXT,
ADD COLUMN     "kitVenda" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "markup" DECIMAL(10,4),
ADD COLUMN     "markup2" DECIMAL(10,4),
ADD COLUMN     "mercadoAlvo" TEXT,
ADD COLUMN     "moedaCompra" TEXT DEFAULT 'AU',
ADD COLUMN     "pdv" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preco2" DECIMAL(12,2),
ADD COLUMN     "precoMoeda" DECIMAL(12,4),
ADD COLUMN     "produzido" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subgrupoProdutos" TEXT,
ADD COLUMN     "tamanho" TEXT,
ADD COLUMN     "tipoProduto" TEXT DEFAULT 'PRODUTO',
ADD COLUMN     "unCompra" TEXT DEFAULT 'UN',
ADD COLUMN     "unEstoque" TEXT DEFAULT 'UN',
ADD COLUMN     "unidadePeso" TEXT DEFAULT 'GR',
ADD COLUMN     "usadoParaCompor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "valorAu" DECIMAL(12,2),
ADD COLUMN     "valorCompraAu" DECIMAL(12,4),
ADD COLUMN     "vendido" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "stock" SET DEFAULT 0,
ALTER COLUMN "stock" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "minStock" SET DEFAULT 1,
ALTER COLUMN "minStock" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
