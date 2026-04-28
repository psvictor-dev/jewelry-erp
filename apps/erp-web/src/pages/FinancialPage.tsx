import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CATS = ['VENDA','COMPRA_ESTOQUE','ALUGUEL','SALARIO','MANUTENCAO','MARKETING','IMPOSTOS','OUTROS'];
const STATUS_COLORS: any = { PENDENTE:'bg-yellow-100 text-yellow-700', PAGO:'bg-green-100 text-green-700', VENCIDO:'bg-red-100 text-red-600', CANCELADO:'bg-gray-100 text-gray-500' };

function TransactionModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type:'DESPESA', category:'OUTROS', description:'', amount:'', dueDate: new Date().toISOString().split('T')[0], notes:'' });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: () => api.post('/financial/transactions', { ...form, amount: +form.amount }),
    onSuccess: () => { toast.success('Lançado!'); qc.invalidateQueries({ queryKey: ['transactions'] }); onClose(); },
    onError: () => toast.error('Erro ao lançar'),
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg">Novo Lançamento</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400"/></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select className="input" value={form.type} onChange={f('type')}>
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select className="input" value={form.category} onChange={f('category')}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {[
            { k:'description', label:'Descrição*', ph:'Ex: Aluguel abril', type:'text' },
            { k:'amount',      label:'Valor (R$)*', ph:'1500',             type:'number' },
            { k:'dueDate',     label:'Vencimento*', ph:'',                 type:'date' },
            { k:'notes',       label:'Observações', ph:'',                 type:'text' },
          ].map(({ k, label, ph, type }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} className="input" placeholder={ph} value={(form as any)[k]} onChange={f(k)}/>
            </div>
          ))}
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

export default function FinancialPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('');
  const { data = [], isLoading } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => api.get(`/financial/transactions${filter ? `?status=${filter}` : ''}`).then(r => r.data),
  });
  const markPaid = useMutation({
    mutationFn: ({ id, pm }: any) => api.put(`/financial/transactions/${id}/pay`, { paymentMethod: pm }),
    onSuccess: () => { toast.success('Marcado como pago!'); qc.invalidateQueries({ queryKey: ['transactions'] }); },
  });
  const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  const totalReceitas = data.filter((t: any) => t.type === 'RECEITA' && t.status === 'PAGO').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalDespesas = data.filter((t: any) => t.type === 'DESPESA' && t.status === 'PAGO').reduce((s: number, t: any) => s + Number(t.amount), 0);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Financeiro</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18}/> Novo Lançamento</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Receitas pagas', value: fmt(totalReceitas), color:'text-green-600', bg:'bg-green-50' },
          { label:'Despesas pagas', value: fmt(totalDespesas), color:'text-red-600',   bg:'bg-red-50'   },
          { label:'Saldo',          value: fmt(totalReceitas - totalDespesas), color: totalReceitas - totalDespesas >= 0 ? 'text-blue-700':'text-red-700', bg:'bg-blue-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="card mb-4 flex gap-2">
        {['','PENDENTE','PAGO','VENCIDO'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-yellow-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'Todos'}
          </button>
        ))}
      </div>
      {isLoading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              {['Tipo','Descrição','Categoria','Vencimento','Valor','Status',''].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.type==='RECEITA' ? 'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{t.type}</span>
                  </td>
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{t.description}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.category}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</td>
                  <td className={`px-4 py-3 font-semibold ${t.type==='RECEITA' ? 'text-green-700':'text-red-600'}`}>{fmt(t.amount)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3">
                    {t.status === 'PENDENTE' && (
                      <button onClick={() => markPaid.mutate({ id:t.id, pm: t.type==='RECEITA' ? 'PIX':'PIX' })}
                        className="text-green-600 hover:text-green-800" title="Marcar como pago">
                        <CheckCircle size={16}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <p className="text-center py-12 text-gray-400">Nenhuma transação encontrada</p>}
        </div>
      )}
      {modal && <TransactionModal onClose={() => setModal(false)}/>}
    </div>
  );
}
