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

  const { data: auth } = await axios.post(`${ERP_BASE}/auth/login`, {
    email: 'admin@eternityjoias.com.br',
    password: 'admin@2025',
  });
  const headers = { Authorization: `Bearer ${auth.access_token}` };
  console.log('ERP autenticado.\n');

  const fornecedores = await query(db, `
    SELECT CODCONTA, NOME, FANTASIA, TELEFONE1, CELULAR, EMAIL, CNPJ_CPF,
           ENDERECO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, ESTADO
    FROM CONTA
    WHERE TIPOCONTA = 2
      AND ATIVO = 'S'
    ORDER BY NOME
  `);

  console.log(`Importando ${fornecedores.length} fornecedores...\n`);
  let ok = 0, skip = 0, fail = 0;

  const usedCnpjs = new Set<string>();

  for (const f of fornecedores) {
    const name = (f.nome as string | null)?.trim();
    if (!name) { skip++; continue; }

    const rawCnpj = (f.cnpj_cpf as string | null)?.replace(/\D/g, '') || undefined;
    const cnpj    = rawCnpj && rawCnpj.length >= 11 && !usedCnpjs.has(rawCnpj)
      ? rawCnpj
      : undefined;

    const phone = ((f.celular as string | null)?.trim() || (f.telefone1 as string | null)?.trim()) || undefined;
    const email = (f.email as string | null)?.trim().toLowerCase() || undefined;

    const addrParts = [f.endereco, f.numero, f.complemento, f.bairro, f.cidade, f.estado]
      .map((p: any) => (p as string | null)?.trim()).filter(Boolean);
    const address = addrParts.length ? addrParts.join(', ') : undefined;

    const payload = { name, cnpj, phone, email, address };

    try {
      await axios.post(`${ERP_BASE}/suppliers`, payload, { headers });
      if (cnpj) usedCnpjs.add(cnpj);
      process.stdout.write(`✅ ${name}\n`);
      ok++;
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message;
      process.stdout.write(`❌ ${name} — ${msg}\n`);
      fail++;
    }
  }

  console.log(`\nConcluído: ${ok} criados, ${skip} ignorados, ${fail} erros`);
  db.detach();
}

main().catch(e => { console.error(e); process.exit(1); });
