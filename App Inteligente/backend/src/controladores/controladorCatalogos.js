import repositorioUbicaciones from '../repositorios/repositorioUbicaciones.js';
import repositorioUsuarios from '../repositorios/repositorioUsuarios.js';

export async function listarProvincias(req, res, next) {
  try {
    const provincias = await repositorioUbicaciones.obtenerProvincias();
    return res.status(200).json({ ok: true, datos: provincias });
  } catch (err) {
    next(err);
  }
}

export async function listarCantones(req, res, next) {
  try {
    const { provinciaId } = req.query;
    const cantones = await repositorioUbicaciones.obtenerCantones(provinciaId);
    return res.status(200).json({ ok: true, datos: cantones });
  } catch (err) {
    next(err);
  }
}

export async function listarParroquias(req, res, next) {
  try {
    const { cantonId } = req.query;
    const parroquias = await repositorioUbicaciones.obtenerParroquias(cantonId);
    return res.status(200).json({ ok: true, datos: parroquias });
  } catch (err) {
    next(err);
  }
}

export async function listarObjetivos(req, res, next) {
  try {
    const objetivos = await repositorioUsuarios.obtenerObjetivosCatalogo();
    return res.status(200).json({ ok: true, datos: objetivos });
  } catch (err) {
    next(err);
  }
}

export async function listarRestricciones(req, res, next) {
  try {
    const restricciones = await repositorioUsuarios.obtenerAlergiasEnfermedadesCatalogo();
    return res.status(200).json({ ok: true, datos: restricciones });
  } catch (err) {
    next(err);
  }
}

export default {
  listarProvincias,
  listarCantones,
  listarParroquias,
  listarObjetivos,
  listarRestricciones
};
