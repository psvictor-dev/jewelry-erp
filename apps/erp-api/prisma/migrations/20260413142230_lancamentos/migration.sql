-- CreateTable
CREATE TABLE "lancamentos_compra" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "preco" DECIMAL(12,2) NOT NULL,
    "cotacao" DECIMAL(10,4),
    "totalBrl" DECIMAL(12,2),
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos_acerto" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "cliente" TEXT NOT NULL,
    "cotacao" DECIMAL(10,4),
    "juros" DECIMAL(12,2) NOT NULL,
    "liquido" DECIMAL(12,2) NOT NULL,
    "obs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_acerto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos_venda" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "cliente" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "valorLiquido" DECIMAL(12,2),
    "formaPagamento" TEXT NOT NULL,
    "vendedor" TEXT,
    "obsVenda" TEXT,
    "cpfNf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_venda_pkey" PRIMARY KEY ("id")
);
