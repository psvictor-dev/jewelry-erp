import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Gem, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('admin@erp-joalheria.com');
  const [password, setPassword] = useState('Admin@2024');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.access_token, data.user);
      toast.success('Bem-vindo!');
      navigate('/');
    } catch {
      toast.error('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-yellow-700 rounded-full p-3">
              <Gem size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-yellow-900">ERP Joalheria</h1>
          <p className="text-gray-500 text-sm mt-1">Faça login para continuar</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button onClick={handleLogin} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
