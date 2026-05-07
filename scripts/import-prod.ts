import axios from 'axios';

const BASE = 'http://localhost:3000';

const produtos = [
  // Estoque Central
  { sku: 'AL001',         name: 'AL ANAT. TRAD. M-CANA 4MM OA 18K',                        stock:  1,   salePrice:  2639.12, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'AL032/3,5',    name: 'AL ANAT. M-CANA 3,5MM OA 18K',                             stock: -1,   salePrice:  3283.20, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'AL093',         name: 'AL ANAT. TRAD. M-CANA 3MM 3GR 750 18K',                   stock: -1,   salePrice:  2455.46, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'AL093/AT',     name: 'AL ANAT. TRAD. M-CANA 3MM OA 18K',                         stock:  1,   salePrice:  2192.96, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BM0012/A',     name: 'BR LUA INFANTIL OA 18K',                                   stock:  1,   salePrice:   576.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BM0016',        name: 'BR GOTA BOLEADA 10MM OA 18K',                             stock:  1,   salePrice:  1248.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BM0016/15',    name: 'BR GOTA BOLEADA 15MM OA 18K',                              stock:  1,   salePrice:  2892.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BM0017',        name: 'BR CRUZ MINI VENEZIANA OA 18K',                           stock:  0.5, salePrice:   768.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BM0042',        name: 'BR ARGOLA PAVE DIAMANTES 68 0,9MM OA 18K',                stock:  1,   salePrice:  7848.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BN0036/ARO',   name: 'BR SOL RODOLITA 27 PONTOS OA 18K',                         stock:  1,   salePrice:   663.20, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BN0036/ATOSW', name: 'BR SOL TO SW 27 PONTOS OA 18K',                            stock:  1,   salePrice:   660.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BN0125',        name: 'BR ESTRELA COM ESMERALDA OA 18K',                         stock:  1,   salePrice:   576.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'BP0016/A',     name: 'BR SOL PE5 OA 18K',                                        stock:  1,   salePrice:   480.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'CO0003/A45',   name: 'CO ELO PORTUGUES G - 2,4MM 45CM OA 18K',                   stock:  1,   salePrice:  2640.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'DIA0001,5',    name: 'DIAMANTE 1,5MM - 1,5PTS',                                  stock:  7,   salePrice:    62.40, material: 'Diamante',         status: 'ATIVO' },
  { sku: 'FF281-P',       name: 'PINGENTE DIVINO PEQUENO 18K',                              stock:  1,   salePrice:   320.00, material: 'Ouro 18K',         status: 'ATIVO' },
  { sku: 'FFAR05R02',    name: 'BR ARGOLA REDONDA 1,3CM OA 18K',                            stock:  1,   salePrice:   816.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'FFAR05R03',    name: 'BR ARGOLA REDONDA 1,5CM OA 18K',                            stock:  0.5, salePrice:   936.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'GP0002',        name: 'GA PE ARROZ 3,5MM 40CM OA 18K',                           stock:  1,   salePrice:  1800.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PIE15328/A',   name: 'PIERCING NARIZ ARG OA 18K',                                 stock:  1,   salePrice:   280.64, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0001/A',     name: 'PI PLACA RETANGULAR 20MM-4MM OA 18K',                       stock: -2,   salePrice:   900.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0012',        name: 'PING MED OV GRACAS PQ OA 18K',                            stock:  2,   salePrice:   960.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0013',        name: 'PI LETRA INICIAL MADRE PEROLA OA 18K',                    stock:  2,   salePrice:   432.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0015',        name: 'PI CRUZ 16MM DETALHE MEIO A MEIO VAZADO OA 18K',          stock:  1,   salePrice:   324.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0027/G',     name: 'PI GOTA VAZADA COM BOLINHAS 13MM OA 18K',                   stock:  1,   salePrice:   804.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0038',        name: 'PING MENINO MADREPEROLA OA 18K',                          stock:  1,   salePrice:   420.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0039',        name: 'PING MENINO MADREPEROLA OA 18K',                          stock:  1,   salePrice:   420.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0054',        name: 'PI MENINA LASER OA 18K',                                  stock:  1,   salePrice:   780.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PM0056',        name: 'PI CORACAO 12MM PERSONALIZADO LASER OA 18K',              stock: -1,   salePrice:   600.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PMW212P/A',    name: 'PI FIGA PQ AO 18K',                                         stock:  1,   salePrice:   408.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PNF0004',       name: 'PI LETRA MALAQUITA 16MM OA 18K',                          stock:  1,   salePrice:  3132.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PNF0004/B',    name: 'PI LETRA ONIX 16MM OB 18K',                                stock:  1,   salePrice:  3132.00, material: 'Ouro Branco 18K',  status: 'ATIVO' },
  { sku: 'PNF16888/ADP', name: 'PI CO8-DP RAINBOW VAZ OA 18K',                             stock:  1,   salePrice:  2128.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PU0002/A',     name: 'PU BOLA 3MM INFANTIL OA 18K',                               stock:  1,   salePrice:   852.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PU0015/2',     name: 'PU CHAPA QUADRADA OA 18K',                                  stock:  1,   salePrice:   960.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'PU0023',        name: 'PU RIVIERA TURMALINA NEGRA 50 PTS OB 18K',                stock:  1,   salePrice: 30000.00, material: 'Ouro Branco 18K',  status: 'ATIVO' },
  { sku: 'PU0025/CTC',   name: 'PU DE MAO 3 DIAMANTES CO CARTIER 1,5MM OA 18K',            stock: -1,   salePrice:  3108.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'SAN2988',       name: 'AN FININHO MN 1/2 BOLINHAS OA 18K',                       stock:  1,   salePrice:  1152.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  { sku: 'W231',          name: 'PINGENTE AGNUS DEI PEQUENO 18K',                           stock:  1,   salePrice:   696.00, material: 'Ouro 18K',         status: 'ATIVO' },
  { sku: 'W770PP',        name: 'PING MENINO CABECUDO VAZADO OA 18K',                       stock:  1,   salePrice:   576.00, material: 'Ouro Amarelo 18K', status: 'ATIVO' },
  // Consignado A&B
  { sku: 'ANF0034',       name: 'AN 2 PEROLAS 2 DIA OA 18K',                               stock:  1,   salePrice:  4082.99, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
  { sku: 'BM0031',        name: 'BR TOPAZIO SKY OVAL 6X8 40 DIAMANTES OA 18K',             stock:  1,   salePrice: 10488.00, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
  { sku: 'BM0034',        name: 'BR INICIAIS COM CARTIER PENDURADA OA 18K',                stock:  1,   salePrice:  1260.00, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
  { sku: 'BM0041',        name: 'BR SOLITARIO DIA 20PTS OA 18K',                           stock:  1,   salePrice:  5520.00, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
  { sku: 'GM0026',        name: 'GA 11 CORACOES 6,5MM OA 18K',                             stock:  1,   salePrice:  4584.00, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
  { sku: 'GM0028',        name: 'GA N S DAS GRACAS TOPAZIO BRANCO TURMALINA ROSA OA 18K', stock:  1,   salePrice:  6876.00, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
  { sku: 'PU0031',        name: 'PU PL CART MI INFINITO OA 18K',                           stock:  1,   salePrice:  2136.00, material: 'Ouro Amarelo 18K', status: 'CONSIGNADO', fornecedorNome: 'A&B' },
];

async function main() {
  const { data: auth } = await axios.post(`${BASE}/auth/login`, {
    email: 'admin@erp-joalheria.com',
    password: 'Admin@2024',
  });
  const headers = { Authorization: `Bearer ${auth.access_token}` };

  // Cria fornecedor A&B se não existir
  const { data: fornecedores } = await axios.get(`${BASE}/suppliers`, { headers });
  if (!fornecedores.find((f: any) => f.name === 'A&B')) {
    await axios.post(`${BASE}/suppliers`, { name: 'A&B', notes: 'Consignado' }, { headers });
    console.log('Fornecedor A&B criado');
  }

  let ok = 0, fail = 0;
  for (const p of produtos) {
    try {
      await axios.post(`${BASE}/products`, {
        ...p, costPrice: 0, moedaCompra: 'AU', tipoProduto: 'PRODUTO', vendido: true, estocado: true,
      }, { headers });
      console.log(`✅ ${p.sku}`);
      ok++;
    } catch (e: any) {
      console.error(`❌ ${p.sku} — ${e.response?.data?.message ?? e.message}`);
      fail++;
    }
  }
  console.log(`\nConcluído: ${ok} criados, ${fail} erros`);
}

main();
