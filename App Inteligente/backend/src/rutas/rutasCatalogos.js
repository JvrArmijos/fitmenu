import { Router } from 'express';
import controladorCatalogos from '../controladores/controladorCatalogos.js';

const router = Router();

router.get('/provincias', controladorCatalogos.listarProvincias);
router.get('/cantones', controladorCatalogos.listarCantones);
router.get('/parroquias', controladorCatalogos.listarParroquias);
router.get('/objetivos', controladorCatalogos.listarObjetivos);
router.get('/restricciones', controladorCatalogos.listarRestricciones);

export default router;
