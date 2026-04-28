import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const d = (s: string): Date => {
  // dd.mm.yy -> Date
  const [dd, mm, yy] = s.split('.');
  return new Date(`20${yy}-${mm}-${dd}T12:00:00Z`);
};

async function main() {
  console.log('🚀 Iniciando importação...\n');

  // ─── CATEGORIAS ───────────────────────────────────────────────────
  const catNames = ['Brinco', 'Corrente', 'Diamante / Pedra', 'Pingente', 'Gargantilha', 'Piercing', 'Pulseira', 'Anel'];
  const cats: Record<string, string> = {};
  for (const name of catNames) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    cats[name] = c.id;
  }
  console.log(`✅ ${catNames.length} categorias criadas\n`);

  // ─── PRODUTOS / ESTOQUE ───────────────────────────────────────────
  const produtos = [
    { sku:'BM0012/A',     name:'BR LUA INFANTIL OA 18K',                          cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:576.00    },
    { sku:'BM0016',       name:'BR GOTA BOLEADA 10MM OA 18K',                     cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:1248.00   },
    { sku:'BM0016/15',    name:'BR GOTA BOLEADA 15MM OA 18K',                     cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:2892.00   },
    { sku:'BM0017',       name:'BR CRUZ MINI VENEZIANA OA 18K',                   cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:768.00    },
    { sku:'BM0042',       name:'BR ARGOLA PAVE DIAMANTES 68 0,9MM OA 18K',        cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:7848.00   },
    { sku:'BN0036/ARO',   name:'BR SOL RODOLITA 27 PONTOS OA 18K',                cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:663.20    },
    { sku:'BN0036/ATOSW', name:'BR SOL TO SW 27 PONTOS OA 18K',                   cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:660.00    },
    { sku:'BN0125',       name:'BR ESTRELA COM ESMERALDA OA 18K',                 cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:576.00    },
    { sku:'BP0016/A',     name:'BR SOL PE5 OA 18K',                               cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:480.00    },
    { sku:'CO0003/A45',   name:'CO ELO PORTUGUES G 2,4MM 45CM OA 18K',            cat:'Corrente',        mat:'Ouro Amarelo 18K', stock:1,  price:2640.00   },
    { sku:'DIA001.5',     name:'DIAMANTE 1,5MM - 1,5PTS',                         cat:'Diamante / Pedra',mat:'Diamante',         stock:7,  price:62.40     },
    { sku:'FF281-P',      name:'PINGENTE DIVINO PEQUENO OA 18K',                  cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:320.00    },
    { sku:'FFAR05R02',    name:'BR ARGOLA REDONDA 1,3CM OA 18K',                  cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:816.00    },
    { sku:'FFAR05R03',    name:'BR ARGOLA REDONDA 1,5CM OA 18K',                  cat:'Brinco',          mat:'Ouro Amarelo 18K', stock:1,  price:936.00    },
    { sku:'GM0027',       name:'GA MANUS VOVO 4 NETOS OA 18K',                    cat:'Gargantilha',     mat:'Ouro Amarelo 18K', stock:1,  price:3744.00   },
    { sku:'GP0002',       name:'GA PE ARROZ 3,5MM 40CM OA 18K',                   cat:'Gargantilha',     mat:'Ouro Amarelo 18K', stock:1,  price:1800.00   },
    { sku:'PIE15328/A',   name:'PIERCING NARIZ ARG OA 18K',                       cat:'Piercing',        mat:'Ouro Amarelo 18K', stock:1,  price:280.64    },
    { sku:'PM0001/A',     name:'PI PLACA RETANGULAR 20MM-4MM OA 18K',             cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:-2, price:900.00    },
    { sku:'PM0012',       name:'PING MED OV GRACAS PQ OA 18K',                    cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:2,  price:960.00    },
    { sku:'PM0013',       name:'PI LETRA INICIAL MADRE PEROLA OA 18K',            cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:2,  price:432.00    },
    { sku:'PM0015',       name:'PI CRUZ 16MM MEIO A MEIO VAZADO OA 18K',          cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:324.00    },
    { sku:'PM0027/G',     name:'PI GOTA VAZADA COM BOLINHAS 13MM OA 18K',         cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:804.00    },
    { sku:'PM0038',       name:'PING MENINO MADREPEROLA OA 18K',                  cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:420.00    },
    { sku:'PM0039',       name:'PING MENINO MADREPEROLA OA 18K',                  cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:420.00    },
    { sku:'PM0054',       name:'PI MENINA LASER OA 18K',                          cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:780.00    },
    { sku:'PMW212P/A',    name:'PI FIGA PQ AO 18K',                               cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:408.00    },
    { sku:'PNF0004',      name:'PI LETRA MALAQUITA 16MM OA 18K',                  cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:3132.00   },
    { sku:'PNF0004/B',    name:'PI LETRA ONIX 16MM OB 18K',                       cat:'Pingente',        mat:'Ouro Branco 18K',  stock:1,  price:3132.00   },
    { sku:'PNF16888/ADP', name:'PI CO8-DP RAINBOW VAZ OA 18K',                    cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:2128.00   },
    { sku:'PU0002/A',     name:'PU BOLA 3MM INFANTIL OA 18K',                     cat:'Pulseira',        mat:'Ouro Amarelo 18K', stock:1,  price:852.00    },
    { sku:'PU0015/2',     name:'PU CHAPA QUADRADA OA 18K',                        cat:'Pulseira',        mat:'Ouro Amarelo 18K', stock:1,  price:960.00    },
    { sku:'PU0023',       name:'PU RIVIERA TURMALINA NEGRA 50PTS OB 18K',         cat:'Pulseira',        mat:'Ouro Branco 18K',  stock:1,  price:30000.00  },
    { sku:'PU0025',       name:'PU DE MAO 3 DIA 1,5MM OA 18K',                   cat:'Pulseira',        mat:'Ouro Amarelo 18K', stock:1,  price:3108.00   },
    { sku:'SAN2988',      name:'AN FININHO MN 1/2 BOLINHAS OA 18K',               cat:'Anel',            mat:'Ouro Amarelo 18K', stock:1,  price:1152.00   },
    { sku:'W231',         name:'PINGENTE AGNUS DEI PEQUENO 18K',                  cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:696.00    },
    { sku:'W770PP',       name:'PING MENINO CABECUDO VAZADO OA 18K',              cat:'Pingente',        mat:'Ouro Amarelo 18K', stock:1,  price:576.00    },
  ];

  let prodCount = 0;
  for (const p of produtos) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { stock: p.stock, salePrice: p.price },
      create: {
        sku:        p.sku,
        name:       p.name,
        material:   p.mat,
        costPrice:  0,
        salePrice:  p.price,
        stock:      p.stock,
        minStock:   1,
        categoryId: cats[p.cat],
        status:     'ATIVO',
      },
    });
    prodCount++;
  }
  console.log(`✅ ${prodCount} produtos cadastrados\n`);

  // ─── COMPRAS ──────────────────────────────────────────────────────
  const compras = [
    { data:'12.03.26', fornecedor:'A&B METAIS',      modelo:'BP0020',                  quantidade:1, moeda:'AU', preco:1.20,  cotacao:790, obs:'' },
    { data:'18.03.26', fornecedor:'SALATIEL',         modelo:'AL021/3,5',               quantidade:2, moeda:'AU', preco:1.42,  cotacao:570, obs:'' },
    { data:'20.03.26', fornecedor:'BERNARDO 6060',    modelo:'PM0001',                  quantidade:2, moeda:'AU', preco:0.50,  cotacao:750, obs:'0,50 AU cada' },
    { data:'20.03.26', fornecedor:'A&B METAIS',       modelo:'GM0027 + PM0054',         quantidade:1, moeda:'AU', preco:3.264, cotacao:730, obs:'3,43 + 0,65 com 20% de desconto' },
    { data:'20.03.26', fornecedor:'A&B METAIS',       modelo:'ACE0003',                 quantidade:1, moeda:'AU', preco:0.34,  cotacao:730, obs:'Pedras compradas em Felipe Cravador' },
    { data:'20.03.26', fornecedor:'FELIPE CRAVADOR',  modelo:'DIA0001/1,5',             quantidade:7, moeda:'AU', preco:0.51,  cotacao:800, obs:'0,51 AU cada (7 diamantes)' },
    { data:'25.03.26', fornecedor:'SALATIEL',         modelo:'A025 + AL067',            quantidade:1, moeda:'AU', preco:2.49,  cotacao:570, obs:'A025: 1,07 AU / AL067: 1,42 AU' },
    { data:'27.03.26', fornecedor:'A&B METAIS',       modelo:'PIE0002',                 quantidade:1, moeda:'AU', preco:0.456, cotacao:730, obs:'0,57 AU com 20% de desconto' },
    { data:'01.04.26', fornecedor:'A&B METAIS',       modelo:'PU0024',                  quantidade:1, moeda:'AU', preco:1.256, cotacao:730, obs:'1,57 AU com 20% de desconto' },
    { data:'01.04.26', fornecedor:'RELONORTE 5757',   modelo:'PM0055 + PU0022 + PM0013',quantidade:1, moeda:'AU', preco:1.74,  cotacao:810, obs:'PM0055: 0,33 / PU0022: 1,05 / PM0013: 0,36' },
    { data:'13.04.26', fornecedor:'SALATIEL',         modelo:'AL047/1,5 + A025 + AL057',quantidade:7, moeda:'AU', preco:0,     cotacao:570, obs:'AL047/1,5: 1un / A025: 4un / AL057: 2un — preço a confirmar' },
  ];

  for (const c of compras) {
    const totalBrl = c.moeda !== 'BRL' && c.preco > 0 && c.cotacao > 0
      ? c.preco * c.quantidade * c.cotacao
      : c.preco * c.quantidade;
    await prisma.lancamentoCompra.create({
      data: {
        data:       d(c.data),
        fornecedor: c.fornecedor,
        modelo:     c.modelo,
        quantidade: c.quantidade,
        moeda:      c.moeda,
        preco:      c.preco,
        cotacao:    c.cotacao || null,
        totalBrl:   totalBrl,
        obs:        c.obs || null,
      },
    });
  }
  console.log(`✅ ${compras.length} compras lançadas\n`);

  // ─── VENDAS ───────────────────────────────────────────────────────
  const vendas = [
    { data:'13.03.26', cliente:'Suely Ferreira Sobral',   modelo:'PIE0002',              quantidade:1, valor:1080.00, valorLiquido:1080.00, formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'',                                      cpfNf:'NÃO' },
    { data:'17.03.26', cliente:'Mateus Barbosa',           modelo:'AL021/3,5',            quantidade:2, valor:3880.00, valorLiquido:3621.00, formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'A vista',                               cpfNf:'NÃO' },
    { data:'19.03.26', cliente:'Danielle Aguiar',          modelo:'BP0105 + PU0024',      quantidade:1, valor:3145.00, valorLiquido:2670.00, formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'PIX | Brinco 545,00 + Pulseira 2.600,00', cpfNf:'NÃO' },
    { data:'20.03.26', cliente:'Enny Vieira',              modelo:'PM0001',               quantidade:2, valor:1.80,   valorLiquido:1.80,   formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'Cliente atacado — 0,90 AU cada',        cpfNf:'NÃO' },
    { data:'20.03.26', cliente:'Eduardo Arruda',           modelo:'AL093 + AL032/3,5',    quantidade:1, valor:6120.00, valorLiquido:6120.00, formaPagamento:'Cartão de Crédito', vendedor:'Vinícius', obsVenda:'CC 5x',                                 cpfNf:'SIM' },
    { data:'20.03.26', cliente:'Carol Laroche',            modelo:'ACE0003',              quantidade:1, valor:1699.00, valorLiquido:1699.00, formaPagamento:'Cartão de Crédito', vendedor:'Vinícius', obsVenda:'',                                      cpfNf:'SIM' },
    { data:'25.03.26', cliente:'Eunice Baade',             modelo:'PM0054',               quantidade:1, valor:800.00,  valorLiquido:638.00,  formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'',                                      cpfNf:'NÃO' },
    { data:'01.04.26', cliente:'Laryane Belfort',          modelo:'PM0001',               quantidade:1, valor:1200.00, valorLiquido:1080.00, formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'Desconto direto na venda — sem nota',   cpfNf:'NÃO' },
    { data:'01.04.26', cliente:'Ana Teresa Mousinho',      modelo:'PM0055 + PU0022',      quantidade:1, valor:2400.00, valorLiquido:2400.00, formaPagamento:'Cartão de Crédito', vendedor:'Vinícius', obsVenda:'PM0055: R$600 / PU0022: R$1.800',       cpfNf:'SIM' },
    { data:'06.04.26', cliente:'Ivanielly',                modelo:'CO15587/A45 + PM0013', quantidade:1, valor:2230.00, valorLiquido:2230.00, formaPagamento:'Cartão de Crédito', vendedor:'Vinícius', obsVenda:'CC 6x - link',                          cpfNf:'SIM' },
    { data:'09.04.26', cliente:'Enny Vieira',              modelo:'PM0001',               quantidade:1, valor:0.90,   valorLiquido:null,    formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'Cliente atacado — AU',                  cpfNf:'NÃO' },
    { data:'09.04.26', cliente:'Leaf Joias',               modelo:'AL047/1,5',            quantidade:1, valor:4.95,   valorLiquido:4.95,   formaPagamento:'A VISTA',           vendedor:'Vinícius', obsVenda:'Cliente atacado — OF',                  cpfNf:'NÃO' },
    { data:'10.04.26', cliente:'Guilherme Godoy',          modelo:'VE02000/A40',          quantidade:1, valor:2100.00, valorLiquido:2100.00, formaPagamento:'Cartão de Crédito', vendedor:'Vinícius', obsVenda:'CC 4x',                                 cpfNf:'SIM' },
  ];

  for (const v of vendas) {
    await prisma.lancamentoVenda.create({
      data: {
        data:           d(v.data),
        cliente:        v.cliente,
        modelo:         v.modelo,
        quantidade:     v.quantidade,
        valor:          v.valor,
        valorLiquido:   v.valorLiquido ?? null,
        formaPagamento: v.formaPagamento,
        vendedor:       v.vendedor,
        obsVenda:       v.obsVenda || null,
        cpfNf:          v.cpfNf,
      },
    });
  }
  console.log(`✅ ${vendas.length} vendas lançadas\n`);

  // ─── ACERTOS ──────────────────────────────────────────────────────
  const acertos = [
    { data:'13.03.26', cliente:'Suely Sobral',       cotacao:null, juros:0,      liquido:1080.00, obs:'' },
    { data:'17.03.26', cliente:'Mateus Barbosa',     cotacao:null, juros:0,      liquido:2296.00, obs:'Restante na entrega' },
    { data:'20.03.26', cliente:'Danielle Aguiar',    cotacao:null, juros:0,      liquido:1335.00, obs:'Restante dia 30' },
    { data:'20.03.26', cliente:'Danielle Aguiar',    cotacao:null, juros:0,      liquido:1335.00, obs:'Segunda parcela — saldo zerado após ajuste da venda' },
    { data:'09.04.26', cliente:'Ana Terese Mousinho',cotacao:null, juros:260.20, liquido:2139.80, obs:'' },
    { data:'10.04.26', cliente:'Guilherme Godoy',    cotacao:null, juros:141.56, liquido:1958.44, obs:'' },
  ];

  for (const a of acertos) {
    await prisma.lancamentoAcerto.create({
      data: {
        data:    d(a.data),
        cliente: a.cliente,
        cotacao: a.cotacao,
        juros:   a.juros,
        liquido: a.liquido,
        obs:     a.obs || null,
      },
    });
  }
  console.log(`✅ ${acertos.length} acertos lançados\n`);

  // ─── RESUMO ───────────────────────────────────────────────────────
  const [tp, tc, tv, ta] = await Promise.all([
    prisma.product.count(),
    prisma.lancamentoCompra.count(),
    prisma.lancamentoVenda.count(),
    prisma.lancamentoAcerto.count(),
  ]);

  console.log('═══════════════════════════════════');
  console.log('📊 RESUMO FINAL:');
  console.log(`   🏷️  Produtos:  ${tp}`);
  console.log(`   📦 Compras:   ${tc}`);
  console.log(`   💰 Vendas:    ${tv}`);
  console.log(`   🔄 Acertos:   ${ta}`);
  console.log('═══════════════════════════════════');
}

main()
  .catch(e => { console.error('❌ Erro:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
