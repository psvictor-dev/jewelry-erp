import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_USER_ID = 'd7a0f38e-ca82-47be-9e2a-90e12c11fa7b';
const ENTRY_DATE   = new Date('2026-05-01T12:00:00.000Z');

const STOCK_DATA = [
  { sku: 'AL093/AT',      qty: 1 },
  { sku: 'ANF0001/A',     qty: 1 },
  { sku: 'ANF0016',       qty: 1 },
  { sku: 'ANF0017',       qty: 1 },
  { sku: 'ANF0020',       qty: 1 },
  { sku: 'ANF0028',       qty: 1 },
  { sku: 'ANF0034',       qty: 1 },
  { sku: 'ANF0036',       qty: 1 },
  { sku: 'ANF0037',       qty: 1 },
  { sku: 'ANF0038',       qty: 1 },
  { sku: 'ANF0039',       qty: 1 },
  { sku: 'BM0006/10',     qty: 1 },
  { sku: 'BM0007/5',      qty: 1 },
  { sku: 'BM0007/7',      qty: 1 },
  { sku: 'BM0007/9',      qty: 1 },
  { sku: 'BM0014',        qty: 1 },
  { sku: 'BM0015',        qty: 1 },
  { sku: 'BM0016',        qty: 1 },
  { sku: 'BM0016/15',     qty: 1 },
  { sku: 'BM0017',        qty: 1 },
  { sku: 'BM0018',        qty: 1 },
  { sku: 'BM0019',        qty: 1 },
  { sku: 'BM0020',        qty: 1 },
  { sku: 'BM0027',        qty: 1 },
  { sku: 'BM0027/P',      qty: 1 },
  { sku: 'BM0031',        qty: 1 },
  { sku: 'BM0034',        qty: 1 },
  { sku: 'BM0038',        qty: 1 },
  { sku: 'BM0038/14',     qty: 1 },
  { sku: 'BM0039',        qty: 1 },
  { sku: 'BM0040',        qty: 1 },
  { sku: 'BM0041',        qty: 1 },
  { sku: 'BM0042',        qty: 1 },
  { sku: 'BN0036/ARO',    qty: 1 },
  { sku: 'BN0036/ATOSW',  qty: 1 },
  { sku: 'BN0125',        qty: 1 },
  { sku: 'BNF0004',       qty: 1 },
  { sku: 'BNF0005',       qty: 1 },
  { sku: 'CO0003/A45',    qty: 1 },
  { sku: 'DIA0001,5',     qty: 7 },
  { sku: 'ESC0001',       qty: 1 },
  { sku: 'ESC0002',       qty: 1 },
  { sku: 'ESC0005',       qty: 1 },
  { sku: 'FF281-P',       qty: 1 },
  { sku: 'FFAR05R02',     qty: 1 },
  { sku: 'FFAR05R03',     qty: 1 },
  { sku: 'GM0010',        qty: 1 },
  { sku: 'GM0013',        qty: 1 },
  { sku: 'GM0014',        qty: 1 },
  { sku: 'GM0017',        qty: 1 },
  { sku: 'GM0022',        qty: 1 },
  { sku: 'GM0026',        qty: 1 },
  { sku: 'GM0028',        qty: 1 },
  { sku: 'GNF0003',       qty: 1 },
  { sku: 'GP0002',        qty: 1 },
  { sku: 'PM0008',        qty: 1 },
  { sku: 'PM0009',        qty: 1 },
  { sku: 'PM0012',        qty: 2 },
  { sku: 'PM0013',        qty: 2 },
  { sku: 'PM0015',        qty: 1 },
  { sku: 'PM0017',        qty: 1 },
  { sku: 'PM0019',        qty: 1 },
  { sku: 'PM0020',        qty: 1 },
  { sku: 'PM0027/G',      qty: 1 },
  { sku: 'PM0029',        qty: 3 },
  { sku: 'PM0035',        qty: 1 },
  { sku: 'PM0037',        qty: 1 },
  { sku: 'PM0038',        qty: 1 },
  { sku: 'PM0039',        qty: 1 },
  { sku: 'PM0040',        qty: 1 },
  { sku: 'PM0041',        qty: 1 },
  { sku: 'PM0042',        qty: 1 },
  { sku: 'PM0043',        qty: 1 },
  { sku: 'PM0044',        qty: 1 },
  { sku: 'PM0045',        qty: 1 },
  { sku: 'PM0046',        qty: 1 },
  { sku: 'PM0047',        qty: 1 },
  { sku: 'PM0048',        qty: 1 },
  { sku: 'PM0049',        qty: 1 },
  { sku: 'PM0050',        qty: 1 },
  { sku: 'PM0051',        qty: 1 },
  { sku: 'PM0052',        qty: 1 },
  { sku: 'PM0053',        qty: 1 },
  { sku: 'PM0054',        qty: 1 },
  { sku: 'PNF0004',       qty: 1 },
  { sku: 'PNF0004/B',     qty: 1 },
  { sku: 'PNF16888/ADP',  qty: 1 },
  { sku: 'PU0009',        qty: 1 },
  { sku: 'PU0011',        qty: 1 },
  { sku: 'PU0014',        qty: 1 },
  { sku: 'PU0015/2',      qty: 1 },
  { sku: 'PU0023',        qty: 1 },
  { sku: 'PU0030',        qty: 1 },
  { sku: 'PU0031',        qty: 1 },
  { sku: 'PU0034',        qty: 1 },
  { sku: 'SAN2988',       qty: 1 },
  { sku: 'W231',          qty: 1 },
  { sku: 'W770PP',        qty: 1 },
];

async function main() {
  console.log(`Atualizando estoque de ${STOCK_DATA.length} produtos (data: 01/05/2026)...\n`);
  let ok = 0, notFound = 0;

  for (const item of STOCK_DATA) {
    const product = await prisma.product.findUnique({ where: { sku: item.sku } });
    if (!product) {
      console.log(`⚠️  SKU não encontrado: ${item.sku}`);
      notFound++;
      continue;
    }

    await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId:  product.id,
          userId:     ADMIN_USER_ID,
          type:       'ENTRADA',
          quantity:   item.qty,
          reason:     'Estoque inicial (importação Klavix)',
          createdAt:  ENTRY_DATE,
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data:  { stock: { increment: item.qty } },
      }),
    ]);

    console.log(`✅ ${item.sku.padEnd(16)} +${item.qty}`);
    ok++;
  }

  console.log(`\nConcluído: ${ok} atualizados, ${notFound} não encontrados`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
