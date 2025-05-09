import { Request, Response } from 'express';
import { handleError } from '../../shared/middleware/handleError';
import * as catalogService from './catalog.service';

export const listCatalogs = async (req: Request, res: Response) => {
  try {
    // Opcional: Filtrar por empresa si se pasa como query param
    const { companyId } = req.query;
    let catalogs;
    if (companyId) {
      catalogs = await catalogService.getCatalogsByCompanyId(parseInt(companyId as string, 10));
    } else {
      catalogs = await catalogService.getAllCatalogs();
    }
    res.status(200).json(catalogs);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar catálogos' });
  }
};

export const createCatalog = async (req: Request, res: Response) => {
  try {
    // Validación básica (se podría usar Zod)
    const { empresaId, nombre } = req.body;
    if (!empresaId || !nombre) {
      return res.status(400).json({ message: 'Datos inválidos: empresaId y nombre son requeridos.' });
    }

    const newCatalog = await catalogService.createCatalog(req.body);
    res.status(201).json(newCatalog);
  } catch (error) {
    handleError({ res, error, msg: 'Error al crear catálogo' });
  }
};

export const getCatalog = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.catalogId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de catálogo inválido' });
    }
    const catalog = await catalogService.getCatalogById(id);
    if (!catalog) {
      return res.status(404).json({ message: 'Catálogo no encontrado' });
    }
    res.status(200).json(catalog);
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener catálogo' });
  }
};

export const updateCatalog = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.catalogId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de catálogo inválido' });
    }
    // Validación del body podría ir aquí
    const updatedCatalog = await catalogService.updateCatalog(id, req.body);
    res.status(200).json(updatedCatalog);
  } catch (error) {
    handleError({ res, error, msg: 'Error al actualizar catálogo' });
  }
};

export const deleteCatalog = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.catalogId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de catálogo inválido' });
    }
    await catalogService.deleteCatalog(id);
    res.status(204).send();
  } catch (error) {
    handleError({ res, error, msg: 'Error al eliminar catálogo' });
  }
};

export const listCatalogsByCompany = async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.companyId, 10);
    if (isNaN(companyId)) throw new Error('NOT_FOUND');

    const catalogs = await catalogService.getCatalogsByCompanyId(companyId);
    res.status(200).json(catalogs);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar catálogos por empresa' });
  }
};
