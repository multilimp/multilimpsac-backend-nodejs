import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as companyService from './company.service';
import formidable, { File } from 'formidable';
import logger from '../../shared/config/logger';
import { uploadFileR2 } from '@/shared/services/s3.service';

export const listCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await companyService.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar empresas' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    // Validación del body podría ir aquí
    const newCompany = await companyService.createCompany(req.body);
    res.status(201).json(newCompany);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear empresa' });
  }
};

export const getCompany = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.companyId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de empresa inválido' });
    }
    const company = await companyService.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }
    res.status(200).json(company);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener empresa' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.companyId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de empresa inválido' });
    }
    // Validación del body podría ir aquí
    const updatedCompany = await companyService.updateCompany(id, req.body);
    res.status(200).json(updatedCompany);
  } catch (error) {
    // Manejar error si la empresa no existe
    handleError({ res, error, msg: 'Error al actualizar empresa' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.companyId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de empresa inválido' });
    }
    await companyService.deleteCompany(id);
    res.status(204).send();
  } catch (error) {
    // Manejar error si la empresa no existe
    handleError({ res, error, msg: 'Error al eliminar empresa' });
  }
};

export const uploadCompanyLogo = async (req: Request, res: Response) => {
  const form = formidable({ keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        logger.error('Error parsing form data:', err);
        throw new Error('Error procesando el archivo subido.');
      }

      const companyId = parseInt(req.params.companyId, 10);
      if (isNaN(companyId)) {
        throw new Error('ID de empresa inválido.');
      }

      const logoFiles = files.logo;
      let logoFile: File | undefined;

      if (!logoFiles) {
        throw new Error('No se envió ningún archivo con el nombre "logo".');
      }

      if (Array.isArray(logoFiles)) {
        if (logoFiles.length === 1) {
          logoFile = logoFiles[0];
        } else if (logoFiles.length === 0) {
          throw new Error('No se envió ningún archivo con el nombre "logo".');
        } else {
          throw new Error('Se esperaba un solo archivo de logo, pero se recibieron múltiples.');
        }
      } else {
        logoFile = logoFiles;
      }

      if (!logoFile) {
         // Esta comprobación es redundante debido a la lógica anterior, pero segura.
         throw new Error('No se pudo determinar el archivo de logo.');
      }


      const logoUrl = await uploadFileR2(logoFile, 'logos-empresa');

      const updatedCompany = await companyService.updateCompany(companyId, { logo: logoUrl }); // Asegúrate que el campo en el servicio sea 'logo' o 'logoUrl' según tu modelo Prisma y servicio

      res.status(200).json(updatedCompany);
    } catch (error) {
      logger.error('Error al subir el logo de la empresa:', error);
      // Asegúrate que el error que pasas a handleError sea una instancia de Error
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      handleError({ res, error: errorInstance, msg: 'Error al subir el logo de la empresa' });
    }
  });
};
