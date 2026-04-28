import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package, Edit2, Trash2, X, Eye, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// ─── Config global de precificação ───────────────────────────────
const CONFIG_KEY = 'erp_pricing_config';
const CONFIG_DEFAULTS = { cotacao: 800, markup1: 1.5, markup2: 2.0 };

function usePricingConfig() {
  const [config, setConfigState] = useState(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      return saved ? { ...CONFIG_DEFAULTS, ...JSON.parse(saved) } : CONFIG_DEFAULTS;
    } catch { return CONFIG_DEFAULTS; }
  });
  const setConfig = (next: typeof CONFIG_DEFAULTS) => {
    setConfigState(next);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  };
  return { config, setConfig };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  sku: string;
  serialNumber?: string;
  name: string;
  description?: string;
  status: string;
  material?: string;
  stones?: string;
  weightGrams?: number;
  purityKarats?: number;
  color?: string;
  dimensions?: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  visibleOnSite?: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
  // Unidades
  unEstoque?: string;
  unCompra?: string;
  fatorConversao?: number;
  unidadePeso?: string;
  tamanho?: string;
  // Classificação
  tipoProduto?: string;
  vendido?: boolean;
  estocado?: boolean;
  comprado?: boolean;
  produzido?: boolean;
  usadoParaCompor?: boolean;
  kitVenda?: boolean;
  pdv?: boolean;
  favorito?: boolean;
  // Agrupamento
  grupoProdutos?: string;
  subgrupoProdutos?: string;
  mercadoAlvo?: string;
  // Custos e Preços
  valorCompraAu?: number;
  moedaCompra?: string;
  markup?: number;
  markup2?: number;
  precoMoeda?: number;
  preco2?: number;
  valorAu?: number;
  custoMedio?: number;
  // Fornecedor
  fornecedorNome?: string;
  fornecedorCodigo?: string;
  codigoFornecedor?: string;
}

const emptyProduct = (): Partial<Product> => ({
  sku: '', name: '', description: '', material: '', stones: '',
  costPrice: 0, salePrice: 0, stock: 0, minStock: 1,
  unEstoque: 'UN', unCompra: 'UN', fatorConversao: 1, unidadePeso: 'GR',
  tipoProduto: 'PRODUTO', moedaCompra: 'AU',
  vendido: true, estocado: true, comprado: true,
  produzido: false, usadoParaCompor: false, kitVenda: false, pdv: false, favorito: false,
});

// ─── New Product Modal ─────────────────────────────────────────────────────────

function NewProductModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    sku: '', name: '', material: '',
    moedaCompra: 'AU', valorCompraAu: '', costPrice: '', salePrice: '', stock: '0',
  });

  const save = useMutation({
    mutationFn: (data: any) => api.post('/products', data),
    onSuccess: () => {
      toast.success('Produto criado!');
      qc.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: () => toast.error('Erro ao criar produto'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">Novo Produto</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-gray-700" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input className="input" placeholder="AN-001" value={form.sku} onChange={set('sku')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <input className="input" placeholder="Ouro 18k" value={form.material} onChange={set('material')} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input className="input" placeholder="Anel Solitário Ouro 18k" value={form.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moeda Compra</label>
              <select className="input" value={form.moedaCompra} onChange={set('moedaCompra')}>
                {['AU','BRL','USD','EUR','ARS'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Compra AU</label>
              <input className="input" type="number" placeholder="0" value={form.valorCompraAu} onChange={set('valorCompraAu')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo R$</label>
              <input className="input" type="number" placeholder="0" value={form.costPrice} onChange={set('costPrice')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço R$</label>
              <input className="input" type="number" placeholder="0" value={form.salePrice} onChange={set('salePrice')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
              <input className="input" type="number" placeholder="0" value={form.stock} onChange={set('stock')} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button
            onClick={() => save.mutate(form)}
            disabled={save.isPending || !form.sku || !form.name}
            className="btn-primary flex-1"
          >
            {save.isPending ? 'Salvando...' : 'Criar Produto'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer ────────────────────────────────────────────────────────────────────

const TABS = ['Dados Gerais', 'Classificação', 'Custos e Preços', 'Fornecedor'] as const;
type Tab = typeof TABS[number];

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value ?? <span className="text-gray-400">—</span>}</div>
    </div>
  );
}

function InputField({
  label, value, onChange, type = 'text', readOnly = false, placeholder = '', multiline = false,
}: {
  label: string; value: any; onChange?: (v: any) => void; type?: string;
  readOnly?: boolean; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
      {readOnly ? (
        <div className="text-sm font-medium text-gray-800 py-1.5 whitespace-pre-wrap">{value ?? <span className="text-gray-400">—</span>}</div>
      ) : multiline ? (
        <textarea
          rows={4}
          className="input text-sm py-1.5 resize-y"
          value={value ?? ''}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="input text-sm py-1.5"
          value={value ?? ''}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
        />
      )}
    </div>
  );
}

function CheckboxField({ label, checked, onChange, editing }: {
  label: string; checked: boolean; onChange?: (v: boolean) => void; editing: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm cursor-pointer ${!editing ? 'pointer-events-none' : ''}`}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={e => onChange?.(e.target.checked)}
        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
        readOnly={!editing}
      />
      <span className={checked ? 'text-gray-800 font-medium' : 'text-gray-500'}>{label}</span>
    </label>
  );
}

function ProductDrawer({
  product: initial,
  onClose,
  onRefresh,
  pricingConfig,
  setPricingConfig,
}: {
  product: Product;
  onClose: () => void;
  onRefresh: () => void;
  pricingConfig: typeof CONFIG_DEFAULTS;
  setPricingConfig: (c: typeof CONFIG_DEFAULTS) => void;
}) {
  const [tab, setTab] = useState<Tab>('Dados Gerais');
  const [editing, setEditing] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);
  const [localConfig, setLocalConfig] = useState(pricingConfig);
  const [form, setForm] = useState<Partial<Product>>({ ...initial });
  const overlayRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => { setForm({ ...initial }); setEditing(false); }, [initial]);
  useEffect(() => { setLocalConfig(pricingConfig); }, [pricingConfig]);

  const setF = (k: keyof Product) => (v: any) => setForm(p => ({ ...p, [k]: v }));
  const setFBool = (k: keyof Product) => (v: boolean) => setForm(p => ({ ...p, [k]: v }));

  // Preços calculados pelo peso
  const peso = Number(form.weightGrams ?? 0);
  const custoBase = peso * localConfig.cotacao;
  const precoCalc1 = custoBase * localConfig.markup1;
  const precoCalc2 = custoBase * localConfig.markup2;

  const save = useMutation({
    mutationFn: (data: any) => api.put(`/products/${initial.id}`, data),
    onSuccess: () => {
      toast.success('Produto atualizado!');
      qc.invalidateQueries({ queryKey: ['products'] });
      onRefresh();
      setEditing(false);
    },
    onError: () => toast.error('Erro ao salvar produto'),
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const fmt = (v?: number | null) =>
    v != null ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-[640px] h-full flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b bg-yellow-50">
          <div>
            <p className="text-xs font-mono text-gray-500 mb-0.5">{initial.sku}</p>
            <h2 className="font-bold text-lg text-yellow-900 leading-tight">{initial.name}</h2>
            {initial.category && (
              <p className="text-xs text-gray-500 mt-0.5">{initial.category.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4 mt-0.5">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
              >
                <Edit2 size={14} /> Editar
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto shrink-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t
                  ? 'border-yellow-600 text-yellow-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Aba 1: Dados Gerais ─────────────────────────────────── */}
          {tab === 'Dados Gerais' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="SKU / Modelo" value={initial.sku} />
                <Field label="N° Serial" value={initial.serialNumber} />
              </div>

              <InputField label="Nome do Produto" value={form.name} onChange={setF('name')} readOnly={!editing} />
              <InputField label="Descrição" value={form.description} onChange={setF('description')} readOnly={!editing} multiline />

              <div className="grid grid-cols-3 gap-4">
                <InputField label="Material" value={form.material} onChange={setF('material')} readOnly={!editing} />
                <InputField label="Un. Estoque" value={form.unEstoque} onChange={setF('unEstoque')} readOnly={!editing} placeholder="UN" />
                <InputField label="Un. Compra" value={form.unCompra} onChange={setF('unCompra')} readOnly={!editing} placeholder="UN" />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <InputField label="Fator Conversão" value={form.fatorConversao} onChange={setF('fatorConversao')} type="number" readOnly={!editing} />
                <InputField label="Peso (g)" value={form.weightGrams} onChange={setF('weightGrams')} type="number" readOnly={!editing} />
                <InputField label="Un. Peso" value={form.unidadePeso} onChange={setF('unidadePeso')} readOnly={!editing} placeholder="GR" />
                <InputField label="Tamanho" value={form.tamanho} onChange={setF('tamanho')} readOnly={!editing} />
              </div>

              <InputField label="Pedras (stones)" value={form.stones} onChange={setF('stones')} readOnly={!editing} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Status</label>
                  {editing ? (
                    <select
                      className="input text-sm py-1.5"
                      value={form.status}
                      onChange={e => setF('status')(e.target.value)}
                    >
                      {['ATIVO','INATIVO','CONSIGNADO'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={initial.status === 'ATIVO' ? 'badge-active' : 'badge-inactive'}>
                      {initial.status}
                    </span>
                  )}
                </div>
                <Field label="Categoria" value={initial.category?.name} />
              </div>
            </div>
          )}

          {/* ── Aba 2: Classificação ────────────────────────────────── */}
          {tab === 'Classificação' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Produto</label>
                <div className="flex flex-wrap gap-4">
                  {['PRODUTO','SERVICO','MOEDA','INSUMO'].map(t => (
                    <label key={t} className={`flex items-center gap-2 text-sm cursor-pointer ${!editing ? 'pointer-events-none' : ''}`}>
                      <input
                        type="radio"
                        name="tipoProduto"
                        checked={form.tipoProduto === t}
                        onChange={() => setF('tipoProduto')(t)}
                        className="text-yellow-600 focus:ring-yellow-500"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ['vendido',        'Vendido'],
                    ['estocado',       'Estocado'],
                    ['comprado',       'Comprado'],
                    ['produzido',      'Produzido'],
                    ['usadoParaCompor','Usado p/ Compor'],
                    ['kitVenda',       'Kit de Venda'],
                    ['pdv',            'PDV'],
                    ['favorito',       'Favorito'],
                  ] as [keyof Product, string][]).map(([k, label]) => (
                    <CheckboxField
                      key={k}
                      label={label}
                      checked={!!(form as any)[k]}
                      onChange={setFBool(k)}
                      editing={editing}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <InputField label="Grupo de Produtos" value={form.grupoProdutos} onChange={setF('grupoProdutos')} readOnly={!editing} />
                <InputField label="Subgrupo" value={form.subgrupoProdutos} onChange={setF('subgrupoProdutos')} readOnly={!editing} />
                <InputField label="Mercado-alvo" value={form.mercadoAlvo} onChange={setF('mercadoAlvo')} readOnly={!editing} />
              </div>
            </div>
          )}

          {/* ── Aba 3: Custos e Preços ──────────────────────────────── */}
          {tab === 'Custos e Preços' && (
            <div className="space-y-5">

              {/* Parâmetros globais */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Settings size={13} /> Parâmetros Globais
                  </div>
                  {editingConfig ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingConfig(false); setLocalConfig(pricingConfig); }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >Cancelar</button>
                      <button
                        onClick={() => { setPricingConfig(localConfig); setEditingConfig(false); }}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                      >Salvar</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingConfig(true)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Edit2 size={11} /> Editar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Cotação R$/g', key: 'cotacao' as const },
                    { label: 'Markup 1',     key: 'markup1' as const },
                    { label: 'Markup 2',     key: 'markup2' as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <div className="text-xs text-blue-600 mb-0.5">{label}</div>
                      {editingConfig ? (
                        <input
                          type="number"
                          step="0.001"
                          className="input text-sm py-1"
                          value={localConfig[key]}
                          onChange={e => setLocalConfig(c => ({ ...c, [key]: Number(e.target.value) }))}
                        />
                      ) : (
                        <div className="text-sm font-bold text-blue-900">
                          {key === 'cotacao'
                            ? `R$ ${Number(localConfig[key]).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : Number(localConfig[key]).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preços calculados pelo peso */}
              {peso > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">
                    Preços calculados — Peso: {peso}g × R$ {localConfig.cotacao}/g
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Custo base</div>
                      <div className="text-sm font-bold text-gray-700">R$ {fmt(custoBase)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Markup 1 × {localConfig.markup1}</div>
                      <div className="text-base font-bold text-yellow-700">R$ {fmt(precoCalc1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Markup 2 × {localConfig.markup2}</div>
                      <div className="text-base font-bold text-orange-600">R$ {fmt(precoCalc2)}</div>
                    </div>
                  </div>
                </div>
              )}
              {peso === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-1">
                  Informe o Peso (g) na aba Dados Gerais para ver os preços calculados.
                </p>
              )}

              {/* Campos manuais */}
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Valor de Compra (AU)" value={form.valorCompraAu} onChange={setF('valorCompraAu')} type="number" readOnly={!editing} />
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Moeda</label>
                  {editing ? (
                    <select
                      className="input text-sm py-1.5"
                      value={form.moedaCompra ?? 'AU'}
                      onChange={e => setF('moedaCompra')(e.target.value)}
                    >
                      {['AU','BRL','USD','EUR','ARS'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  ) : (
                    <div className="text-sm font-medium text-gray-800 py-1.5">{form.moedaCompra ?? 'AU'}</div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Preços Manuais</div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Custo R$"      value={form.costPrice}  onChange={setF('costPrice')}  type="number" readOnly={!editing} />
                  <InputField label="Preço R$"      value={form.salePrice}  onChange={setF('salePrice')}  type="number" readOnly={!editing} />
                  <InputField label="Preço 2 R$"    value={form.preco2}     onChange={setF('preco2')}     type="number" readOnly={!editing} />
                  <InputField label="Custo Médio"   value={form.custoMedio} onChange={setF('custoMedio')} type="number" readOnly={!editing} />
                  <InputField label="Valor AU"      value={form.valorAu}    onChange={setF('valorAu')}    type="number" readOnly={!editing} />
                  <InputField label="Preço na Moeda" value={form.precoMoeda} onChange={setF('precoMoeda')} type="number" readOnly={!editing} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Estoque Atual"  value={form.stock}    onChange={setF('stock')}    type="number" readOnly={!editing} />
                <InputField label="Estoque Mínimo" value={form.minStock} onChange={setF('minStock')} type="number" readOnly={!editing} />
              </div>
            </div>
          )}

          {/* ── Aba 4: Fornecedor ────────────────────────────────────── */}
          {tab === 'Fornecedor' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Cód. Fornecedor (interno)" value={form.fornecedorCodigo} onChange={setF('fornecedorCodigo')} readOnly={!editing} />
                <InputField label="Nome Fornecedor" value={form.fornecedorNome} onChange={setF('fornecedorNome')} readOnly={!editing} />
              </div>

              <InputField label="Cód. do Produto no Fornecedor" value={form.codigoFornecedor} onChange={setF('codigoFornecedor')} readOnly={!editing} />

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumo de Custos</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Custo Médio" value={initial.custoMedio != null ? `R$ ${fmt(initial.custoMedio)}` : undefined} />
                  <Field label="Valor de Compra (AU)" value={initial.valorCompraAu != null ? `${initial.moedaCompra ?? 'AU'} ${fmt(initial.valorCompraAu)}` : undefined} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Status do Produto</label>
                {editing ? (
                  <select
                    className="input text-sm py-1.5"
                    value={form.status}
                    onChange={e => setF('status')(e.target.value)}
                  >
                    {['ATIVO','INATIVO','CONSIGNADO'].map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className={initial.status === 'ATIVO' ? 'badge-active' : 'badge-inactive'}>
                    {initial.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {editing && (
          <div className="flex gap-3 p-4 border-t bg-gray-50 shrink-0">
            <button
              onClick={() => { setForm({ ...initial }); setEditing(false); }}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={() => save.mutate(form)}
              disabled={save.isPending}
              className="btn-primary flex-1"
            >
              {save.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [drawer, setDrawer] = useState<Product | null>(null);
  const qc = useQueryClient();
  const { config: pricingConfig, setConfig: setPricingConfig } = usePricingConfig();

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => api.get(`/products${search ? `?search=${search}` : ''}`).then(r => r.data),
  });

  // Refresh drawer product from fresh list data
  useEffect(() => {
    if (drawer && data?.data) {
      const fresh = data.data.find((p: Product) => p.id === drawer.id);
      if (fresh) setDrawer(fresh);
    }
  }, [data]);

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Produto desativado');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-yellow-900">Produtos</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por nome ou SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['SKU','Nome','Material','Estoque','Custo R$','Preço R$','Status','Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data?.map((p: Product) => (
                <tr
                  key={p.id}
                  className="hover:bg-yellow-50/50 transition-colors cursor-pointer"
                  onClick={() => setDrawer(p)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-2">
                      <Package size={14} className="text-yellow-600 shrink-0" />
                      {p.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.material ?? '—'}</td>
                  <td className={`px-4 py-3 font-medium ${Number(p.stock) <= 2 ? 'text-red-600' : 'text-gray-700'}`}>
                    {Number(p.stock)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    R$ {Number(p.costPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-medium text-yellow-800">
                    R$ {Number(p.salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.status === 'ATIVO' ? 'badge-active' : 'badge-inactive'}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDrawer(p)}
                        title="Ver detalhes"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => window.confirm('Desativar este produto?') && remove.mutate(p.id)}
                        title="Desativar"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.data?.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {data?.total > 0 && (
            <div className="px-4 py-3 border-t text-xs text-gray-500 bg-gray-50">
              {data.total} produto(s) encontrado(s)
            </div>
          )}
        </div>
      )}

      {showNew && <NewProductModal onClose={() => setShowNew(false)} />}

      {drawer && (
        <ProductDrawer
          product={drawer}
          onClose={() => setDrawer(null)}
          onRefresh={() => qc.invalidateQueries({ queryKey: ['products'] })}
          pricingConfig={pricingConfig}
          setPricingConfig={setPricingConfig}
        />
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.22s ease-out; }
      `}</style>
    </div>
  );
}
