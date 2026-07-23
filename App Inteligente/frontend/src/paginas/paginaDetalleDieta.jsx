import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Tabs, Tab,
  Checkbox, FormControlLabel, CircularProgress, Alert, Paper, IconButton,
  Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import servicioDietas from '../servicios/servicioDietas.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export const PaginaDetalleDieta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dieta, setDieta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [subTab, setSubTab] = useState(0);

  // Estados de carga de acciones
  const [cargandoPdf, setCargandoPdf] = useState(false);
  const [cargandoExcel, setCargandoExcel] = useState(false);

  useEffect(() => {
    const cargarDieta = async () => {
      setCargando(true);
      setError('');
      try {
        const datos = await servicioDietas.obtenerDetalleDieta(id);
        setDieta(datos);
      } catch (err) {
        setError(err.message || 'Error al cargar los detalles del menú alimenticio.');
      } finally {
        setCargando(false);
      }
    };
    cargarDieta();
  }, [id]);

  const manejarCambioTab = (event, nuevoValor) => {
    setSubTab(nuevoValor);
  };

  const manejarAlternarFavorita = async () => {
    try {
      const nuevoEstado = !dieta.EsFavorita;
      await servicioDietas.marcarDietaFavorita(dieta.DietaId, nuevoEstado);
      setDieta({ ...dieta, EsFavorita: nuevoEstado });
    } catch (err) {
      setError('No se pudo actualizar el estado de favorita.');
    }
  };

  const manejarDuplicar = async () => {
    try {
      const nuevaDieta = await servicioDietas.duplicarDieta(dieta.DietaId);
      navigate(`/dieta/${nuevaDieta.DietaId}`);
    } catch (err) {
      setError('Error al duplicar el menú.');
    }
  };

  const manejarEliminar = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar este plan alimenticio de su historial?')) {
      return;
    }
    try {
      await servicioDietas.eliminarDieta(dieta.DietaId);
      navigate('/historial');
    } catch (err) {
      setError('No se pudo eliminar el plan del historial.');
    }
  };

  const manejarCambioListaCompra = async (listaId, index) => {
    try {
      const item = dieta.listaCompras[index];
      const nuevoEstado = !item.Comprado;
      await servicioDietas.marcarProductoComprado(listaId, nuevoEstado);
      
      const listaNueva = [...dieta.listaCompras];
      listaNueva[index].Comprado = nuevoEstado;
      setDieta({ ...dieta, listaCompras: listaNueva });
    } catch (err) {
      console.error('Error al actualizar item de compras:', err);
    }
  };

  const manejarDescargarPdf = async () => {
    setCargandoPdf(true);
    try {
      await servicioDietas.descargarPdf(dieta.DietaId);
    } catch (err) {
      setError('Fallo al descargar el archivo PDF.');
    } finally {
      setCargandoPdf(false);
    }
  };

  const manejarDescargarExcel = async () => {
    setCargandoExcel(true);
    try {
      await servicioDietas.descargarExcel(dieta.DietaId);
    } catch (err) {
      setError('Fallo al descargar el archivo Excel.');
    } finally {
      setCargandoExcel(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !dieta) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/historial')} sx={{ mt: 2 }}>
          Volver al Historial
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* BOTÓN VOLVER Y ACCIONES */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/historial')}>
          Volver
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={manejarAlternarFavorita} color="primary" title="Marcar como favorita">
            {dieta.EsFavorita ? <StarIcon color="warning" /> : <StarBorderIcon />}
          </IconButton>
          <IconButton onClick={manejarDuplicar} color="primary" title="Duplicar esta dieta">
            <FileCopyIcon />
          </IconButton>
          <IconButton onClick={manejarEliminar} color="error" title="Eliminar del historial">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* HEADER DE LA DIETA */}
      <Card sx={{ mb: 4, background: (theme) => theme.palette.mode === 'light' ? '#F8FAFC' : '#1E293B' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                PLAN GENERADO POR INTELIGENCIA ARTIFICIAL
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Dieta: {dieta.Objetivo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fecha de creación: {new Date(dieta.FechaCreacion).toLocaleDateString('es-EC')} | Costo diario estimado: **${parseFloat(dieta.PresupuestoEstimado).toFixed(2)} USD**
              </Typography>
            </Grid>

            {/* BOTONES EXPORTACIÓN */}
            <Grid item xs={12} md={5} sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={manejarDescargarPdf}
                disabled={cargandoPdf}
              >
                {cargandoPdf ? <CircularProgress size={20} color="inherit" /> : 'Descargar PDF'}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<GridOnIcon />}
                onClick={manejarDescargarExcel}
                disabled={cargandoExcel}
              >
                {cargandoExcel ? <CircularProgress size={20} /> : 'Descargar Excel'}
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* MACRONUTRIENTES */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Calorías Totales</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{dieta.CaloriasTotales} kcal</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Proteínas</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{dieta.ProteinasTotales} g</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Grasas</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>{dieta.GrasasTotales} g</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Carbohidratos</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{dieta.CarbohidratosTotales} g</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABS DE INFORMACIÓN DETALLADA */}
      <Card>
        <Tabs
          value={subTab}
          onChange={manejarCambioTab}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<RestaurantIcon />} label="Menú Diario" iconPosition="start" />
          <Tab icon={<MenuBookIcon />} label="Recetas" iconPosition="start" />
          <Tab icon={<ShoppingCartIcon />} label="Lista de Compras" iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* TAB COMIDAS */}
          {subTab === 0 && (
            <Box>
              {dieta.detalles.map((comida) => (
                <Accordion key={comida.DetalleId} defaultExpanded={comida.TipoComida === 'Desayuno' || comida.TipoComida === 'Almuerzo'}>
                  <AccordionSummary expandMoreIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 800, color: 'primary.main', flexGrow: 1 }}>
                      {comida.TipoComida}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {comida.Calorias} kcal
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {comida.AlimentoSugerido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Porción recomendada: **{comida.Cantidad}**
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Proteínas</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{comida.Proteinas}g</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Grasas</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{comida.Grasas}g</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary" display="block">Carbohidratos</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{comida.Carbohidratos}g</Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {dieta.ExplicacionNutricional && (
                <Paper variant="outlined" sx={{ p: 3, mt: 4, backgroundColor: 'background.default' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
                    Explicación y Justificación de la IA:
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                    {dieta.ExplicacionNutricional}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* TAB RECETAS */}
          {subTab === 1 && (
            <Grid container spacing={3}>
              {dieta.recetas.map((receta) => (
                <Grid item xs={12} md={6} key={receta.RecetaId}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800, mb: 1 }}>
                        {receta.Nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Tiempo de preparación: **{receta.TiempoEstimadoMinutos} minutos**
                      </Typography>
                      
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Ingredientes:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2, color: 'text.secondary' }}>
                        {receta.Ingredientes}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Preparación paso a paso:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
                        {receta.Preparacion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* TAB LISTA COMPRAS */}
          {subTab === 2 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Lista de Compras Semanal / Diario
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tacha los ingredientes que ya tengas en casa. Los precios indicados son aproximados para los mercados locales.
              </Typography>

              <Grid container spacing={2}>
                {dieta.listaCompras.map((item, index) => (
                  <Grid item xs={12} sm={6} key={item.ListaId}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: item.Comprado ? 'line-through' : 'none',
                        opacity: item.Comprado ? 0.6 : 1,
                        backgroundColor: item.Comprado ? 'background.default' : 'background.paper',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.Comprado}
                            onChange={() => manejarCambioListaCompra(item.ListaId, index)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {item.Ingrediente}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cantidad: {item.Cantidad}
                            </Typography>
                          </Box>
                        }
                      />
                      <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>
                        ${parseFloat(item.CostoAproximado).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaginaDetalleDieta;
