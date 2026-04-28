import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const PM_OPTIONS = [
  { value: 'DINHEIRO',       label: 'Dinheiro (à vista)' },
  { value: 'PIX',            label: 'PIX' },
  { value: 'CARTAO_DEBITO',  label: 'Cartão Débito' },
  { value: 'CARTAO_CREDITO', label: 'Cartão Crédito' },
];

export default function SaleNewPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [saleDate,       setSaleDate]       = useState(today);
  const [customerId,     setCustomerId]     = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState('DINHEIRO');
  const [discount,       setDiscount]       = useState(0);
  const [notes,          setNotes]          = useState('');
  const [items,          setItems]          = useState<any[]>([]);
  const [productSearch,  setProductSearch]  = useState('');

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn:  () => api.get(`/products?search=${productSearch}&limit=10`).then(r => r.data),
    enabled:  productSearch.length > 1,
  });

  const addItem = (product: any) => {
    if (items.find(i => i.productId === product.id)) return toast.error('Produto já adicionado');
    setItems(p => [...p, {
      productId: product.id,
      name:      product.name,
      sku:       product.sku,
      quantity:  1,
      unitPrice: Number(product.salePrice),
      discount:  0,
    }]);
    setProductSearch('');
  };

  const subtotal = items.reduce((s, i) => s + (i.unitPrice - i.discount) * i.quantity, 0);
  const total    = subtotal - discount;
  const fmt      = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const save = useMutation({
    mutationFn: () => api.post('/sales', {
      data:          saleDate,
      customerId:    customerId || undefined,
      paymentMethod,
      discount,
      notes:         notes || undefined,
      items: items.map(i => ({
        productId: i.productId,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
        discount:  i.discount,
      })),
    }),
    onSuccess: () => {
      toast.success('Venda registrada!');
      navigate('/sales');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao registrar venda'),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-yellow-900 mb-6">Nova Venda</h1>

      {/* Dados da venda */}
      <div className="card mb-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Dados da Venda</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Venda</label>
            <input
              type="date"
              className="input"
              value={saleDate}
              onChange={e => setSaleDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">Balcão (sem cliente)</option>
              {(customers as any[]).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {PM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <input
            className="input"
            placeholder="Obs. de venda..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Produtos */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Produtos</h2>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome ou modelo (ex: AL007)..."
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
          />
        </div>

        {products?.data?.length > 0 && productSearch.length > 1 && (
          <div className="border rounded-lg overflow-hidden mb-4">
            {products.data.map((p: any) => (
              <button
                key={p.id}
                onClick={() => addItem(p)}
                className="w-full text-left px-4 py-2.5 hover:bg-yellow-50 border-b last:border-0 flex justify-between items-center text-sm"
              >
                <span>
                  <span className="font-mono text-xs text-gray-400 mr-2">{p.sku}</span>
                  {p.name}
                </span>
                <span className="text-yellow-700 font-medium ml-4 shrink-0">{fmt(Number(p.salePrice))}</span>
              </button>
            ))}
          </div>
        )}

        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Modelo / Produto', 'Qtd', 'Preço Unit.', 'Desc. Item', 'Total', ''].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.productId} className="border-t">
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-gray-400 mr-1">{item.sku}</span>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </td>
                  <td className="px-3 py-2 w-20">
                    <input
                      type="number" min={1}
                      className="input text-center w-16"
                      value={item.quantity}
                      onChange={e => setItems(p => p.map((i, k) => k === idx ? { ...i, quantity: +e.target.value } : i))}
                    />
                  </td>
                  <td className="px-3 py-2 w-32">
                    <input
                      type="number"
                      className="input w-28"
                      value={item.unitPrice}
                      onChange={e => setItems(p => p.map((i, k) => k === idx ? { ...i, unitPrice: +e.target.value } : i))}
                    />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input
                      type="number" min={0}
                      className="input w-24"
                      value={item.discount}
                      onChange={e => setItems(p => p.map((i, k) => k === idx ? { ...i, discount: +e.target.value } : i))}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {fmt((item.unitPrice - item.discount) * item.quantity)}
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => setItems(p => p.filter((_, k) => k !== idx))}>
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-400 py-6">Nenhum produto adicionado</p>
        )}
      </div>

      {/* Totais */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="font-medium">{fmt(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-gray-700">Desconto geral (R$)</label>
          <input
            type="number" min={0}
            className="input w-32 text-right"
            value={discount}
            onChange={e => setDiscount(+e.target.value)}
          />
        </div>
        <div className="flex justify-between text-xl font-bold text-yellow-900 border-t pt-3">
          <span>Total (líquido)</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/sales')} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button
          onClick={() => save.mutate()}
          disabled={items.length === 0 || save.isPending}
          className="btn-primary flex-1"
        >
          {save.isPending ? 'Registrando...' : 'Registrar Venda'}
        </button>
      </div>
    </div>
  );
}
