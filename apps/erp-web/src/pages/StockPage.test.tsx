import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import StockPage from './StockPage';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (sel: any) => sel({ token: 'tok', setAuth: vi.fn(), logout: vi.fn() }),
}));

import api from '../lib/api';
import toast from 'react-hot-toast';

const mockGet  = api.get  as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;

const makeMovement = (overrides = {}) => ({
  id: 'mov-1', type: 'ENTRADA', quantity: 3, reason: 'Reposição',
  createdAt: '2026-04-29T10:00:00Z',
  product: { id: 'prod-1', sku: 'AN-001', name: 'Anel Ouro 18k' },
  user: { id: 'user-1', name: 'Admin' },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockResolvedValue({ data: [] });
});

describe('StockPage', () => {
  describe('renderização', () => {
    it('exibe o título da página', async () => {
      renderWithProviders(<StockPage />);
      expect(screen.getByText('Movimentações de Estoque')).toBeInTheDocument();
    });

    it('exibe botão Nova Movimentação', async () => {
      renderWithProviders(<StockPage />);
      expect(screen.getByRole('button', { name: /Nova Movimentação/i })).toBeInTheDocument();
    });

    it('exibe filtros de tipo', async () => {
      renderWithProviders(<StockPage />);
      expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Entrada' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Saída' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ajuste' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Devolução' })).toBeInTheDocument();
    });

    it('exibe cabeçalhos da tabela', async () => {
      renderWithProviders(<StockPage />);
      await waitFor(() => expect(screen.getByText('Data/Hora')).toBeInTheDocument());
      expect(screen.getByText('Tipo')).toBeInTheDocument();
      expect(screen.getByText('Quantidade')).toBeInTheDocument();
    });

    it('exibe mensagem quando não há movimentações', async () => {
      renderWithProviders(<StockPage />);
      await waitFor(() =>
        expect(screen.getByText('Nenhuma movimentação registrada')).toBeInTheDocument(),
      );
    });
  });

  describe('listagem de movimentações', () => {
    it('exibe movimentações retornadas pela API', async () => {
      mockGet.mockResolvedValue({ data: [makeMovement()] });

      renderWithProviders(<StockPage />);

      await waitFor(() => expect(screen.getByText('Anel Ouro 18k')).toBeInTheDocument());
      expect(screen.getByText('AN-001')).toBeInTheDocument();
      expect(screen.getByText('Reposição')).toBeInTheDocument();
    });

    it('exibe quantidade com sinal + para ENTRADA', async () => {
      mockGet.mockResolvedValue({ data: [makeMovement({ type: 'ENTRADA', quantity: 5 })] });

      renderWithProviders(<StockPage />);

      await waitFor(() => expect(screen.getByText('+5')).toBeInTheDocument());
    });

    it('exibe quantidade com sinal − para SAIDA', async () => {
      mockGet.mockResolvedValue({ data: [makeMovement({ type: 'SAIDA', quantity: 2 })] });

      renderWithProviders(<StockPage />);

      await waitFor(() => expect(screen.getByText('-2')).toBeInTheDocument());
    });
  });

  describe('filtros', () => {
    it('marca filtro "Todos" como ativo por padrão', async () => {
      renderWithProviders(<StockPage />);
      const btn = screen.getByRole('button', { name: 'Todos' });
      expect(btn).toHaveClass('bg-yellow-600');
    });

    it('ativa filtro ao clicar e chama API com ?type=', async () => {
      renderWithProviders(<StockPage />);

      await userEvent.click(screen.getByRole('button', { name: 'Entrada' }));

      await waitFor(() =>
        expect(mockGet).toHaveBeenCalledWith('/stock/movements?type=ENTRADA'),
      );
      expect(screen.getByRole('button', { name: 'Entrada' })).toHaveClass('bg-yellow-600');
    });

    it('volta para "Todos" ao clicar novamente', async () => {
      renderWithProviders(<StockPage />);

      await userEvent.click(screen.getByRole('button', { name: 'Saída' }));
      await userEvent.click(screen.getByRole('button', { name: 'Todos' }));

      expect(screen.getByRole('button', { name: 'Todos' })).toHaveClass('bg-yellow-600');
    });
  });

  describe('modal Nova Movimentação', () => {
    beforeEach(() => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/products')) return Promise.resolve({ data: { data: [] } });
        return Promise.resolve({ data: [] });
      });
    });

    it('abre o modal ao clicar em Nova Movimentação', async () => {
      renderWithProviders(<StockPage />);

      await userEvent.click(screen.getByRole('button', { name: /Nova Movimentação/i }));

      expect(screen.getByRole('heading', { name: 'Nova Movimentação' })).toBeInTheDocument();
      expect(screen.getByLabelText('Produto *')).toBeInTheDocument();
      expect(screen.getByLabelText('Tipo *')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantidade *')).toBeInTheDocument();
    });

    it('fecha o modal ao clicar em Cancelar', async () => {
      renderWithProviders(<StockPage />);

      await userEvent.click(screen.getByRole('button', { name: /Nova Movimentação/i }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      await waitFor(() =>
        expect(screen.queryByLabelText('Produto *')).not.toBeInTheDocument(),
      );
    });

    it('botão Registrar fica desabilitado sem produto selecionado', async () => {
      renderWithProviders(<StockPage />);

      await userEvent.click(screen.getByRole('button', { name: /Nova Movimentação/i }));

      expect(screen.getByRole('button', { name: 'Registrar' })).toBeDisabled();
    });
  });
});
