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

  const contas = await query(db, `
    SELECT
      CODCONTA, NOME, EMAIL, TELEFONE1, CELULAR,
      CNPJ_CPF, ENDERECO, NUMERO, COMPLEMENTO,
      BAIRRO, CIDADE, ESTADO
    FROM CONTA
    WHERE TIPOCONTA = 1
      AND ATIVO = 'S'
    ORDER BY CODCONTA
  `);

  console.log(`Importando ${contas.length} clientes...\n`);
  let ok = 0, skip = 0, fail = 0;

  const usedEmails = new Set<string>();
  const usedCpfs   = new Set<string>();

  for (const c of contas) {
    const name = (c.nome as string | null)?.trim();
    if (!name) { skip++; continue; }

    const rawEmail = (c.email as string | null)?.trim().toLowerCase() || undefined;
    const email    = rawEmail && rawEmail.length > 3 && rawEmail.includes('@') && !usedEmails.has(rawEmail)
      ? rawEmail
      : undefined;

    const rawCpf = (c.cnpj_cpf as string | null)?.replace(/\D/g, '') || undefined;
    const cpf    = rawCpf && rawCpf.length >= 11 && !usedCpfs.has(rawCpf)
      ? rawCpf
      : undefined;

    const phone = ((c.celular as string | null)?.trim() || (c.telefone1 as string | null)?.trim()) || undefined;

    const addrParts = [
      c.endereco, c.numero, c.complemento, c.bairro, c.cidade, c.estado,
    ].map((p: any) => (p as string | null)?.trim()).filter(Boolean);
    const address = addrParts.length ? addrParts.join(', ') : undefined;

    const payload = { name, email, phone, cpf, address };

    try {
      await axios.post(`${ERP_BASE}/customers`, payload, { headers });
      if (email)  usedEmails.add(email);
      if (cpf)    usedCpfs.add(cpf);
      process.stdout.write(`✅ ${name}\n`);
      ok++;
    } catch (e: any) {
      const msg = e.response?.data?.message ?? e.message;
      process.stdout.write(`❌ ${name} — ${msg}\n`);
      fail++;
    }
  }

  console.log(`\nConcluído: ${ok} criados, ${skip} ignorados (sem nome), ${fail} erros`);
  db.detach();
}

main().catch(e => { console.error(e); process.exit(1); });
