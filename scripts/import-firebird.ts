import Firebird from 'node-firebird';
import axios from 'axios';

const FB_CONFIG = {
  host: '127.0.0.1',
  port: 3050,
  database: '/db/eternity.gdl',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: true,
};

const ERP_BASE = 'https://erp.eternityjoias.com.br/api';

function query(db: any, sql: string): Promise<any[]> {
  return new Promise((resolve, reject) =>
    db.query(sql, [], (err: any, result: any) => err ? reject(err) : resolve(result ?? [])),
  );
}

function connect(): Promise<any> {
  return new Promise((resolve, reject) =>
    Firebird.attach(FB_CONFIG, (err: any, db: any) => err ? reject(err) : resolve(db)),
  );
}

async function main() {
  console.log('Conectando ao Firebird...');
  const db = await connect();
  console.log('Conectado!\n');

  // ── 1. Autenticar no ERP ─────────────────────────────────────────────────
  const { data: auth } = await axios.post(`${ERP_BASE}/auth/login`, {
    email: 'admin@eternityjoias.com.br',
    password: 'admin@2025',
  });
  const headers = { Authorization: `Bearer ${auth.access_token}` };
  console.log('ERP autenticado.\n');

  // ── 2. Importar categorias ───────────────────────────────────────────────
  const grupos = await query(db, `
    SELECT DISTINCT G.DESCGRUPO
    FROM PRODUTO P
    JOIN GRUPO G ON P.GRUPO = G.CODGRUPO
    WHERE P.ATIVO = 'S'
      AND P.CODPROD NOT IN ('R$', 'U$', 'AU')
      AND P.DTINCLUSAO >= '2020-01-01'
      AND G.DESCGRUPO IS NOT NULL
  `);

  console.log(`Criando ${grupos.length} categorias...`);
  const categoryMap: Record<string, string> = {};

  for (const g of grupos) {
    const nome = (g.descgrupo as string).trim();
    try {
      const { data } = await axios.post(`${ERP_BASE}/categories`, { name: nome }, { headers });
      categoryMap[nome] = data.id;
      console.log(`  ✅ ${nome}`);
    } catch {
      // busca se já existe
      const { data: list } = await axios.get(`${ERP_BASE}/categories`, { headers });
      const found = list.find((c: any) => c.name === nome);
      if (found) categoryMap[nome] = found.id;
    }
  }

  // ── 3. Importar produtos ─────────────────────────────────────────────────
  const produtos = await query(db, `
    SELECT
      P.CODPROD, P.DESCPROD, P.QUANT, P.CUSTO, P.PRECO,
      P.PESO, P.MOEDA, P.VLCOMPRA, P.MARKUP, P.MARKUP2,
      P.COMPRAR, P.VENDER, P.ESTOCAR, P.PRODUZIR, P.COMPOR, P.KIT,
      P.QTDMINIMA, P.PRECO2, P.A1, P.A2,
      G.DESCGRUPO
    FROM PRODUTO P
    LEFT JOIN GRUPO G ON P.GRUPO = G.CODGRUPO
    WHERE P.ATIVO = 'S'
      AND P.CODPROD NOT IN ('R$', 'U$', 'AU')
      AND P.DTINCLUSAO >= '2020-01-01'
    ORDER BY P.CODPROD
  `);

  console.log(`\nImportando ${produtos.length} produtos...`);
  let ok = 0, fail = 0;

  for (const p of produtos) {
    const grupo = (p.descgrupo as string | null)?.trim();
    const categoryId = grupo ? categoryMap[grupo] : undefined;
    const stock = Number(p.quant ?? 0);

    const payload = {
      sku:            String(p.codprod).trim(),
      name:           String(p.descprod).trim(),
      stock,
      costPrice:      Number(p.custo ?? 0),
      salePrice:      Number(p.preco ?? 0),
      weightGrams:    Number(p.peso ?? 0) || undefined,
      moedaCompra:    String(p.moeda ?? 'BRL').trim() || 'BRL',
      valorCompraAu:  Number(p.vlcompra ?? 0) || undefined,
      markup:         Number(p.markup ?? 0) || undefined,
      markup2:        Number(p.markup2 ?? 0) || undefined,
      preco2:         Number(p.preco2 ?? 0) || undefined,
      stones:         p.a1 ? String(p.a1).trim() : undefined,
      tipoProduto:    'PRODUTO',
      vendido:        p.vender === 'S',
      estocado:       p.estocar === 'S',
      comprado:       p.comprar === 'S',
      produzido:      p.produzir === 'S',
      usadoParaCompor:p.compor === 'S',
      kitVenda:       p.kit === 'S',
      minStock:       Number(p.qtdminima ?? 1) || 1,
      categoryId,
      status:         'ATIVO',
    };

    try {
      await axios.post(`${ERP_BASE}/products`, payload, { headers });
      process.stdout.write(`✅ ${payload.sku}\n`);
      ok++;
    } catch (e: any) {
      process.stdout.write(`❌ ${payload.sku} — ${e.response?.data?.message ?? e.message}\n`);
      fail++;
    }
  }

  console.log(`\nConcluído: ${ok} produtos criados, ${fail} erros`);
  db.detach();
}

main().catch(e => { console.error(e); process.exit(1); });
