import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const TODAY = new Date().toISOString().split('T')[0];

// ─── Helpers ─────────────────────────────────────────────────────
const fmt = (v: number | null | undefined) =>
  v != null ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

// ─── AutocompleteInput ────────────────────────────────────────────
function AutocompleteInput({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.trim().length === 0
    ? []
    : options.filter(o =>
        o.label.toLowerCase().includes(value.toLowerCase()) ||
        o.value.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(opt => (
            <li
              key={opt.value}
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-yellow-50 flex justify-between items-center"
            >
              <span className="font-medium text-gray-800">{opt.value}</span>
              {opt.label !== opt.value && (
                <span className="text-xs text-gray-400 ml-2 truncate max-w-[50%]">{opt.label}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Hook: lista de produtos para autocomplete ────────────────────
function useProductOptions() {
  const { data } = useQuery({
    queryKey: ['products-autocomplete'],
    queryFn: () => api.get('/products?limit=500').then(r => r.data),
    staleTime: 60_000,
  });
  return (data?.data ?? []).map((p: any) => ({
    value: p.sku,
    label: p.name,
  }));
}

// ─── Modal Compra ─────────────────────────────────────────────────
function CompraModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    data: TODAY, fornecedor: '', modelo: '', quantidade: '1',
    moeda: 'BRL', preco: '', cotacao: '', obs: '',
  });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const productOptions = useProductOptions();

  const save = useMutation({
    mutationFn: () => api.post('/lancamentos/compras', {
      ...form,
      quantidade: Number(form.quantidade),
      preco: Number(form.preco),
      cotacao: form.cotacao !== '' ? Number(form.cotacao) : undefined,
    }),
    onSuccess: () => { toast.success('Compra lançada!'); qc.invalidateQueries({ queryKey: ['compras'] }); onClose(); },
    onError: () => toast.error('Erro ao lançar compra'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg text-yellow-900">Nova Compra</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
              <input type="date" className="input" value={form.data} onChange={f('data')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade*</label>
              <input type="number" className="input" min={1} value={form.quantidade} onChange={f('quantidade')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor*</label>
            <input type="text" className="input" placeholder="Nome do fornecedor" value={form.fornecedor} onChange={f('fornecedor')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo*</label>
            <AutocompleteInput
              value={form.modelo}
              onChange={v => setForm(p => ({ ...p, modelo: v }))}
              placeholder="SKU ou descrição"
              options={productOptions}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moeda*</label>
              <select className="input" value={form.moeda} onChange={f('moeda')}>
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço*</label>
              <input type="number" step="0.01" className="input" placeholder="0,00" value={form.preco} onChange={f('preco')} />
            </div>
          </div>
          {form.moeda !== 'BRL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cotação (R$)</label>
              <input type="number" step="0.0001" className="input" placeholder="Ex: 5.1234" value={form.cotacao} onChange={f('cotacao')} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <input type="text" className="input" placeholder="Opcional" value={form.obs} onChange={f('obs')} />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary flex-1">
            {save.isPending ? 'Salvando...' : 'Lançar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Acerto ─────────────────────────────────────────────────
function AcertoModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    data: TODAY, cliente: '', cotacao: '', juros: '', liquido: '', obs: '',
  });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: () => api.post('/lancamentos/acertos', {
      ...form,
      cotacao: form.cotacao !== '' ? Number(form.cotacao) : undefined,
      juros: Number(form.juros),
      liquido: Number(form.liquido),
    }),
    onSuccess: () => { toast.success('Acerto lançado!'); qc.invalidateQueries({ queryKey: ['acertos'] }); onClose(); },
    onError: () => toast.error('Erro ao lançar acerto'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg text-yellow-900">Novo Acerto</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
              <input type="date" className="input" value={form.data} onChange={f('data')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cotação (opcional)</label>
              <input type="number" step="0.0001" className="input" placeholder="Ex: 5.1234" value={form.cotacao} onChange={f('cotacao')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente*</label>
            <input type="text" className="input" placeholder="Nome do cliente" value={form.cliente} onChange={f('cliente')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Juros*</label>
              <input type="number" step="0.01" className="input" placeholder="0,00" value={form.juros} onChange={f('juros')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Líquido*</label>
              <input type="number" step="0.01" className="input" placeholder="0,00" value={form.liquido} onChange={f('liquido')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <input type="text" className="input" placeholder="Opcional" value={form.obs} onChange={f('obs')} />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary flex-1">
            {save.isPending ? 'Salvando...' : 'Lançar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Venda ──────────────────────────────────────────────────
function VendaModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    data: TODAY, cliente: '', modelo: '', quantidade: '1',
    valor: '', valorLiquido: '', formaPagamento: '', vendedor: '',
    obsVenda: '', cpfNf: '',
  });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const productOptions = useProductOptions();

  const save = useMutation({
    mutationFn: () => api.post('/lancamentos/vendas', {
      ...form,
      quantidade: Number(form.quantidade),
      valor: Number(form.valor),
      valorLiquido: form.valorLiquido !== '' ? Number(form.valorLiquido) : undefined,
    }),
    onSuccess: () => { toast.success('Venda lançada!'); qc.invalidateQueries({ queryKey: ['vendas'] }); onClose(); },
    onError: () => toast.error('Erro ao lançar venda'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg text-yellow-900">Nova Venda</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
              <input type="date" className="input" value={form.data} onChange={f('data')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade*</label>
              <input type="number" min={1} className="input" value={form.quantidade} onChange={f('quantidade')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente*</label>
            <input type="text" className="input" placeholder="Nome do cliente" value={form.cliente} onChange={f('cliente')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo*</label>
            <AutocompleteInput
              value={form.modelo}
              onChange={v => setForm(p => ({ ...p, modelo: v }))}
              placeholder="SKU ou descrição"
              options={productOptions}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor*</label>
              <input type="number" step="0.01" className="input" placeholder="0,00" value={form.valor} onChange={f('valor')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Líquido</label>
              <input type="number" step="0.01" className="input" placeholder="0,00" value={form.valorLiquido} onChange={f('valorLiquido')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento*</label>
            <input type="text" className="input" placeholder="Ex: PIX, Dinheiro, Cartão" value={form.formaPagamento} onChange={f('formaPagamento')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
              <input type="text" className="input" placeholder="Nome do vendedor" value={form.vendedor} onChange={f('vendedor')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF NF</label>
              <input type="text" className="input" placeholder="000.000.000-00" value={form.cpfNf} onChange={f('cpfNf')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações da Venda</label>
            <textarea className="input resize-none" rows={3} placeholder="Opcional" value={form.obsVenda} onChange={f('obsVenda')} />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-primary flex-1">
            {save.isPending ? 'Salvando...' : 'Lançar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────
type Tab = 'compras' | 'acertos' | 'vendas';

export default function LancamentosPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('compras');
  const [modal, setModal] = useState(false);

  const { data: compras = [], isLoading: lcCompras } = useQuery({
    queryKey: ['compras'],
    queryFn: () => api.get('/lancamentos/compras').then(r => r.data),
  });
  const { data: acertos = [], isLoading: lcAcertos } = useQuery({
    queryKey: ['acertos'],
    queryFn: () => api.get('/lancamentos/acertos').then(r => r.data),
  });
  const { data: vendas = [], isLoading: lcVendas } = useQuery({
    queryKey: ['vendas'],
    queryFn: () => api.get('/lancamentos/vendas').then(r => r.data),
  });

  const deleteCompra = useMutation({
    mutationFn: (id: string) => api.delete(`/lancamentos/compras/${id}`),
    onSuccess: () => { toast.success('Removido'); qc.invalidateQueries({ queryKey: ['compras'] }); },
    onError: () => toast.error('Erro ao remover'),
  });
  const deleteAcerto = useMutation({
    mutationFn: (id: string) => api.delete(`/lancamentos/acertos/${id}`),
    onSuccess: () => { toast.success('Removido'); qc.invalidateQueries({ queryKey: ['acertos'] }); },
    onError: () => toast.error('Erro ao remover'),
  });
  const deleteVenda = useMutation({
    mutationFn: (id: string) => api.delete(`/lancamentos/vendas/${id}`),
    onSuccess: () => { toast.success('Removido'); qc.invalidateQueries({ queryKey: ['vendas'] }); },
    onError: () => toast.error('Erro ao remover'),
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'compras', label: 'Compras' },
    { key: 'acertos', label: 'Acertos' },
    { key: 'vendas', label: 'Vendas' },
  ];

  const isLoading = lcCompras || lcAcertos || lcVendas;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Lançamentos</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* Tab selector */}
      <div className="card mb-4 flex gap-2 p-3">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-yellow-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          {/* ── Compras ──────────────────────────────────────────── */}
          {tab === 'compras' && (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Data', 'Fornecedor', 'Modelo', 'Qtd', 'Moeda', 'Preço', 'Cotação', 'Total BRL', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {compras.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(c.data)}</td>
                      <td className="px-4 py-3 font-medium">{c.fornecedor}</td>
                      <td className="px-4 py-3 text-gray-700">{c.modelo}</td>
                      <td className="px-4 py-3 text-center">{c.quantidade}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{c.moeda}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{fmt(c.preco)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(c.cotacao)}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{fmt(c.totalBrl)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteCompra.mutate(c.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {compras.length === 0 && <p className="text-center py-12 text-gray-400">Nenhuma compra registrada</p>}
            </div>
          )}

          {/* ── Acertos ──────────────────────────────────────────── */}
          {tab === 'acertos' && (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Data', 'Cliente', 'Cotação', 'Juros', 'Líquido', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {acertos.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(a.data)}</td>
                      <td className="px-4 py-3 font-medium">{a.cliente}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(a.cotacao)}</td>
                      <td className="px-4 py-3 font-semibold text-orange-600">{fmt(a.juros)}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{fmt(a.liquido)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteAcerto.mutate(a.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {acertos.length === 0 && <p className="text-center py-12 text-gray-400">Nenhum acerto registrado</p>}
            </div>
          )}

          {/* ── Vendas ───────────────────────────────────────────── */}
          {tab === 'vendas' && (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Data', 'Cliente', 'Modelo', 'Qtd', 'Valor', 'Vlr Líquido', 'Pagamento', 'Vendedor', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendas.map((v: any) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(v.data)}</td>
                      <td className="px-4 py-3 font-medium">{v.cliente}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{v.modelo}</td>
                      <td className="px-4 py-3 text-center">{v.quantidade}</td>
                      <td className="px-4 py-3 font-semibold">{fmt(v.valor)}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{fmt(v.valorLiquido)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{v.formaPagamento}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{v.vendedor ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteVenda.mutate(v.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vendas.length === 0 && <p className="text-center py-12 text-gray-400">Nenhuma venda registrada</p>}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {modal && tab === 'compras' && <CompraModal onClose={() => setModal(false)} />}
      {modal && tab === 'acertos' && <AcertoModal onClose={() => setModal(false)} />}
      {modal && tab === 'vendas' && <VendaModal onClose={() => setModal(false)} />}
    </div>
  );
}
