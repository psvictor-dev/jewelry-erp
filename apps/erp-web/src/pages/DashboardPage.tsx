import { useQuery } from '@tanstack/react-query';
import {
  Package, AlertTriangle, TrendingUp, DollarSign,
  FileText, ShoppingCart, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, Gem,
} from 'lucide-react';
import api from '../lib/api';

const fmt  = (v: number) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pct  = (v: number) => `${(v ?? 0).toFixed(1)}%`;
const date = new Date();

const GREETING = (() => {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
})();

const MONTH_LABEL = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

/* ── barra de progresso horizontal ─────────────────────────────── */
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${w}%`, transition: 'width .6s ease' }} />
    </div>
  );
}

/* ── card KPI ───────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, Icon, accent, up,
}: {
  label: string; value: string | number; sub?: string;
  Icon: React.ElementType; accent: string; up?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`rounded-xl p-2 ${accent}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-tight">{value}</div>
      {sub !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${up === undefined ? 'text-gray-400' : up ? 'text-green-600' : 'text-red-500'}`}>
          {up === true  && <ArrowUpRight size={13} />}
          {up === false && <ArrowDownRight size={13} />}
          {sub}
        </div>
      )}
    </div>
  );
}

/* ── linha DRE ──────────────────────────────────────────────────── */
function DreRow({ label, value, max, barColor, bold, tag }: {
  label: string; value: number; max: number;
  barColor: string; bold?: boolean; tag?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className={bold ? 'font-semibold text-gray-800' : 'text-gray-500'}>{label}</span>
        <span className={`font-semibold tabular-nums ${value < 0 ? 'text-red-600' : bold ? 'text-gray-900' : 'text-gray-700'}`}>
          {tag ?? fmt(value)}
        </span>
      </div>
      <Bar value={Math.abs(value)} max={max} color={barColor} />
    </div>
  );
}

/* ── badge de status venda ──────────────────────────────────────── */
const SALE_STATUS: Record<string, string> = {
  PAGO:      'bg-green-100 text-green-700',
  PENDENTE:  'bg-yellow-100 text-yellow-700',
  CANCELADO: 'bg-gray-100 text-gray-500',
  DEVOLVIDO: 'bg-red-100 text-red-600',
};
const PM_SHORT: Record<string, string> = {
  DINHEIRO: 'Dinheiro', PIX: 'PIX',
  CARTAO_DEBITO: 'Débito', CARTAO_CREDITO: 'Crédito',
};

/* ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const now = new Date();

  const { data: dre }      = useQuery({ queryKey: ['dre-dash'],    queryFn: () => api.get(`/financial/dre?month=${now.getMonth()+1}&year=${now.getFullYear()}`).then(r => r.data) });
  const { data: products } = useQuery({ queryKey: ['prod-dash'],   queryFn: () => api.get('/products?limit=1').then(r => r.data) });
  const { data: lowStock } = useQuery({ queryKey: ['low-stock'],   queryFn: () => api.get('/products/low-stock').then(r => r.data) });
  const { data: quotes }   = useQuery({ queryKey: ['quotes-dash'], queryFn: () => api.get('/quotes?status=ENVIADO').then(r => r.data) });
  const { data: sales }    = useQuery({ queryKey: ['sales-dash'],  queryFn: () => api.get('/sales').then(r => r.data) });

  const recentSales  = (sales ?? []).slice(0, 6);
  const receita      = dre?.receitas?.total   ?? 0;
  const despesas     = dre?.despesasOperacionais?.total ?? 0;
  const lucro        = dre?.lucroLiquido      ?? 0;
  const margem       = dre?.margemLiquida     ?? 0;
  const dreMax       = Math.max(receita, despesas + (dre?.cmv ?? 0), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">
            {date.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
          <h1 className="text-3xl font-bold text-yellow-900 flex items-center gap-2 mt-0.5">
            <Gem size={26} className="text-yellow-600" />
            {GREETING}, seja bem-vindo
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Competência</p>
          <p className="text-sm font-semibold text-gray-700 capitalize">{MONTH_LABEL}</p>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Receita do Mês"
          value={fmt(receita)}
          sub={`${dre?.totalVendas ?? 0} venda(s)`}
          Icon={DollarSign}
          accent="bg-green-100 text-green-600"
          up
        />
        <KpiCard
          label="Lucro Líquido"
          value={fmt(lucro)}
          sub={`Margem ${pct(margem)}`}
          Icon={TrendingUp}
          accent={lucro >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-500'}
          up={lucro >= 0}
        />
        <KpiCard
          label="Orçamentos Abertos"
          value={quotes?.length ?? 0}
          sub="aguardando aprovação"
          Icon={FileText}
          accent="bg-yellow-100 text-yellow-700"
        />
        <KpiCard
          label="Contas a Pagar"
          value={fmt(dre?.pendentes?.despesas ?? 0)}
          sub="em aberto"
          Icon={Clock}
          accent={(dre?.pendentes?.despesas ?? 0) > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}
          up={false}
        />
      </div>

      {/* ── Linha principal ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* DRE Visual */}
        {dre && (
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Resultado do Mês</h2>
              <span className="text-xs text-gray-400 capitalize">{MONTH_LABEL}</span>
            </div>

            <div className="space-y-4">
              <DreRow label="Receita Bruta"            value={receita}   max={dreMax} barColor="bg-green-400" />
              <DreRow label="(-) CMV"                  value={dre.cmv}   max={dreMax} barColor="bg-red-300" />
              <DreRow label="Lucro Bruto"              value={dre.lucroBruto} max={dreMax} barColor="bg-blue-400" bold />
              <DreRow label="(-) Desp. Operacionais"  value={despesas}  max={dreMax} barColor="bg-orange-300" />
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Lucro Líquido', value: fmt(lucro),           color: lucro >= 0 ? 'text-green-700' : 'text-red-600' },
                { label: 'Margem',        value: pct(margem),           color: margem >= 0 ? 'text-blue-600' : 'text-red-500' },
                { label: 'Ticket Médio',  value: fmt(dre.ticketMedio),  color: 'text-yellow-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl py-3">
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas e métricas laterais */}
        <div className="space-y-4">

          {/* Produtos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-gray-100 text-gray-500 rounded-xl p-3"><Package size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{products?.total ?? 0}</p>
              <p className="text-xs text-gray-400">Produtos cadastrados</p>
            </div>
          </div>

          {/* Estoque Baixo */}
          {(lowStock?.length ?? 0) > 0 ? (
            <div className="bg-white rounded-2xl border-l-4 border-red-400 border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-3 text-sm">
                <AlertTriangle size={15} /> Estoque Baixo ({lowStock.length})
              </h3>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 truncate max-w-[140px]">{p.name}</span>
                    <span className="text-red-500 font-bold text-xs">{p.stock} un</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-2xl border border-green-100 p-5 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-500" />
              <p className="text-sm text-green-700 font-medium">Estoque sem alertas</p>
            </div>
          )}

          {/* Orçamentos pendentes mini-stat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-700 rounded-xl p-3"><ShoppingCart size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dre?.totalVendas ?? 0}</p>
              <p className="text-xs text-gray-400">Vendas no mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Últimas Vendas ─────────────────────────────────────── */}
      {recentSales.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Últimas Vendas</h2>
            <a href="/sales" className="text-xs text-yellow-700 hover:underline font-medium">Ver todas →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['#', 'Cliente', 'Itens', 'Pagamento', 'Total', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-amber-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">#{s.number}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{s.customer?.name ?? 'Balcão'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.items?.length ?? 0}</td>
                    <td className="px-5 py-3 text-gray-500">{PM_SHORT[s.paymentMethod] ?? s.paymentMethod}</td>
                    <td className="px-5 py-3 font-semibold text-yellow-900">{fmt(s.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SALE_STATUS[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
