import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, X, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

function CustomerModal({ customer, onClose }: { customer?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!customer;
  const [form, setForm] = useState({ name: customer?.name ?? '', email: customer?.email ?? '', phone: customer?.phone ?? '', cpf: customer?.cpf ?? '', address: customer?.address ?? '', notes: customer?.notes ?? '' });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: (d: any) => isEdit ? api.put(`/customers/${customer.id}`, d) : api.post('/customers', d),
    onSuccess: () => { toast.success(isEdit ? 'Atualizado!' : 'Criado!'); qc.invalidateQueries({ queryKey: ['customers'] }); onClose(); },
    onError: () => toast.error('Erro ao salvar'),
  });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { k:'name',    label:'Nome*',     ph:'Maria Silva' },
            { k:'email',   label:'E-mail',    ph:'maria@email.com' },
            { k:'phone',   label:'Telefone',  ph:'(81) 99999-0001' },
            { k:'cpf',     label:'CPF',       ph:'111.111.111-01' },
            { k:'address', label:'Endereço',  ph:'Rua das Flores, 123' },
            { k:'notes',   label:'Observações', ph:'VIP, prefere whatsapp' },
          ].map(({ k, label, ph }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input className="input" placeholder={ph} value={(form as any)[k]} onChange={f(k)} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={() => save.mutate(form)} disabled={save.isPending} className="btn-primary flex-1">
            {save.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState<any>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => api.get(`/customers${search ? `?search=${search}` : ''}`).then(r => r.data),
  });
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Clientes</h1>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2"><Plus size={18}/> Novo Cliente</button>
      </div>
      <div className="card mb-6">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="input pl-9" placeholder="Buscar por nome, e-mail, CPF ou telefone..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>
      {isLoading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((c: any) => (
            <div key={c.id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setModal(c)}>
              <div className="flex items-start justify-between mb-3">
                <div className="bg-yellow-100 rounded-full p-2"><Users size={18} className="text-yellow-700"/></div>
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{c.name}</h3>
              {c.email && <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Mail size={12}/>{c.email}</div>}
              {c.phone && <div className="flex items-center gap-1 text-xs text-gray-500"><Phone size={12}/>{c.phone}</div>}
            </div>
          ))}
        </div>
      )}
      {modal && <CustomerModal customer={modal !== 'new' ? modal : undefined} onClose={() => setModal(null)} />}
    </div>
  );
}
