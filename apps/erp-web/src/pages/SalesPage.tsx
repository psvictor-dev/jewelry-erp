import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

const PM_LABELS: any = { DINHEIRO:'Dinheiro', PIX:'PIX', CARTAO_DEBITO:'Débito', CARTAO_CREDITO:'Crédito' };

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
      const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/i);
      const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
      const filename = utf8Match
        ? decodeURIComponent(utf8Match[1])
        : plainMatch
          ? plainMatch[1]
          : `${saleNumber}.pdf`;
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
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
  const { data = [], isLoading } = useQuery({ queryKey: ['sales'], queryFn: () => api.get('/sales').then(r => r.data) });
  const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Vendas</h1>
        <button onClick={() => navigate('/sales/new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova Venda
        </button>
      </div>
      {isLoading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              {['#','Data','Cliente','Itens','Pagamento','Total','Status',''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">#{s.number}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.data ?? s.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 font-medium">{s.customer?.name ?? 'Balcão'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.items.length} item(ns)</td>
                  <td className="px-4 py-3 text-xs">{PM_LABELS[s.paymentMethod]}</td>
                  <td className="px-4 py-3 font-semibold text-yellow-900">{fmt(s.total)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <DownloadPdfButton saleId={s.id} saleNumber={s.number} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <p className="text-center py-12 text-gray-400">Nenhuma venda registrada</p>}
        </div>
      )}
    </div>
  );
}
