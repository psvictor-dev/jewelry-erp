import { Test } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const mockUsers = { findByEmail: jest.fn(), create: jest.fn() };
const mockJwt   = { sign: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsers },
        { provide: JwtService,   useValue: mockJwt   },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('retorna usuário sem senha com credenciais válidas', async () => {
      const hash = await bcrypt.hash('senha123', 1);
      mockUsers.findByEmail.mockResolvedValue({ id: '1', email: 'a@a.com', password: hash, active: true, role: 'ADMIN' });

      const result = await service.validateUser('a@a.com', 'senha123');

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: '1', email: 'a@a.com' });
    });

    it('lança UnauthorizedException se usuário não existe', async () => {
      mockUsers.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('x@x.com', 'qualquer')).rejects.toThrow(UnauthorizedException);
    });

    it('lança UnauthorizedException se usuário está inativo', async () => {
      mockUsers.findByEmail.mockResolvedValue({ id: '1', active: false, password: 'hash' });

      await expect(service.validateUser('a@a.com', 'senha')).rejects.toThrow(UnauthorizedException);
    });

    it('lança UnauthorizedException se senha incorreta', async () => {
      const hash = await bcrypt.hash('correta', 1);
      mockUsers.findByEmail.mockResolvedValue({ id: '1', active: true, password: hash });

      await expect(service.validateUser('a@a.com', 'errada')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('retorna access_token e dados do usuário', async () => {
      mockJwt.sign.mockReturnValue('token-jwt');
      const user = { id: '1', email: 'a@a.com', role: 'ADMIN' };

      const result = await service.login(user);

      expect(result).toEqual({ access_token: 'token-jwt', user });
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: '1', email: 'a@a.com', role: 'ADMIN' });
    });
  });

  describe('register', () => {
    it('cria usuário novo e retorna sem senha', async () => {
      mockUsers.findByEmail.mockResolvedValue(null);
      mockUsers.create.mockResolvedValue({ id: '2', name: 'João', email: 'j@j.com', password: 'hash', role: 'VENDEDOR' });

      const result = await service.register({ name: 'João', email: 'j@j.com', password: 'Abc@1234', role: 'VENDEDOR' as any });

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ id: '2', name: 'João' });
    });

    it('lança ConflictException se e-mail já existe', async () => {
      mockUsers.findByEmail.mockResolvedValue({ id: '1', email: 'j@j.com' });

      await expect(
        service.register({ name: 'João', email: 'j@j.com', password: 'Abc@1234', role: 'VENDEDOR' as any }),
      ).rejects.toThrow(ConflictException);
    });

    it('salva senha como hash bcrypt', async () => {
      mockUsers.findByEmail.mockResolvedValue(null);
      mockUsers.create.mockImplementation(async (data: any) => ({ ...data, id: '3' }));

      await service.register({ name: 'Ana', email: 'ana@ana.com', password: 'Senha@123', role: 'VENDEDOR' as any });

      const savedHash = mockUsers.create.mock.calls[0][0].password;
      const matches = await bcrypt.compare('Senha@123', savedHash);
      expect(matches).toBe(true);
    });
  });
});
