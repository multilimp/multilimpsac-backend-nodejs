import { Usuario, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../../database/prisma';

// Tipos para los datos de entrada
type CreateUserData = {
  nombre: string;
  email: string;
  password: string;
  role?: Role;
  foto?: string;
  estado?: boolean;
  telefono?: string;
  departamento?: string;
  ubicacion?: string;
  permisos?: string[];
};

type UpdateUserData = Partial<Omit<Usuario, 'id' | 'createdAt' | 'updatedAt' | 'password'>>;

type UpdateProfileData = {
  nombre?: string;
  email?: string;
  telefono?: string;
  departamento?: string;
  ubicacion?: string;
  foto?: string;
};

export const getAllUsers = async (): Promise<Omit<Usuario, 'password'>[]> => {
  const users = await prisma.usuario.findMany();
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

export const getUserById = async (id: number): Promise<Omit<Usuario, 'password'> | null> => {
  const user = await prisma.usuario.findUnique({
    where: { id },
  });
  
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const createUser = async (data: CreateUserData): Promise<Omit<Usuario, 'password'>> => {
  // Validaciones
  if (!data.nombre || data.nombre.trim().length === 0) {
    throw new Error('El nombre es obligatorio');
  }
  
  if (!data.email || !data.email.includes('@')) {
    throw new Error('El email es obligatorio y debe ser válido');
  }
  
  if (!data.password || data.password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Verificar si el email ya existe
  const existingUser = await prisma.usuario.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Ya existe un usuario con este email');
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Permisos por defecto según el rol
  const defaultPermissions = data.role === Role.ADMIN 
    ? ['dashboard', 'profile', 'users', 'providers', 'sales', 'treasury', 'companies', 'transports', 'provider_orders', 'billing', 'clients', 'quotes', 'tracking', 'collections']
    : ['dashboard', 'profile'];

  const newUser = await prisma.usuario.create({
    data: {
      ...data,
      password: hashedPassword,
      permisos: data.permisos || defaultPermissions,
      role: data.role || Role.USER,
      estado: data.estado !== undefined ? data.estado : true
    }
  });

  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateUser = async (id: number, data: UpdateUserData): Promise<Usuario> => {
  return prisma.usuario.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: number): Promise<Usuario> => {
  return prisma.usuario.delete({
    where: { id },
  });
};

export const updateProfile = async (id: number, data: UpdateProfileData): Promise<Usuario> => {
  return prisma.usuario.update({
    where: { id },
    data,
  });
};

export const changePassword = async (id: number, currentPassword: string, newPassword: string): Promise<boolean> => {
  // Obtener el usuario actual
  const user = await prisma.usuario.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar la contraseña actual
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Hash de la nueva contraseña
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña
  await prisma.usuario.update({
    where: { id },
    data: { password: hashedNewPassword },
  });

  return true;
};
