import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      toast.success('Categoria criada!');
      qc.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
    },
    onError: () => toast.error('Erro ao criar categoria'),
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.put(`/categories/${id}`, { name }),
    onSuccess: () => {
      toast.success('Categoria renomeada!');
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
    },
    onError: () => toast.error('Erro ao renomear categoria'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Categoria removida!');
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => toast.error('Não foi possível remover — categoria pode ter produtos vinculados'),
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-900 mb-6">Categorias</h1>

      <div className="card mb-6">
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Nome da nova categoria..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && newName.trim() && create.mutate(newName.trim())}
          />
          <button
            onClick={() => create.mutate(newName.trim())}
            disabled={create.isPending || !newName.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Criar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Nenhuma categoria cadastrada</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produtos</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-yellow-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {editingId === cat.id ? (
                        <input
                          className="input text-sm py-1.5"
                          value={editName}
                          autoFocus
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && editName.trim())
                              update.mutate({ id: cat.id, name: editName.trim() });
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className="flex items-center gap-2 font-medium">
                          <Tag size={14} className="text-yellow-600" />
                          {cat.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{cat._count?.products ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingId === cat.id ? (
                          <>
                            <button
                              onClick={() => editName.trim() && update.mutate({ id: cat.id, name: editName.trim() })}
                              disabled={update.isPending}
                              className="text-green-600 hover:text-green-800"
                              title="Salvar"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Cancelar"
                            >
                              <X size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Renomear"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() =>
                                window.confirm(`Remover a categoria "${cat.name}"?`) &&
                                remove.mutate(cat.id)
                              }
                              className="text-red-500 hover:text-red-700"
                              title="Remover"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
