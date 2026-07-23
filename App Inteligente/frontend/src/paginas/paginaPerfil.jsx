import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Alert,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem, FormLabel,
  RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Slider,
  CircularProgress, Divider, Paper
} from '@mui/material';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import SelectorUbicacion from '../componentes/selectorUbicacion.jsx';
import servicioAlimentos from '../servicios/servicioAlimentos.js';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsAccessibilityIcon from '@mui/icons-material/SettingsAccessibility';

export const PaginaPerfil = () => {
  const { usuario, actualizarPerfilPersonal, guardarPerfilNutricional, cambiarContrasena, eliminarCuenta } = useAutenticacion();
  const [tabActiva, setTabActiva] = useState(0);

  // Mensajes de éxito y error
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Tab 1: Datos Personales
  const [nombre, setNombre] = useState(usuario?.nombreCompleto || '');
  const [correo, setCorreo] = useState(usuario?.email || '');
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveNuevaConf, setClaveNuevaConf] = useState('');

  // Tab 2: Perfil Nutricional
  const [edad, setEdad] = useState(usuario?.perfilNutricional?.Edad || 25);
  const [sexo, setSexo] = useState(usuario?.perfilNutricional?.Sexo || 'M');
  const [peso, setPeso] = useState(usuario?.perfilNutricional?.PesoKg || 70);
  const [altura, setAltura] = useState(usuario?.perfilNutricional?.AlturaCm || 170);
  const [actividad, setActividad] = useState(usuario?.perfilNutricional?.NivelActividad || 'Sedentario');
  const [objetivoId, setObjetivoId] = useState(usuario?.perfilNutricional?.ObjetivoNutricionalId || '');
  const [presupuesto, setPresupuesto] = useState(usuario?.perfilNutricional?.PresupuestoDiario || 5.0);

  // Cascading Location state
  const [provinciaId, setProvinciaId] = useState(usuario?.perfilNutricional?.ProvinciaId || '');
  const [cantonId, setCantonId] = useState(usuario?.perfilNutricional?.CantonId || '');
  const [parroquiaId, setParroquiaId] = useState(usuario?.perfilNutricional?.ParroquiaId || '');

  // Catalogs
  const [objetivos, setObjetivos] = useState([]);
  const [restriccionesCatalogo, setRestriccionesCatalogo] = useState([]);
  const [restriccionesSeleccionadas, setRestriccionesSeleccionadas] = useState([]);

  // Cargar catálogos
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const objs = await servicioAlimentos.obtenerObjetivos();
        setObjetivos(objs);

        const rests = await servicioAlimentos.obtenerRestricciones();
        setRestriccionesCatalogo(rests);
      } catch (err) {
        console.error('Error al cargar catálogos del perfil:', err);
      }
    };
    cargarCatalogos();
  }, []);

  // Sincronizar estado del formulario cuando cambia el usuario (por ejemplo, después de cargar sesión del backend)
  useEffect(() => {
    if (usuario) {
      if (usuario.nombreCompleto) setNombre(usuario.nombreCompleto);
      if (usuario.email) setCorreo(usuario.email);
      if (usuario.perfilNutricional) {
        setEdad(usuario.perfilNutricional.Edad || 25);
        setSexo(usuario.perfilNutricional.Sexo || 'M');
        setPeso(usuario.perfilNutricional.PesoKg || 70);
        setAltura(usuario.perfilNutricional.AlturaCm || 170);
        setActividad(usuario.perfilNutricional.NivelActividad || 'Sedentario');
        setObjetivoId(usuario.perfilNutricional.ObjetivoNutricionalId || '');
        setPresupuesto(usuario.perfilNutricional.PresupuestoDiario || 5.0);
        setProvinciaId(usuario.perfilNutricional.ProvinciaId || '');
        setCantonId(usuario.perfilNutricional.CantonId || '');
        setParroquiaId(usuario.perfilNutricional.ParroquiaId || '');
      }
      if (usuario.restricciones) {
        setRestriccionesSeleccionadas(usuario.restricciones.map(r => r.RestriccionId));
      }
    }
  }, [usuario]);

  const cambiarTab = (event, nuevoValor) => {
    setTabActiva(nuevoValor);
    setMensajeExito('');
    setMensajeError('');
  };

  // Guardar datos personales
  const manejarGuardarPersonales = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');
    setCargando(true);

    try {
      await actualizarPerfilPersonal(nombre, correo);
      setMensajeExito('Datos personales actualizados correctamente.');
    } catch (err) {
      setMensajeError(err);
    } finally {
      setCargando(false);
    }
  };

  // Cambiar contraseña
  const manejarCambiarClave = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');

    if (!claveActual || !claveNueva) {
      setMensajeError('Por favor complete todos los campos de contraseña.');
      return;
    }

    if (claveNueva !== claveNuevaConf) {
      setMensajeError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await cambiarContrasena(claveActual, claveNueva);
      setMensajeExito('Contraseña cambiada con éxito.');
      setClaveActual('');
      setClaveNueva('');
      setClaveNuevaConf('');
    } catch (err) {
      setMensajeError(err);
    } finally {
      setCargando(false);
    }
  };

  // Guardar perfil nutricional
  const manejarGuardarNutricional = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setMensajeError('');

    if (!objetivoId) {
      setMensajeError('Debe seleccionar su objetivo nutricional.');
      return;
    }

    if (!parroquiaId) {
      setMensajeError('Debe especificar su ubicación geográfica completa (Provincia, Cantón y Parroquia).');
      return;
    }

    setCargando(true);
    try {
      const payload = {
        edad: parseInt(edad, 10),
        sexo,
        pesoKg: parseFloat(peso),
        alturaCm: parseFloat(altura),
        nivelActividad: actividad,
        objetivoNutricionalId: parseInt(objetivoId, 10),
        presupuestoDiario: parseFloat(presupuesto),
        parroquiaId: parseInt(parroquiaId, 10),
        restriccionesIds: restriccionesSeleccionadas
      };

      await guardarPerfilNutricional(payload);
      setMensajeExito('Perfil nutricional y restricciones actualizados con éxito.');
    } catch (err) {
      setMensajeError(err);
    } finally {
      setCargando(false);
    }
  };

  const manejarCambioRestriccion = (id) => {
    if (restriccionesSeleccionadas.includes(id)) {
      setRestriccionesSeleccionadas(restriccionesSeleccionadas.filter(rId => rId !== id));
    } else {
      setRestriccionesSeleccionadas([...restriccionesSeleccionadas, id]);
    }
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Ajustes del Perfil
      </Typography>

      {mensajeExito && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {mensajeExito}
        </Alert>
      )}

      {mensajeError && (
        <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
          {mensajeError}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <Tabs
          value={tabActiva}
          onChange={cambiarTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<PersonOutlineIcon />} label="Cuenta y Seguridad" iconPosition="start" />
          <Tab icon={<SettingsAccessibilityIcon />} label="Perfil Nutricional" iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {/* TAB 1: DATOS PERSONALES Y CLAVE */}
          {tabActiva === 0 && (
            <Grid container spacing={4}>
              {/* Información Personal */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Información Personal
                </Typography>
                <Box component="form" onSubmit={manejarGuardarPersonales}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    margin="normal"
                    required
                    disabled={cargando}
                  />
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    margin="normal"
                    required
                    disabled={cargando}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={cargando}
                    sx={{ mt: 2 }}
                  >
                    {cargando ? <CircularProgress size={24} color="inherit" /> : 'Actualizar Datos'}
                  </Button>
                </Box>
              </Grid>

              {/* Cambiar Contraseña */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockOpenIcon color="primary" /> Seguridad
                </Typography>
                <Box component="form" onSubmit={manejarCambiarClave}>
                  <TextField
                    fullWidth
                    label="Contraseña Actual"
                    type="password"
                    value={claveActual}
                    onChange={(e) => setClaveActual(e.target.value)}
                    margin="normal"
                    required
                    disabled={cargando}
                  />
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    type="password"
                    value={claveNueva}
                    onChange={(e) => setClaveNueva(e.target.value)}
                    margin="normal"
                    required
                    disabled={cargando}
                  />
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    value={claveNuevaConf}
                    onChange={(e) => setClaveNuevaConf(e.target.value)}
                    margin="normal"
                    required
                    disabled={cargando}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    color="primary"
                    disabled={cargando}
                    sx={{ mt: 2 }}
                  >
                    {cargando ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* TAB 2: PERFIL NUTRICIONAL */}
          {tabActiva === 1 && (
            <Box component="form" onSubmit={manejarGuardarNutricional}>
              {/* UBICACIÓN GEOGRÁFICA */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                1. Ubicación (Para recomendar ingredientes locales en Ecuador)
              </Typography>
              <SelectorUbicacion
                provinciaId={provinciaId}
                cantonId={cantonId}
                parroquiaId={parroquiaId}
                alCambiarProvincia={(id) => { setProvinciaId(id); setCantonId(''); setParroquiaId(''); }}
                alCambiarCanton={(id) => { setCantonId(id); setParroquiaId(''); }}
                alCambiarParroquia={(id) => setParroquiaId(id)}
              />
              
              <Divider sx={{ my: 4 }} />

              {/* DATOS FÍSICOS */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                2. Información Corporal
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Edad (años)"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    required
                    inputProps={{ min: 0, max: 120 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="sexo-label">Sexo</InputLabel>
                    <Select
                      labelId="sexo-label"
                      value={sexo}
                      label="Sexo"
                      onChange={(e) => setSexo(e.target.value)}
                    >
                      <MenuItem value="M">Masculino</MenuItem>
                      <MenuItem value="F">Femenino</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="actividad-label">Nivel de Actividad</InputLabel>
                    <Select
                      labelId="actividad-label"
                      value={actividad}
                      label="Nivel de Actividad"
                      onChange={(e) => setActividad(e.target.value)}
                    >
                      <MenuItem value="Sedentario">Sedentario (Poco o ningún ejercicio)</MenuItem>
                      <MenuItem value="Ligero">Ligero (Ejercicio ligero 1-3 días/semana)</MenuItem>
                      <MenuItem value="Moderado">Moderado (Ejercicio moderado 3-5 días/semana)</MenuItem>
                      <MenuItem value="Activo">Activo (Ejercicio fuerte 6-7 días/semana)</MenuItem>
                      <MenuItem value="Muy Activo">Muy Activo (Ejercicio extremo diario)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ px: 2 }}>
                    <Typography id="slider-peso" gutterBottom sx={{ fontWeight: 600 }}>
                      Peso: {peso} kg
                    </Typography>
                    <Slider
                      value={peso}
                      min={30}
                      max={180}
                      step={0.5}
                      onChange={(e, val) => setPeso(val)}
                      valueLabelDisplay="auto"
                      aria-labelledby="slider-peso"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ px: 2 }}>
                    <Typography id="slider-altura" gutterBottom sx={{ fontWeight: 600 }}>
                      Altura: {altura} cm
                    </Typography>
                    <Slider
                      value={altura}
                      min={100}
                      max={220}
                      step={1}
                      onChange={(e, val) => setAltura(val)}
                      valueLabelDisplay="auto"
                      aria-labelledby="slider-altura"
                    />
                  </Box>
                </Grid>
              </Grid>

              {usuario?.perfilNutricional?.IMC && (
                <Paper variant="outlined" sx={{ p: 2, mt: 3, backgroundColor: 'background.default', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tu Índice de Masa Corporal (IMC) actual es:
                  </Typography>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                    {usuario.perfilNutricional.IMC} kg/m²
                  </Typography>
                </Paper>
              )}

              <Divider sx={{ my: 4 }} />

              {/* OBJETIVO Y PRESUPUESTO */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                3. Objetivo y Economía
              </Typography>

              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="objetivo-label">Objetivo Nutricional</InputLabel>
                    <Select
                      labelId="objetivo-label"
                      value={objetivoId}
                      label="Objetivo Nutricional"
                      onChange={(e) => setObjetivoId(e.target.value)}
                    >
                      {objetivos.map((o) => (
                        <MenuItem key={o.ObjetivoId} value={o.ObjetivoId}>
                          {o.Nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Presupuesto Diario Máximo ($ USD)"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(e.target.value)}
                    required
                    inputProps={{ step: 0.10, min: 0.50 }}
                    helperText="Monto referencial diario para tus 5 comidas."
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* ALERGIAS Y RESTRICCIONES MÉDICAS */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                4. Restricciones Alimenticias y Salud
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                La Inteligencia Artificial excluirá alimentos perjudiciales para estas condiciones de tu dieta.
              </Typography>

              <FormGroup>
                <Grid container spacing={2}>
                  {restriccionesCatalogo.map((r) => (
                    <Grid item xs={12} sm={6} key={r.RestriccionId}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={restriccionesSeleccionadas.includes(r.RestriccionId)}
                            onChange={() => manejarCambioRestriccion(r.RestriccionId)}
                            color="secondary"
                          />
                        }
                        label={`${r.Nombre} (${r.Tipo})`}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={cargando}
                  sx={{ px: 4 }}
                >
                  {cargando ? <CircularProgress size={24} color="inherit" /> : 'Guardar Perfil Nutricional'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaginaPerfil;
