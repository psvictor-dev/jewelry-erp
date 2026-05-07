import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import LoginPage from './LoginPage';

vi.mock('../lib/api', () => ({
  default: { post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (sel: any) => sel({ setAuth: vi.fn(), token: null, logout: vi.fn() }),
}));

import api from '../lib/api';
import toast from 'react-hot-toast';

const mockPost = api.post as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

describe('LoginPage', () => {
  describe('renderização', () => {
    it('exibe título ERP Joalheria', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByText('ERP Joalheria')).toBeInTheDocument();
    });

    it('exibe campos de e-mail e senha', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    });

    it('exibe botão Entrar', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('preenche os campos com valores padrão', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByLabelText('E-mail')).toHaveValue('admin@erp-joalheria.com');
      expect(screen.getByLabelText('Senha')).toHaveValue('Admin@2024');
    });
  });

  describe('login com sucesso', () => {
    it('chama POST /auth/login com e-mail e senha', async () => {
      mockPost.mockResolvedValue({ data: { access_token: 'tok', user: { name: 'Admin' } } });

      renderWithProviders(<LoginPage />);
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@erp-joalheria.com',
        password: 'Admin@2024',
      });
    });

    it('exibe toast de boas-vindas após login', async () => {
      mockPost.mockResolvedValue({ data: { access_token: 'tok', user: {} } });

      renderWithProviders(<LoginPage />);
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Bem-vindo!'));
    });
  });

  describe('erro de login', () => {
    it('exibe toast de erro quando credenciais inválidas', async () => {
      mockPost.mockRejectedValue(new Error('401'));

      renderWithProviders(<LoginPage />);
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('E-mail ou senha inválidos'));
    });

    it('habilita o botão novamente após erro', async () => {
      mockPost.mockRejectedValue(new Error('401'));

      renderWithProviders(<LoginPage />);
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled());
    });
  });

  describe('interação com teclado', () => {
    it('submete o formulário ao pressionar Enter no campo senha', async () => {
      mockPost.mockResolvedValue({ data: { access_token: 'tok', user: {} } });

      renderWithProviders(<LoginPage />);
      fireEvent.keyDown(screen.getByLabelText('Senha'), { key: 'Enter' });

      await waitFor(() => expect(mockPost).toHaveBeenCalled());
    });
  });

  describe('estado de carregamento', () => {
    it('desabilita botão e exibe "Entrando..." durante o login', async () => {
      mockPost.mockImplementation(() => new Promise(() => {})); // nunca resolve

      renderWithProviders(<LoginPage />);
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

      expect(screen.getByRole('button', { name: /Entrando/i })).toBeDisabled();
    });
  });
});
