import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCog, X, Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const ROLES = [
  { value: 'ADMIN',      label: 'Administrador' },
  { value: 'GERENTE',    label: 'Gerente' },
  { value: 'VENDEDOR',   label: 'Vendedor' },
  { value: 'ESTOQUISTA', label: 'Estoquista' },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:      'bg-red-100 text-red-700',
  GERENTE:    'bg-purple-100 text-purple-700',
  VENDEDOR:   'bg-blue-100 text-blue-700',
  ESTOQUISTA: 'bg-green-100 text-green-700',
};

function UserModal({ member, onClose }: { member?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!member;
  const [form, setForm] = useState({
    name:     member?.name     ?? '',
    email:    member?.email    ?? '',
    password: '',
    role:     member?.role     ?? 'VENDEDOR',
  });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: (d: any) =>
      isEdit
        ? api.put(`/users/${member.id}`, d)
        : api.post('/users', d),
    onSuccess: () => {
      toast.success(isEdit ? 'Atualizado!' : 'Membro criado!');
      qc.invalidateQueries({ queryKey: ['equipe'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erro ao salvar'),
  });

  const handleSave = () => {
    const payload: any = { name: form.name, email: form.email, role: form.role };
    if (!isEdit || form.password) payload.password = form.password;
    save.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg">{isEdit ? 'Editar Membro' : 'Novo Membro da Equipe'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
            <input className="input" placeholder="João da Silva" value={form.name} onChange={f('name')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail*</label>
            <input className="input" type="email" placeholder="joao@joalheria.com" value={form.email} onChange={f('email')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEdit ? 'Nova Senha (deixe em branco para manter)' : 'Senha*'}
            </label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={f('password')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo*</label>
            <select className="input" value={form.role} onChange={f('role')}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={save.isPending} className="btn-primary flex-1">
            {save.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EquipePage() {
  const [modal, setModal] = useState<any>(null);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['equipe'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: (m: any) =>
      m.active
        ? api.delete(`/users/${m.id}`)
        : api.put(`/users/${m.id}`, { active: true }),
    onSuccess: () => { toast.success('Atualizado!'); qc.invalidateQueries({ queryKey: ['equipe'] }); },
    onError: () => toast.error('Erro ao atualizar'),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Equipe</h1>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Membro
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((m: any) => (
            <div
              key={m.id}
              className={`card transition-shadow ${m.active ? 'hover:shadow-md cursor-pointer' : 'opacity-60'}`}
              onClick={() => m.active && setModal(m)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <UserCog size={18} className="text-yellow-700" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {ROLES.find(r => r.value === m.role)?.label ?? m.role}
                  </span>
                  {!m.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Inativo</span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{m.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{m.email}</p>
              <button
                onClick={e => { e.stopPropagation(); toggleActive.mutate(m); }}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  m.active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'
                }`}
              >
                {m.active ? <><ShieldOff size={13} /> Desativar</> : <><Shield size={13} /> Reativar</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <UserModal
          member={modal !== 'new' ? modal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
