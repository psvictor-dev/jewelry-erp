/**
 * Importa histórico de vendas do Klavix (2022–abr/2026) para o ERP.
 * Requer: vendas_klavix.json na raiz do repositório (gerado localmente a partir do Firebird).
 * Roda no servidor de produção com Prisma direto (sem tocar em estoque).
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma    = new PrismaClient();
const ADMIN_ID  = 'd7a0f38e-ca82-47be-9e2a-90e12c11fa7b';

const PM_MAP: Record<number, string> = {
  1: 'DINHEIRO',
  2: 'CARTAO_CREDITO',
  3: 'DINHEIRO',
};

async function main() {
  const jsonPath = path.resolve(__dirname, '../../vendas_klavix.json');
  const vendas: any[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Carregadas ${vendas.length} vendas do JSON.\n`);

  // ── Pré-carregar produtos por SKU ───────────────────────────────────────
  const allProducts = await prisma.product.findMany({ select: { id: true, sku: true, costPrice: true } });
  const prodBySku   = new Map(allProducts.map(p => [p.sku, p]));

  // ── Pré-carregar clientes por nome ──────────────────────────────────────
  const allCustomers  = await prisma.customer.findMany({ select: { id: true, name: true } });
  const custByName    = new Map(allCustomers.map(c => [c.name.trim().toUpperCase(), c.id]));

  let ok = 0, skipped = 0, fail = 0;

  for (const v of vendas) {
    const paymentMethod = PM_MAP[v.formapg] ?? 'DINHEIRO';
    const data          = new Date(v.data);
    const customerId    = v.clienteNome
      ? (custByName.get((v.clienteNome as string).trim().toUpperCase()) ?? null)
      : null;

    const saleItems: { productId: string; quantity: number; unitPrice: number; costPrice: number; discount: number; total: number }[] = [];
    for (const it of v.itens) {
      const prod = prodBySku.get(it.sku);
      if (!prod) continue;
      const total = Math.round((it.unitPrice - it.discount) * it.qty * 100) / 100;
      saleItems.push({
        productId: prod.id,
        quantity:  it.qty,
        unitPrice: it.unitPrice,
        costPrice: Number(prod.costPrice) || it.costPrice || 0,
        discount:  it.discount,
        total,
      });
    }

    if (saleItems.length === 0) { skipped++; continue; }

    const totalVenda = Math.round(v.total * 100) / 100;

    try {
      await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            userId:        ADMIN_ID,
            customerId,
            paymentMethod: paymentMethod as any,
            status:        'ENTREGUE' as any,
            discount:      v.desconto,
            total:         totalVenda,
            notes:         v.obs ?? `Importado Klavix #${v.numvenda}`,
            data,
            paidAt:        data,
            items: { create: saleItems },
          },
        });

        await tx.transaction.create({
          data: {
            type:          'RECEITA' as any,
            status:        'PAGO' as any,
            category:      'VENDA' as any,
            description:   `Venda Klavix #${v.numvenda}`,
            amount:        totalVenda,
            dueDate:       data,
            paidAt:        data,
            paymentMethod: paymentMethod as any,
            saleId:        sale.id,
          },
        });
      });

      process.stdout.write(`✅ #${String(v.numvenda).padEnd(5)} ${data.toLocaleDateString('pt-BR')}  R$ ${totalVenda.toFixed(2).padStart(9)}  ${saleItems.length} item(s)\n`);
      ok++;
    } catch (e: any) {
      process.stdout.write(`❌ #${v.numvenda} — ${e.message}\n`);
      fail++;
    }
  }

  console.log(`\nConcluído: ${ok} vendas importadas, ${skipped} ignoradas (produtos não encontrados), ${fail} erros`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
