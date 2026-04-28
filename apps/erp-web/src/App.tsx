import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import EquipePage from './pages/EquipePage';
import FornecedoresPage from './pages/FornecedoresPage';
import QuotesPage from './pages/QuotesPage';
import QuoteNewPage from './pages/QuoteNewPage';
import SalesPage from './pages/SalesPage';
import SaleNewPage from './pages/SaleNewPage';
import FinancialPage from './pages/FinancialPage';
import DREPage from './pages/DREPage';
import LancamentosPage from './pages/LancamentosPage';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products"  element={<ProductsPage />} />

        {/* Contas */}
        <Route path="customers" element={<Navigate to="/contas/clientes" replace />} />
        <Route path="contas/clientes"     element={<CustomersPage />} />
        <Route path="contas/equipe"       element={<EquipePage />} />
        <Route path="contas/fornecedores" element={<FornecedoresPage />} />

        <Route path="quotes"    element={<QuotesPage />} />
        <Route path="quotes/new" element={<QuoteNewPage />} />
        <Route path="sales"     element={<SalesPage />} />
        <Route path="sales/new" element={<SaleNewPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="financial/dre" element={<DREPage />} />
        <Route path="lancamentos" element={<LancamentosPage />} />
      </Route>
    </Routes>
  );
}
