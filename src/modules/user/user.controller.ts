import { Request, Response } from 'express';
import formidable from 'formidable';
import { handleError } from '../../shared/middleware/handleError'; // Ruta corregida
import * as userService from './user.service'; // Importar servicio

export const listUsers = async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const users = await userService.getAllUsers(includeInactive);
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

export const updateUserWithImage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB máximo
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        // Solo permitir imágenes
        return mimetype?.startsWith('image/') || false;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          message: 'Error al procesar el formulario',
          error: err.message
        });
      }

      try {
        // Extraer campos del formulario
        const nombre = Array.isArray(fields.nombre) ? fields.nombre[0] : fields.nombre;
        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const telefono = Array.isArray(fields.telefono) ? fields.telefono[0] : fields.telefono;
        const departamento = Array.isArray(fields.departamento) ? fields.departamento[0] : fields.departamento;
        const ubicacion = Array.isArray(fields.ubicacion) ? fields.ubicacion[0] : fields.ubicacion;
        const role = Array.isArray(fields.role) ? fields.role[0] : fields.role;
        const estado = Array.isArray(fields.estado) ? fields.estado[0] : fields.estado;
        const permisos = Array.isArray(fields.permisos) ? fields.permisos[0] : fields.permisos;

        // Validar email si se proporciona
        if (email && !email.includes('@')) {
          return res.status(400).json({ message: 'El email debe ser válido' });
        }

        const updateData: any = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (departamento !== undefined) updateData.departamento = departamento;
        if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
        if (role !== undefined) updateData.role = role;
        if (estado !== undefined) updateData.estado = estado === 'true';
        if (permisos !== undefined) {
          try {
            updateData.permisos = JSON.parse(permisos);
          } catch {
            updateData.permisos = permisos.split(',').map((p: string) => p.trim());
          }
        }

        // Obtener archivo de imagen si existe
        const imageFile = Array.isArray(files.foto) ? files.foto[0] : files.foto;

        const updatedUser = await userService.updateUserWithImage(id, updateData, imageFile);

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
    });

  } catch (error) {
    handleError({ res, error, msg: 'Error al procesar la actualización del usuario' });
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

// ✅ NUEVO: Controladores para soft delete
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const deactivatedUser = await userService.deactivateUser(id);
    res.status(200).json({
      message: 'Usuario desactivado exitosamente',
      user: deactivatedUser
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al desactivar usuario' });
  }
};

export const activateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const activatedUser = await userService.activateUser(id);
    res.status(200).json({
      message: 'Usuario activado exitosamente',
      user: activatedUser
    });
  } catch (error) {
    handleError({ res, error, msg: 'Error al activar usuario' });
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

export const adminChangeUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.userId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'La nueva contraseña es requerida' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const success = await userService.adminChangePassword(id, newPassword);
    res.status(200).json({
      success,
      message: 'Contraseña cambiada correctamente por el administrador'
    });
  } catch (error: any) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    handleError({ res, error, msg: 'Error al cambiar contraseña' });
  }
};
