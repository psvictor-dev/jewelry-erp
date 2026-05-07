import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

const PM_LABELS: any = { DINHEIRO: 'Dinheiro', PIX: 'PIX', CARTAO_DEBITO: 'Débito', CARTAO_CREDITO: 'Crédito' };

const STATUS_META: Record<string, { label: string; className: string; nextLabel?: string }> = {
  RECEBIDO:    { label: 'Recebido',    className: 'bg-blue-100 text-blue-700',      nextLabel: 'Em Produção' },
  EM_PRODUCAO: { label: 'Em Produção', className: 'bg-yellow-100 text-yellow-800',  nextLabel: 'Entregar' },
  ENTREGUE:    { label: 'Entregue',    className: 'bg-green-100 text-green-700' },
  CANCELADO:   { label: 'Cancelado',   className: 'bg-red-100 text-red-600' },
  DEVOLVIDO:   { label: 'Devolvido',   className: 'bg-gray-100 text-gray-600' },
};

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'RECEBIDO',    label: 'Recebido' },
  { value: 'EM_PRODUCAO', label: 'Em Produção' },
  { value: 'ENTREGUE',    label: 'Entregue' },
  { value: 'CANCELADO',   label: 'Cancelado' },
];

function DownloadPdfButton({ saleId, saleNumber }: { saleId: string; saleNumber: number }) {
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(s => s.token);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await api.get(`/sales/${saleId}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const disposition = res.headers['content-disposition'] ?? '';
      const utf8Match  = disposition.match(/filename\*=UTF-8''(.+)/i);
      const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
      const filename = utf8Match
        ? decodeURIComponent(utf8Match[1])
        : plainMatch ? plainMatch[1] : `${saleNumber}.pdf`;
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded font-medium disabled:opacity-50 transition-colors"
    >
      {loading ? '...' : 'PDF'}
    </button>
  );
}

export default function SalesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatus] = useState('');
  const LIMIT = 25;

  const { data: res, isLoading } = useQuery({
    queryKey: ['sales', page, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (statusFilter) params.set('status', statusFilter);
      return api.get(`/sales?${params}`).then(r => r.data);
    },
    placeholderData: (prev) => prev,
  });

  const sales  = (res?.data ?? []) as any[];
  const total  = res?.total ?? 0;
  const pages  = res?.pages ?? 1;

  const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const advance = useMutation({
    mutationFn: (id: string) => api.patch(`/sales/${id}/status`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      const sale = sales.find((s: any) => s.id === id);
      if (sale?.status === 'EM_PRODUCAO') toast.success('Venda entregue! Estoque baixado.');
      else toast.success('Status atualizado!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao avançar status'),
  });

  function changeStatus(s: string) { setStatus(s); setPage(1); }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Vendas</h1>
        <button onClick={() => navigate('/sales/new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova Venda
        </button>
      </div>

      {/* Filtro de status */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => changeStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        {total > 0 && (
          <span className="ml-auto text-sm text-gray-400 self-center">{total} venda(s)</span>
        )}
      </div>

      {isLoading && !res ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Data', 'Cliente', 'Itens', 'Pagamento', 'Total', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((s: any) => {
                  const meta = STATUS_META[s.status] ?? { label: s.status, className: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">#{s.number}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(s.data ?? s.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 font-medium">{s.customer?.name ?? 'Balcão'}</td>
                      <td className="px-4 py-3 text-gray-500">{s.items.length} item(ns)</td>
                      <td className="px-4 py-3 text-xs">{PM_LABELS[s.paymentMethod]}</td>
                      <td className="px-4 py-3 font-semibold text-yellow-900">{fmt(s.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {meta.nextLabel && (
                            <button
                              onClick={() => advance.mutate(s.id)}
                              disabled={advance.isPending}
                              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium disabled:opacity-50 transition-colors"
                            >
                              <ChevronRight size={12} />
                              {meta.nextLabel}
                            </button>
                          )}
                          <DownloadPdfButton saleId={s.id} saleNumber={s.number} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      Nenhuma venda encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
