import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError'; // Ruta corregida
import * as userService from './user.service'; // Importar servicio

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar usuarios' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, role, telefono, departamento, ubicacion, permisos } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y contraseña son obligatorios' 
      });
    }

    const newUser = await userService.createUser({
      nombre,
      email,
      password,
      role,
      telefono,
      departamento,
      ubicacion,
      permisos
    });
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: newUser
    });
  } catch (error: any) {
    // Manejar errores específicos
    if (error.message === 'Ya existe un usuario con este email') {
      return res.status(409).json({ message: error.message });
    }
    if (error.message.includes('obligatorio') || error.message.includes('contraseña')) {
      return res.status(400).json({ message: error.message });
    }
    handleError({ res, error, msg: 'Error al crear usuario' });
  }
};


export const getUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener usuario' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    // Extraer campos válidos del body
    const { nombre, email, role, telefono, departamento, ubicacion, permisos, estado } = req.body;
    
    // Validar email si se proporciona
    if (email && !email.includes('@')) {
      return res.status(400).json({ message: 'El email debe ser válido' });
    }

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (departamento !== undefined) updateData.departamento = departamento;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
    if (permisos !== undefined) updateData.permisos = permisos;
    if (estado !== undefined) updateData.estado = estado;

    const updatedUser = await userService.updateUser(id, updateData);
    
    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'Ya existe un usuario con este email' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    handleError({ res, error, msg: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    await userService.deleteUser(id);
    // Devolver 204 No Content es común para DELETE exitoso
    res.status(204).send();
  } catch (error) {
    // Manejar error si el usuario no existe
    handleError({ res, error, msg: 'Error al eliminar usuario' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const { nombre, email, telefono, departamento, ubicacion } = req.body;
    
    const updatedUser = await userService.updateProfile(id, {
      nombre,
      email,
      telefono,
      departamento,
      ubicacion,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar perfil' });
  }
};

export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Se requiere contraseña actual y nueva contraseña' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const success = await userService.changePassword(id, currentPassword, newPassword);
    res.status(200).json({ success, message: 'Contraseña cambiada correctamente' });
  } catch (error: any) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (error.message === 'Contraseña actual incorrecta') {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    handleError({ res, error, msg: 'Error al cambiar contraseña' });
  }
};
