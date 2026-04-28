import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed Fase 2...');

  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: 'Anéis' },     update: {}, create: { name: 'Anéis',     description: 'Anéis e solitários' } }),
    prisma.category.upsert({ where: { name: 'Colares' },   update: {}, create: { name: 'Colares',   description: 'Colares e correntes' } }),
    prisma.category.upsert({ where: { name: 'Brincos' },   update: {}, create: { name: 'Brincos',   description: 'Brincos e argolas' } }),
    prisma.category.upsert({ where: { name: 'Pulseiras' }, update: {}, create: { name: 'Pulseiras', description: 'Pulseiras e braceletes' } }),
    prisma.category.upsert({ where: { name: 'Alianças' },  update: {}, create: { name: 'Alianças',  description: 'Alianças e aparadores' } }),
  ]);

  const hash = await bcrypt.hash('Admin@2024', 12);
  await prisma.user.upsert({
    where:  { email: 'admin@erp-joalheria.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@erp-joalheria.com', password: hash, role: UserRole.ADMIN },
  });
  await prisma.user.upsert({
    where:  { email: 'vendedor@erp-joalheria.com' },
    update: {},
    create: { name: 'Vendedor Demo', email: 'vendedor@erp-joalheria.com', password: await bcrypt.hash('Vendedor@2024', 12), role: UserRole.VENDEDOR },
  });

  const products = [
    { sku:'AN-001', serialNumber:'SN-AN-001', name:'Anel Solitário Ouro 18k',        material:'Ouro 18k', stones:'Diamante 0.30ct', weightGrams:4.5,  purityKarats:18, color:'Amarelo', costPrice:1800, salePrice:3200, stock:3, categoryId:cats[0].id },
    { sku:'AN-002', serialNumber:'SN-AN-002', name:'Anel Aparador Ouro Branco 18k',  material:'Ouro 18k', stones:'Diamantes laterais', weightGrams:3.2, purityKarats:18, color:'Branco', costPrice:1200, salePrice:2400, stock:5, categoryId:cats[0].id },
    { sku:'CO-001', serialNumber:'SN-CO-001', name:'Colar Veneziana Ouro 18k 45cm',  material:'Ouro 18k', stones:null,              weightGrams:6.0,  purityKarats:18, color:'Amarelo', costPrice:2100, salePrice:3800, stock:2, categoryId:cats[1].id },
    { sku:'BR-001', serialNumber:'SN-BR-001', name:'Brinco Argola Ouro Rosé 18k',    material:'Ouro 18k', stones:null,              weightGrams:2.8,  purityKarats:18, color:'Rosé',    costPrice:980,  salePrice:1800, stock:8, categoryId:cats[2].id },
    { sku:'PU-001', serialNumber:'SN-PU-001', name:'Pulseira Elos Ouro 18k 19cm',    material:'Ouro 18k', stones:null,              weightGrams:8.5,  purityKarats:18, color:'Amarelo', costPrice:2800, salePrice:5200, stock:4, categoryId:cats[3].id },
    { sku:'AL-001', serialNumber:'SN-AL-001', name:'Aliança Conforto Ouro 18k 5mm',  material:'Ouro 18k', stones:null,              weightGrams:5.5,  purityKarats:18, color:'Amarelo', costPrice:1500, salePrice:2800, stock:12, categoryId:cats[4].id },
    { sku:'AL-002', serialNumber:'SN-AL-002', name:'Aliança Mista Ouro 18k 4mm',     material:'Ouro 18k', stones:null,              weightGrams:4.2,  purityKarats:18, color:'Branco',  costPrice:1300, salePrice:2400, stock:10, categoryId:cats[4].id },
  ];
  for (const p of products) {
    const { costPrice, salePrice, weightGrams, ...rest } = p;
    await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: { ...rest, costPrice, salePrice, weightGrams, visibleOnSite: true } });
  }

  // Clientes demo
  const customers = [
    { name:'Maria Silva',    email:'maria@email.com',   phone:'81999990001', cpf:'111.111.111-01' },
    { name:'João Santos',    email:'joao@email.com',    phone:'81999990002', cpf:'222.222.222-02' },
    { name:'Ana Oliveira',   email:'ana@email.com',     phone:'81999990003', cpf:'333.333.333-03' },
    { name:'Carlos Pereira', email:'carlos@email.com',  phone:'81999990004', cpf:'444.444.444-04' },
  ];
  for (const c of customers) {
    await prisma.customer.upsert({ where: { email: c.email }, update: {}, create: c });
  }

  // Transações demo
  const now = new Date();
  const mes = (d: number) => new Date(now.getFullYear(), now.getMonth(), d);

  await prisma.transaction.createMany({ skipDuplicates: true, data: [
    { type:'RECEITA', status:'PAGO',     category:'VENDA',          description:'Venda #001 - Anel Solitário',        amount:3200, dueDate:mes(2),  paidAt:mes(2),  paymentMethod:'PIX' },
    { type:'RECEITA', status:'PAGO',     category:'VENDA',          description:'Venda #002 - Aliança Conforto x2',   amount:5600, dueDate:mes(5),  paidAt:mes(5),  paymentMethod:'CARTAO_CREDITO' },
    { type:'RECEITA', status:'PENDENTE', category:'VENDA',          description:'Venda #003 - Colar Veneziana',       amount:3800, dueDate:mes(20) },
    { type:'DESPESA', status:'PAGO',     category:'COMPRA_ESTOQUE', description:'Compra ouro - Fornecedor Goldex',    amount:8500, dueDate:mes(1),  paidAt:mes(1),  paymentMethod:'PIX' },
    { type:'DESPESA', status:'PAGO',     category:'ALUGUEL',        description:'Aluguel loja - Abril',               amount:3200, dueDate:mes(5),  paidAt:mes(5),  paymentMethod:'DINHEIRO' },
    { type:'DESPESA', status:'PENDENTE', category:'SALARIO',        description:'Salários - Abril',                   amount:6000, dueDate:mes(30) },
    { type:'DESPESA', status:'PENDENTE', category:'IMPOSTOS',       description:'DAS - Simples Nacional Abril',       amount:1200, dueDate:mes(20) },
    { type:'DESPESA', status:'PAGO',     category:'MANUTENCAO',     description:'Manutenção vitrine',                 amount:450,  dueDate:mes(8),  paidAt:mes(8),  paymentMethod:'DINHEIRO' },
  ]});

  console.log('✅ Seed Fase 2 concluído!');
  console.log('   👤 admin@erp-joalheria.com / Admin@2024');
  console.log('   👤 vendedor@erp-joalheria.com / Vendedor@2024');
  console.log('   👥 4 clientes demo');
  console.log('   💰 8 transações financeiras demo');
}

main().catch(console.error).finally(() => prisma.$disconnect());
