import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import { deleteOldProfilePhoto, getPhotoUrl } from './upload.service';
import * as userService from '../user/user.service';

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    // Obtener usuario actual para eliminar foto anterior
    const currentUser = await userService.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar URL de la nueva foto
    const photoUrl = getPhotoUrl(req.file.filename);

    // Actualizar usuario con nueva foto
    const updatedUser = await userService.updateUser(userId, {
      foto: photoUrl
    });

    // Eliminar foto anterior si existe
    if (currentUser.foto) {
      const oldPhotoPath = `uploads/profiles/${currentUser.foto.split('/').pop()}`;
      deleteOldProfilePhoto(oldPhotoPath);
    }

    res.status(200).json({
      message: 'Foto de perfil actualizada correctamente',
      photoUrl,
      user: updatedUser
    });

  } catch (error) {
    // Si hay error, eliminar el archivo subido
    if (req.file) {
      deleteOldProfilePhoto(req.file.path);
    }
    handleError({ res, error, msg: 'Error al subir foto de perfil' });
  }
};
