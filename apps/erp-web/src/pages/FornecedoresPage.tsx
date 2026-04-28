import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Truck, X, Phone, Mail, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

function FornecedorModal({ supplier, onClose }: { supplier?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!supplier;
  const [form, setForm] = useState({
    name:    supplier?.name    ?? '',
    cnpj:    supplier?.cnpj    ?? '',
    email:   supplier?.email   ?? '',
    phone:   supplier?.phone   ?? '',
    contact: supplier?.contact ?? '',
    address: supplier?.address ?? '',
    notes:   supplier?.notes   ?? '',
  });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: (d: any) =>
      isEdit ? api.put(`/suppliers/${supplier.id}`, d) : api.post('/suppliers', d),
    onSuccess: () => {
      toast.success(isEdit ? 'Atualizado!' : 'Fornecedor criado!');
      qc.invalidateQueries({ queryKey: ['fornecedores'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erro ao salvar'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg">{isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { k: 'name',    label: 'Nome / Razão Social*', ph: 'Joias Import Ltda' },
            { k: 'cnpj',    label: 'CNPJ',                 ph: '00.000.000/0001-00' },
            { k: 'contact', label: 'Contato',               ph: 'Carlos Mendes' },
            { k: 'email',   label: 'E-mail',                ph: 'contato@fornecedor.com' },
            { k: 'phone',   label: 'Telefone',              ph: '(81) 3000-0000' },
            { k: 'address', label: 'Endereço',              ph: 'Av. Boa Viagem, 100 — Recife' },
            { k: 'notes',   label: 'Observações',           ph: 'Prazo de entrega 15 dias' },
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

export default function FornecedoresPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['fornecedores', search],
    queryFn: () => api.get(`/suppliers${search ? `?search=${search}` : ''}`).then(r => r.data),
  });

  const active = data.filter((s: any) => s.active);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Fornecedores</h1>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome, CNPJ ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((s: any) => (
            <div
              key={s.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setModal(s)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <Truck size={18} className="text-yellow-700" />
                </div>
                <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{s.name}</h3>
              {s.cnpj    && <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Building2 size={12}/>{s.cnpj}</div>}
              {s.email   && <div className="flex items-center gap-1 text-xs text-gray-500 mb-1"><Mail size={12}/>{s.email}</div>}
              {s.phone   && <div className="flex items-center gap-1 text-xs text-gray-500"><Phone size={12}/>{s.phone}</div>}
              {s.contact && <p className="text-xs text-gray-400 mt-1">Contato: {s.contact}</p>}
            </div>
          ))}
          {active.length === 0 && !isLoading && (
            <div className="col-span-3 text-center py-12 text-gray-400">Nenhum fornecedor cadastrado.</div>
          )}
        </div>
      )}

      {modal && (
        <FornecedorModal
          supplier={modal !== 'new' ? modal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
