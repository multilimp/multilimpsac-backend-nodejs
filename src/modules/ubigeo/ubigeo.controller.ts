import { Request, Response } from 'express';
import { departamentos, distritos, provincias } from './ubigeo.data';
import { handleError } from '../../shared/middleware/handleError';

export const getRegions = async (req: Request, res: Response) => {
  try {
    res.status(200).json(departamentos);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar las regiones' });
  }
};

export const getProvinces = (req: Request, res: Response) => {
  try {
    const regionId = req.query.region;

    let data: typeof provincias = [];
    if (regionId) {
      data = provincias.filter((item) => item.department_id === regionId);
    } else {
      data = provincias;
    }

    res.status(200).json(data);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar las provincias' });
  }
};

export const getDistricts = (req: Request, res: Response) => {
  try {
    const provinceId = req.query.province;

    let data: typeof distritos = [];
    if (provinceId) {
      data = distritos.filter((item) => item.province_id === provinceId);
    } else {
      data = distritos;
    }

    res.status(200).json(data);
  } catch (error) {
    handleError({ res, error, msg: 'Error al listar los distritos' });
  }
};
