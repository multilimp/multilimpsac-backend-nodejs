import { Request, Response } from 'express';
import { getOrdenProveedorPrintData, getCargosEntregaData as getCargosEntregaDataService } from './print.service';
import { handleError } from '../../shared/middleware/handleError';

export const getOrdenProveedorPrintDataHandler = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de orden de proveedor inválido.' });
    }

    const data = await getOrdenProveedorPrintData(id);

    res.json({ success: true, data });
  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener datos para imprimir la orden de proveedor.' });
  }
};

export const getCargosEntregaData = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechaInicio y fechaFin como parámetros de consulta'
      });
    }

    const data = await getCargosEntregaDataService(fechaInicio as string, fechaFin as string);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    handleError({ res, error, msg: 'Error al obtener los datos de cargos de entrega' });
  }
};
