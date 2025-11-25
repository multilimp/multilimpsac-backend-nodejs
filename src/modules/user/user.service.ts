import { Usuario, Role } from '../../../prisma/generated/client';
import bcrypt from 'bcryptjs';
import { File } from 'formidable';
import prisma from '../../database/prisma';
import { uploadFileR2 } from '../../shared/services/s3.service';

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

export const getAllUsers = async (includeInactive = false): Promise<Omit<Usuario, 'password'>[]> => {
  const users = await prisma.usuario.findMany({
    where: includeInactive ? {} : { estado: true }
  });
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

export const updateUserWithImage = async (
  id: number,
  data: UpdateUserData,
  imageFile?: File
): Promise<Omit<Usuario, 'password'>> => {
  let imageUrl = data.foto;

  // Si se proporciona una nueva imagen, subirla a R2
  if (imageFile) {
    try {
      imageUrl = await uploadFileR2(imageFile, 'profiles');
    } catch (error) {
      throw new Error('Error al subir la imagen: ' + (error as Error).message);
    }
  }

  const updatedUser = await prisma.usuario.update({
    where: { id },
    data: {
      ...data,
      foto: imageUrl,
    },
  });

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export const deleteUser = async (id: number): Promise<Usuario> => {
  // OPCIÓN 1: Eliminación física (con limpieza de dependencias)
  // Verificar si el usuario existe
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: {
      gestionCobranzas: true,
    }
  });

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Para producción, considera usar soft delete en su lugar:
  // return await prisma.usuario.update({
  //   where: { id },
  //   data: { estado: false }
  // });

  // Eliminar en transacción para mantener integridad
  return await prisma.$transaction(async (tx) => {
    // 1. Eliminar gestiones de cobranza relacionadas
    if (usuario.gestionCobranzas.length > 0) {
      await tx.gestionCobranza.deleteMany({
        where: { usuarioId: id }
      });
    }

    // 2. Eliminar el usuario
    return await tx.usuario.delete({
      where: { id },
    });
  });
};

// OPCIÓN 2: Soft Delete (Recomendado para producción)
export const deactivateUser = async (id: number): Promise<Usuario> => {
  const usuario = await prisma.usuario.findUnique({
    where: { id }
  });

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  if (!usuario.estado) {
    throw new Error('El usuario ya está desactivado');
  }

  return await prisma.usuario.update({
    where: { id },
    data: { estado: false }
  });
};

// Reactivar usuario
export const activateUser = async (id: number): Promise<Usuario> => {
  return await prisma.usuario.update({
    where: { id },
    data: { estado: true }
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

export const adminChangePassword = async (id: number, newPassword: string): Promise<boolean> => {
  // Verificar que el usuario existe
  const user = await prisma.usuario.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Hash de la nueva contraseña
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña (admin no necesita contraseña actual)
  await prisma.usuario.update({
    where: { id },
    data: { password: hashedNewPassword },
  });

  return true;
};

export const updateProfilePhoto = async (userId: number, file: string): Promise<Omit<Usuario, 'password'>> => {
  // Actualizar el usuario con la nueva URL de la foto
  const updatedUser = await prisma.usuario.update({
    where: { id: userId },
    data: { foto: file }
  });

  // Retornar usuario sin contraseña
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};
