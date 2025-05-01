import { Router } from "express";
import { uploadGenericFile } from "./file.controller";

const router = Router();

// Rutas para Contactos
router.post('/', uploadGenericFile);

export default router;
