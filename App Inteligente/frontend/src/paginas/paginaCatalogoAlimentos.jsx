import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, Grid, CircularProgress, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import servicioAlimentos from '../servicios/servicioAlimentos.js';

export const PaginaCatalogoAlimentos = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados de los Filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroTemporada, setFiltroTemporada] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('');

  // Combos de Carga
  const [combos, setCombos] = useState({ categorias: [], temporadas: [], provincias: [] });
  const [cantonesForm, setCantonesForm] = useState([]);
  const [parroquiasForm, setParroquiasForm] = useState([]);

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alimentoEditando, setAlimentoEditando] = useState(null); // null si es Crear nuevo
  const [cargandoUbicacionForm, setCargandoUbicacionForm] = useState(false);

  // Campos del Formulario
  const [formNombre, setFormNombre] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formTemporada, setFormTemporada] = useState('');
  const [formProteinas, setFormProteinas] = useState('');
  const [formGrasas, setFormGrasas] = useState('');
  const [formCarbohidratos, setFormCarbohidratos] = useState('');
  const [formCalorias, setFormCalorias] = useState('');
  const [formPrecio, setFormPrecio] = useState('');
  const [formDisponible, setFormDisponible] = useState(true);
  const [formProvincia, setFormProvincia] = useState('');
  const [formCanton, setFormCanton] = useState('');
  const [formParroquia, setFormParroquia] = useState('');

  const cargarAlimentos = async () => {
    setCargando(true);
    setError('');
    try {
      const filtros = {
        nombre: filtroNombre,
        categoriaId: filtroCategoria,
        temporadaId: filtroTemporada,
        provinciaId: filtroProvincia
      };
      const datos = await servicioAlimentos.buscarAlimentos(filtros);
      setAlimentos(datos);
    } catch (err) {
      setError('Error al cargar la lista de alimentos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAlimentos();
  }, [filtroNombre, filtroCategoria, filtroTemporada, filtroProvincia]);

  useEffect(() => {
    const cargarCombos = async () => {
      try {
        const datos = await servicioAlimentos.obtenerCombosAlimentos();
        setCombos(datos);
      } catch (err) {
        console.error('Error al cargar combos:', err);
      }
    };
    cargarCombos();
  }, []);

  // Cargar cantones para el formulario
  useEffect(() => {
    const cargarCantones = async () => {
      if (!formProvincia) {
        setCantonesForm([]);
        setParroquiasForm([]);
        return;
      }
      setCargandoUbicacionForm(true);
      try {
        const datos = await servicioAlimentos.obtenerCantones(formProvincia);
        setCantonesForm(datos);
        setParroquiasForm([]);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoUbicacionForm(false);
      }
    };
    cargarCantones();
  }, [formProvincia]);

  // Cargar parroquias para el formulario
  useEffect(() => {
    const cargarParroquias = async () => {
      if (!formCanton) {
        setParroquiasForm([]);
        return;
      }
      setCargandoUbicacionForm(true);
      try {
        const datos = await servicioAlimentos.obtenerParroquias(formCanton);
        setParroquiasForm(datos);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoUbicacionForm(false);
      }
    };
    cargarParroquias();
  }, [formCanton]);

  const abrirModalCrear = () => {
    setAlimentoEditando(null);
    setFormNombre('');
    setFormCategoria('');
    setFormTemporada('');
    setFormProteinas('');
    setFormGrasas('');
    setFormCarbohidratos('');
    setFormCalorias('');
    setFormPrecio('');
    setFormDisponible(true);
    setFormProvincia('');
    setFormCanton('');
    setFormParroquia('');
    setModalAbierto(true);
  };

  const abrirModalEditar = async (alimento) => {
    setAlimentoEditando(alimento);
    setFormNombre(alimento.Nombre);
    setFormCategoria(alimento.CategoriaId);
    setFormTemporada(alimento.TemporadaId);
    setFormProteinas(alimento.Proteinas);
    setFormGrasas(alimento.Grasas);
    setFormCarbohidratos(alimento.Carbohidratos);
    setFormCalorias(alimento.Calorias);
    setFormPrecio(alimento.PrecioAprox);
    setFormDisponible(alimento.Disponible);

    // Cargar geografía
    setFormProvincia(alimento.ProvinciaId || '');
    if (alimento.ProvinciaId) {
      const cantones = await servicioAlimentos.obtenerCantones(alimento.ProvinciaId);
      setCantonesForm(cantones);
      setFormCanton(alimento.CantonesId || '');

      if (alimento.CantonesId) {
        const parroquias = await servicioAlimentos.obtenerParroquias(alimento.CantonesId);
        setParroquiasForm(parroquias);
        setFormParroquia(alimento.ParroquiaId || '');
      }
    }

    setModalAbierto(true);
  };

  const manejarGuardarAlimento = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    const payload = {
      nombre: formNombre,
      categoriaId: parseInt(formCategoria, 10),
      temporadaId: parseInt(formTemporada, 10),
      proteinas: parseFloat(formProteinas || 0),
      grasas: parseFloat(formGrasas || 0),
      carbohidratos: parseFloat(formCarbohidratos || 0),
      calorias: parseFloat(formCalorias || 0),
      precioAprox: parseFloat(formPrecio),
      disponible: formDisponible,
      provinciaId: formProvincia ? parseInt(formProvincia, 10) : null,
      cantonesId: formCanton ? parseInt(formCanton, 10) : null,
      parroquiaId: formParroquia ? parseInt(formParroquia, 10) : null
    };

    try {
      if (alimentoEditando) {
        await servicioAlimentos.actualizarAlimento(alimentoEditando.AlimentoId, payload);
        setMensajeExito('Alimento actualizado con éxito.');
      } else {
        await servicioAlimentos.crearAlimento(payload);
        setMensajeExito('Alimento agregado con éxito al catálogo.');
      }
      setModalAbierto(false);
      cargarAlimentos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar el alimento.');
    }
  };

  const manejarEliminarAlimento = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este alimento del catálogo de forma permanente?')) {
      return;
    }
    setError('');
    setMensajeExito('');
    try {
      await servicioAlimentos.eliminarAlimento(id);
      setMensajeExito('Alimento eliminado correctamente.');
      cargarAlimentos();
    } catch (err) {
      setError('No se pudo eliminar el alimento. Podría estar asociado a dietas existentes.');
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Catálogo de Alimentos Locales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los ingredientes típicos de Ecuador disponibles para la Inteligencia Artificial.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirModalCrear}>
          Nuevo Alimento
        </Button>
      </Box>

      {mensajeExito && <Alert severity="success" sx={{ mb: 3 }}>{mensajeExito}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* BARRA FILTROS */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Buscar alimento..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="filtro-cat-label">Categoría</InputLabel>
                <Select
                  labelId="filtro-cat-label"
                  value={filtroCategoria}
                  label="Categoría"
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {combos.categorias.map(c => (
                    <MenuItem key={c.CategoriaId} value={c.CategoriaId}>{c.Nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="filtro-temp-label">Temporada</InputLabel>
                <Select
                  labelId="filtro-temp-label"
                  value={filtroTemporada}
                  label="Temporada"
                  onChange={(e) => setFiltroTemporada(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {combos.temporadas.map(t => (
                    <MenuItem key={t.TemporadaId} value={t.TemporadaId}>{t.Nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="filtro-prov-label">Provincia</InputLabel>
                <Select
                  labelId="filtro-prov-label"
                  value={filtroProvincia}
                  label="Provincia"
                  onChange={(e) => setFiltroProvincia(e.target.value)}
                >
                  <MenuItem value="">Ecuador (Nacional)</MenuItem>
                  {combos.provincias.map(p => (
                    <MenuItem key={p.ProvinciaId} value={p.ProvinciaId}>{p.Nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLA ALIMENTOS */}
      {cargando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : alimentos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No se encontraron alimentos en el catálogo con los filtros aplicados.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="tabla de alimentos" size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Temporada</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Calorías (100g)</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Prot (g)</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Gras (g)</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Carb (g)</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Precio Aprox</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Origen</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alimentos.map((alimento) => (
                <TableRow key={alimento.AlimentoId} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{alimento.Nombre}</TableCell>
                  <TableCell>{alimento.Categoria}</TableCell>
                  <TableCell>{alimento.Temporada}</TableCell>
                  <TableCell align="right">{alimento.Calorias} kcal</TableCell>
                  <TableCell align="right">{alimento.Proteinas}g</TableCell>
                  <TableCell align="right">{alimento.Grasas}g</TableCell>
                  <TableCell align="right">{alimento.Carbohidratos}g</TableCell>
                  <TableCell align="right" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                    ${parseFloat(alimento.PrecioAprox).toFixed(2)}
                  </TableCell>
                  <TableCell>{alimento.Provincia || 'Nacional'}</TableCell>
                  <TableCell>{alimento.Disponible ? 'Activo' : 'Inactivo'}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => abrirModalEditar(alimento)} color="primary" size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => manejarEliminarAlimento(alimento.AlimentoId)} color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* DIALOG CREAR / EDITAR */}
      <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {alimentoEditando ? 'Editar Alimento del Catálogo' : 'Agregar Nuevo Alimento Local'}
        </DialogTitle>
        
        <Box component="form" onSubmit={manejarGuardarAlimento}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nombre del alimento"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id="form-cat-label">Categoría</InputLabel>
                  <Select
                    labelId="form-cat-label"
                    value={formCategoria}
                    label="Categoría"
                    onChange={(e) => setFormCategoria(e.target.value)}
                  >
                    {combos.categorias.map(c => (
                      <MenuItem key={c.CategoriaId} value={c.CategoriaId}>{c.Nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id="form-temp-label">Temporada</InputLabel>
                  <Select
                    labelId="form-temp-label"
                    value={formTemporada}
                    label="Temporada"
                    onChange={(e) => setFormTemporada(e.target.value)}
                  >
                    {combos.temporadas.map(t => (
                      <MenuItem key={t.TemporadaId} value={t.TemporadaId}>{t.Nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Proteínas (g)"
                  value={formProteinas}
                  onChange={(e) => setFormProteinas(e.target.value)}
                  inputProps={{ step: 0.1, min: 0 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Grasas (g)"
                  value={formGrasas}
                  onChange={(e) => setFormGrasas(e.target.value)}
                  inputProps={{ step: 0.1, min: 0 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Carb (g)"
                  value={formCarbohidratos}
                  onChange={(e) => setFormCarbohidratos(e.target.value)}
                  inputProps={{ step: 0.1, min: 0 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Calorías (kcal)"
                  value={formCalorias}
                  onChange={(e) => setFormCalorias(e.target.value)}
                  inputProps={{ step: 1, min: 0 }}
                  helperText="Dejar 0 para auto-calcular."
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Precio Referencial ($ USD)"
                  value={formPrecio}
                  onChange={(e) => setFormPrecio(e.target.value)}
                  inputProps={{ step: 0.05, min: 0 }}
                />
              </Grid>

              <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formDisponible}
                      onChange={(e) => setFormDisponible(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Disponible en el catálogo"
                />
              </Grid>

              {/* UBICACIÓN ASOCIADA */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Origen Geográfico (Dejar vacío si es de consumo nacional)
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel id="form-prov-label">Provincia</InputLabel>
                  <Select
                    labelId="form-prov-label"
                    value={formProvincia}
                    label="Provincia"
                    onChange={(e) => { setFormProvincia(e.target.value); setFormCanton(''); setFormParroquia(''); }}
                  >
                    <MenuItem value="">Nacional</MenuItem>
                    {combos.provincias.map(p => (
                      <MenuItem key={p.ProvinciaId} value={p.ProvinciaId}>{p.Nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth disabled={!formProvincia || cargandoUbicacionForm}>
                  <InputLabel id="form-cant-label">Cantón</InputLabel>
                  <Select
                    labelId="form-cant-label"
                    value={formCanton}
                    label="Cantón"
                    onChange={(e) => { setFormCanton(e.target.value); setFormParroquia(''); }}
                  >
                    <MenuItem value="">Todo el Cantón</MenuItem>
                    {cantonesForm.map(c => (
                      <MenuItem key={c.CantonId} value={c.CantonId}>{c.Nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth disabled={!formCanton || cargandoUbicacionForm}>
                  <InputLabel id="form-parr-label">Parroquia</InputLabel>
                  <Select
                    labelId="form-parr-label"
                    value={formParroquia}
                    label="Parroquia"
                    onChange={(e) => setFormParroquia(e.target.value)}
                  >
                    <MenuItem value="">Toda la Parroquia</MenuItem>
                    {parroquiasForm.map(p => (
                      <MenuItem key={p.ParroquiaId} value={p.ParroquiaId}>{p.Nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar Cambios
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PaginaCatalogoAlimentos;
