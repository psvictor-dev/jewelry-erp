import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STATUS_COLORS: any = {
  RASCUNHO: 'bg-gray-100 text-gray-600',
  ENVIADO:  'bg-blue-100 text-blue-700',
  APROVADO: 'bg-green-100 text-green-700',
  RECUSADO: 'bg-red-100 text-red-600',
  EXPIRADO: 'bg-orange-100 text-orange-700',
};

export default function QuotesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [converting, setConverting] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => api.get('/quotes').then(r => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => api.put(`/quotes/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status atualizado!'); qc.invalidateQueries({ queryKey: ['quotes'] }); },
  });

  const convert = useMutation({
    mutationFn: ({ id, pm }: any) => api.post(`/quotes/${id}/convert`, { paymentMethod: pm }),
    onSuccess: () => { toast.success('Venda criada com sucesso!'); qc.invalidateQueries({ queryKey: ['quotes'] }); setConverting(null); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro ao converter'),
  });

  const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Orçamentos</h1>
        <button onClick={() => navigate('/quotes/new')} className="btn-primary flex items-center gap-2"><Plus size={18}/> Novo Orçamento</button>
      </div>
      {isLoading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['#','Cliente','Itens','Total','Status','Válido até','Ações'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((q: any) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">#{q.number}</td>
                  <td className="px-4 py-3 font-medium">{q.customer?.name ?? <span className="text-gray-400">Sem cliente</span>}</td>
                  <td className="px-4 py-3 text-gray-500">{q.items.length} item(ns)</td>
                  <td className="px-4 py-3 font-semibold text-yellow-900">{fmt(q.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status]}`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{q.validUntil ? new Date(q.validUntil).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {q.status === 'RASCUNHO' && (
                        <button onClick={() => updateStatus.mutate({ id:q.id, status:'ENVIADO' })} title="Marcar como Enviado" className="text-blue-500 hover:text-blue-700"><FileText size={15}/></button>
                      )}
                      {q.status === 'ENVIADO' && (<>
                        <button onClick={() => updateStatus.mutate({ id:q.id, status:'APROVADO' })} title="Aprovar" className="text-green-500 hover:text-green-700"><CheckCircle size={15}/></button>
                        <button onClick={() => updateStatus.mutate({ id:q.id, status:'RECUSADO' })} title="Recusar" className="text-red-400 hover:text-red-600"><XCircle size={15}/></button>
                      </>)}
                      {q.status === 'APROVADO' && !q.sale && (
                        <button onClick={() => setConverting(q.id)} title="Converter em Venda" className="text-yellow-700 hover:text-yellow-900 font-medium text-xs flex items-center gap-1">
                          <ShoppingCart size={14}/> Vender
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal conversão */}
      {converting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-lg mb-4">Forma de Pagamento</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value:'DINHEIRO',        label:'💵 Dinheiro' },
                { value:'PIX',             label:'📱 PIX' },
                { value:'CARTAO_DEBITO',   label:'💳 Débito' },
                { value:'CARTAO_CREDITO',  label:'💳 Crédito' },
              ].map(({ value, label }) => (
                <button key={value} onClick={() => convert.mutate({ id: converting, pm: value })}
                  disabled={convert.isPending}
                  className="btn-secondary text-sm py-3">{label}</button>
              ))}
            </div>
            <button onClick={() => setConverting(null)} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
