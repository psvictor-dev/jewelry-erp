import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, ArrowDownCircle, ArrowUpCircle, RefreshCw, RotateCcw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'DEVOLUCAO';

interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  createdAt: string;
  product: { id: string; sku: string; name: string };
  user: { id: string; name: string };
}

interface Product {
  id: string;
  sku: string;
  name: string;
  stock: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<MovementType, string> = {
  ENTRADA:   'Entrada',
  SAIDA:     'Saída',
  AJUSTE:    'Ajuste',
  DEVOLUCAO: 'Devolução',
};

const TYPE_STYLE: Record<MovementType, string> = {
  ENTRADA:   'bg-green-100 text-green-800',
  SAIDA:     'bg-red-100 text-red-800',
  AJUSTE:    'bg-blue-100 text-blue-800',
  DEVOLUCAO: 'bg-orange-100 text-orange-800',
};

const TYPE_ICON: Record<MovementType, React.ReactNode> = {
  ENTRADA:   <ArrowDownCircle size={13} className="text-green-600" />,
  SAIDA:     <ArrowUpCircle   size={13} className="text-red-600"   />,
  AJUSTE:    <RefreshCw       size={13} className="text-blue-600"  />,
  DEVOLUCAO: <RotateCcw       size={13} className="text-orange-600"/>,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Modal de Novo Ajuste ─────────────────────────────────────────────────────

function NovoAjusteModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: 'ENTRADA' as MovementType,
    quantity: '',
    reason: '',
  });
  const [productSearch, setProductSearch]       = useState('');
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null);

  const { data: searchResults } = useQuery<Product[]>({
    queryKey: ['products-search-stock', productSearch],
    queryFn: () => api.get(`/products?search=${productSearch}&limit=10`).then(r => r.data?.data ?? []),
    enabled: productSearch.length > 1 && !selectedProduct,
  });

  const save = useMutation({
    mutationFn: (data: any) => api.post('/stock/movement', data),
    onSuccess: () => {
      toast.success('Movimentação registrada!');
      qc.invalidateQueries({ queryKey: ['stock-movements'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Erro ao registrar movimentação';
      toast.error(msg);
    },
  });

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">Nova Movimentação</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-gray-700" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
            {selectedProduct ? (
              <div className="flex items-center justify-between px-3 py-2 border rounded-lg bg-yellow-50 border-yellow-200">
                <div>
                  <span className="font-mono text-xs text-gray-400 mr-2">{selectedProduct.sku}</span>
                  <span className="text-sm font-medium text-gray-800">{selectedProduct.name}</span>
                  <span className="ml-2 text-xs text-gray-400">estoque: {selectedProduct.stock}</span>
                </div>
                <button onClick={() => { setSelectedProduct(null); setProductSearch(''); }}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-8"
                  placeholder="Buscar por nome ou SKU..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  autoFocus
                />
                {searchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedProduct(p); setProductSearch(''); }}
                        className="w-full text-left px-3 py-2 hover:bg-yellow-50 border-b last:border-0 text-sm flex justify-between items-center"
                      >
                        <span>
                          <span className="font-mono text-xs text-gray-400 mr-2">{p.sku}</span>
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{p.stock} un</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="movType" className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select id="movType" className="input" value={form.type} onChange={set('type')}>
                {(Object.keys(TYPE_LABEL) as MovementType[]).map(t => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
              <input
                id="quantity"
                className="input"
                type="number"
                min="1"
                placeholder="0"
                value={form.quantity}
                onChange={set('quantity')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Descreva o motivo da movimentação..."
              value={form.reason}
              onChange={set('reason')}
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={() => save.mutate({
              productId: selectedProduct!.id,
              type: form.type,
              quantity: Number(form.quantity),
              reason: form.reason || undefined,
            })}
            disabled={save.isPending || !selectedProduct || !form.quantity || Number(form.quantity) < 1}
            className="btn-primary flex-1"
          >
            {save.isPending ? 'Salvando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TYPES: Array<MovementType | ''> = ['', 'ENTRADA', 'SAIDA', 'AJUSTE', 'DEVOLUCAO'];
const TYPE_FILTER_LABEL: Record<string, string> = {
  '': 'Todos', ENTRADA: 'Entrada', SAIDA: 'Saída', AJUSTE: 'Ajuste', DEVOLUCAO: 'Devolução',
};

export default function StockPage() {
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<MovementType | ''>('');
  const [search, setSearch] = useState('');

  const { data: movements = [], isLoading } = useQuery<StockMovement[]>({
    queryKey: ['stock-movements', filter],
    queryFn: () =>
      api.get(`/stock/movements${filter ? `?type=${filter}` : ''}`).then(r => r.data),
  });

  const filtered = search
    ? movements.filter(m =>
        m.product.name.toLowerCase().includes(search.toLowerCase()) ||
        m.product.sku.toLowerCase().includes(search.toLowerCase())
      )
    : movements;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Movimentações de Estoque</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nova Movimentação
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6 flex flex-wrap gap-3 items-center">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="Buscar por produto ou SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === t
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TYPE_FILTER_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Data/Hora', 'Produto', 'SKU', 'Tipo', 'Quantidade', 'Motivo', 'Usuário'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-yellow-50/40 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {fmtDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{m.product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.product.sku}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLE[m.type]}`}>
                      {TYPE_ICON[m.type]}
                      {TYPE_LABEL[m.type]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${
                    m.type === 'SAIDA' ? 'text-red-600' : 'text-green-700'
                  }`}>
                    {m.type === 'SAIDA' ? '-' : '+'}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate">
                    {m.reason ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.user.name}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {search || filter ? 'Nenhuma movimentação encontrada para os filtros aplicados' : 'Nenhuma movimentação registrada'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-gray-500 bg-gray-50">
              {filtered.length} movimentação(ões)
            </div>
          )}
        </div>
      )}

      {showNew && <NovoAjusteModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
