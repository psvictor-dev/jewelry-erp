import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import api from '../lib/api';

export default function DREPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const { data: dre, isLoading } = useQuery({
    queryKey: ['dre', month, year],
    queryFn: () => api.get(`/financial/dre?month=${month}&year=${year}`).then(r => r.data),
  });

  const fmt = (v: number) => v?.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }) ?? 'R$ 0,00';
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-yellow-700"/>
        <h1 className="text-2xl font-bold text-yellow-900">DRE — Demonstrativo de Resultados</h1>
      </div>

      <div className="card mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
          <select className="input w-32" value={month} onChange={e => setMonth(+e.target.value)}>
            {meses.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <select className="input w-28" value={year} onChange={e => setYear(+e.target.value)}>
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? <div className="text-center py-12 text-gray-400">Calculando...</div> : dre && (
        <div className="card">
          <h2 className="font-bold text-center text-gray-700 mb-6 text-lg">
            {meses[month-1]} / {year}
          </h2>

          {/* Receita */}
          <div className="mb-4">
            <div className="flex justify-between py-2 border-b-2 border-green-200">
              <span className="font-bold text-green-700">RECEITA BRUTA</span>
              <span className="font-bold text-green-700">{fmt(dre.receitas.total)}</span>
            </div>
            {dre.receitas.items.map((i: any, k: number) => (
              <div key={k} className="flex justify-between py-1.5 text-sm pl-4 text-gray-600">
                <span>{i.description}</span><span>{fmt(i.amount)}</span>
              </div>
            ))}
          </div>

          {/* CMV */}
          <div className="flex justify-between py-2 border-b text-sm">
            <span className="text-red-500">(-) Custo Mercadoria Vendida (CMV)</span>
            <span className="text-red-500">({fmt(dre.cmv)})</span>
          </div>

          {/* Lucro bruto */}
          <div className="flex justify-between py-2.5 border-b-2 border-blue-200 mb-4">
            <span className="font-bold text-blue-700">LUCRO BRUTO</span>
            <span className="font-bold text-blue-700">{fmt(dre.lucroBruto)}</span>
          </div>

          {/* Despesas operacionais */}
          <div className="mb-4">
            <div className="flex justify-between py-2 border-b text-sm font-semibold text-gray-600">
              <span>(-) Despesas Operacionais</span>
              <span>({fmt(dre.despesasOperacionais.total)})</span>
            </div>
            {dre.despesasOperacionais.items.map((i: any, k: number) => (
              <div key={k} className="flex justify-between py-1.5 text-sm pl-4 text-gray-500">
                <span>{i.description}</span><span>({fmt(i.amount)})</span>
              </div>
            ))}
          </div>

          {/* Lucro líquido */}
          <div className={`flex justify-between py-3 border-t-2 ${dre.lucroLiquido >= 0 ? 'border-green-300':'border-red-300'}`}>
            <span className={`font-bold text-lg ${dre.lucroLiquido >= 0 ? 'text-green-700':'text-red-700'}`}>LUCRO LÍQUIDO</span>
            <span className={`font-bold text-lg ${dre.lucroLiquido >= 0 ? 'text-green-700':'text-red-700'}`}>{fmt(dre.lucroLiquido)}</span>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            {[
              { label:'Margem Líquida', value:`${dre.margemLiquida}%` },
              { label:'Total Vendas',   value: dre.totalVendas },
              { label:'Ticket Médio',   value: fmt(dre.ticketMedio) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-gray-50 rounded-lg p-3">
                <div className="font-bold text-yellow-900">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Pendentes */}
          {(dre.pendentes.receitas > 0 || dre.pendentes.despesas > 0) && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="font-bold text-green-700">{fmt(dre.pendentes.receitas)}</div>
                <div className="text-xs text-green-600 mt-1">A receber (pendente)</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="font-bold text-red-700">{fmt(dre.pendentes.despesas)}</div>
                <div className="text-xs text-red-600 mt-1">A pagar (pendente)</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
