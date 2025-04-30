import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as companyService from './company.service';
import formidable, { File } from 'formidable';
import { uploadFileS3 } from '../../shared/services/s3.service'; // Importar el servicio S3
import logger from '../../../config/logger'; // Importar logger

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
  const form = formidable({ keepExtensions: true, maxFileSize: 5 * 1024 * 1024 }); // Limitar a 5MB

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

      // formidable v3 usa 'files.logo' donde 'logo' es el name del input file
      // Asegúrate que el input file en el frontend tenga name="logo"
      const logoFile = files.logo; // Type is File | File[] | undefined

      // 1. Check if the file exists
      if (!logoFile) {
        throw new Error('No se envió ningún archivo con el nombre "logo".');
      }

      // 2. Check if it's an array (multiple files with same name)
      if (Array.isArray(logoFile)) {
        // Handle case where multiple files are uploaded if necessary,
        // otherwise throw an error if only one is expected.
        throw new Error('Se esperaba un solo archivo de logo, pero se recibieron múltiples.');
      }

      // 3. At this point, logoFile is confirmed to be a single File object.
      // Check if the filepath property exists and is valid.
      if (!logoFile) {
        throw new Error('El archivo de logo procesado no tiene una ruta (filepath) válida.');
      }

      // Subir el archivo a S3 en la carpeta 'logos-empresa'
      // Now logoFile is guaranteed to be a File object with a filepath
      const logoUrl = await uploadFileS3(logoFile, 'logos-empresa');

      // Actualizar la empresa con la nueva URL del logo
      const updatedCompany = await companyService.updateCompany(companyId, { logoUrl });

      res.status(200).json(updatedCompany);
    } catch (error) {
      handleError({ res, error, msg: 'Error al subir el logo de la empresa' });
    }
  });
};
