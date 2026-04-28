import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard, Package, FileText,
  ShoppingCart, Wallet, BarChart3, LogOut, Gem, ClipboardList,
  Users, Truck, UserCog, ChevronDown, BookUser,
} from 'lucide-react';

const mainNav = [
  { to: '/',              label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/products',      label: 'Produtos',    Icon: Package },
  { to: '/quotes',        label: 'Orçamentos',  Icon: FileText },
  { to: '/sales',         label: 'Vendas',      Icon: ShoppingCart },
  { to: '/financial',     label: 'Financeiro',  Icon: Wallet },
  { to: '/financial/dre', label: 'DRE',         Icon: BarChart3 },
  { to: '/lancamentos',   label: 'Lançamentos', Icon: ClipboardList },
];

const contasNav = [
  { to: '/contas/clientes',     label: 'Clientes',     Icon: Users },
  { to: '/contas/equipe',       label: 'Equipe',       Icon: UserCog },
  { to: '/contas/fornecedores', label: 'Fornecedores', Icon: Truck },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const [contasOpen, setContasOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F7F4EF]">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-60 bg-yellow-950 text-white flex flex-col shadow-xl shrink-0">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-yellow-900/60">
          <div className="flex items-center gap-2.5">
            <div className="bg-yellow-500/20 rounded-lg p-1.5">
              <Gem size={20} className="text-yellow-400" />
            </div>
            <div>
              <span className="font-bold text-base text-white leading-tight block">ERP Joalheria</span>
              <span className="text-[10px] text-yellow-400/70 uppercase tracking-widest">Sistema de Gestão</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-yellow-600/60 uppercase tracking-widest px-3 mb-2">Menu</p>

          {mainNav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-600 text-white shadow-sm'
                    : 'text-yellow-200/70 hover:bg-yellow-900/60 hover:text-yellow-100'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {/* Contas group */}
          <div className="pt-2">
            <button
              onClick={() => setContasOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-yellow-200/70 hover:bg-yellow-900/60 hover:text-yellow-100 transition-all"
            >
              <span className="flex items-center gap-3">
                <BookUser size={17} />
                Contas
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${contasOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {contasOpen && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-yellow-800/50 pl-3">
                {contasNav.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-yellow-600 text-white shadow-sm'
                          : 'text-yellow-200/70 hover:bg-yellow-900/60 hover:text-yellow-100'
                      }`
                    }
                  >
                    <Icon size={15} />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer / usuário */}
        <div className="px-4 py-4 border-t border-yellow-900/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-yellow-200 shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-yellow-500/70 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm text-yellow-300/60 hover:text-yellow-200 transition-colors px-1"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </aside>

      {/* ── Conteúdo ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
