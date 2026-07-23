import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, IconButton,
  Alert, CircularProgress, Divider, Paper, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import servicioDietas from '../servicios/servicioDietas.js';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export const PaginaHistorial = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos' o 'favoritas'
  const navigate = useNavigate();

  const cargarHistorial = async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await servicioDietas.obtenerHistorialDietas();
      setHistorial(datos);
    } catch (err) {
      setError('No se pudo recuperar el historial de planes alimenticios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const manejarCambioFiltro = (event, nuevoFiltro) => {
    if (nuevoFiltro !== null) {
      setFiltro(nuevoFiltro);
    }
  };

  const manejarAlternarFavorita = async (dietaId, estadoActual, index) => {
    try {
      const nuevoEstado = !estadoActual;
      await servicioDietas.marcarDietaFavorita(dietaId, nuevoEstado);
      
      const historialNuevo = [...historial];
      historialNuevo[index].EsFavorita = nuevoEstado;
      setHistorial(historialNuevo);
    } catch (err) {
      setError('Error al actualizar el estado de favorita.');
    }
  };

  const manejarDuplicar = async (dietaId) => {
    try {
      const nuevaDieta = await servicioDietas.duplicarDieta(dietaId);
      // Redirigir al detalle del nuevo plan alimenticio duplicado
      navigate(`/dieta/${nuevaDieta.DietaId}`);
    } catch (err) {
      setError('Error al intentar duplicar el plan.');
    }
  };

  const manejarEliminar = async (dietaId, index) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este plan de su historial?')) {
      return;
    }
    try {
      await servicioDietas.eliminarDieta(dietaId);
      setHistorial(historial.filter((_, idx) => idx !== index));
    } catch (err) {
      setError('Error al eliminar la dieta del historial.');
    }
  };

  const dietasFiltradas = historial.filter(d => {
    if (filtro === 'favoritas') return d.EsFavorita;
    return true;
  });

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Historial de Dietas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta y gestiona tus menús inteligentes generados anteriormente.
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={filtro}
          exclusive
          onChange={manejarCambioFiltro}
          aria-label="filtro de historial"
          color="primary"
        >
          <ToggleButton value="todos" aria-label="todos">Todos los Planes</ToggleButton>
          <ToggleButton value="favoritas" aria-label="favoritos">Favoritos</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {dietasFiltradas.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <RestaurantMenuIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {filtro === 'favoritas' ? 'No tienes planes favoritos guardados' : 'No has generado ningún plan alimenticio aún'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {filtro === 'favoritas' 
              ? 'Marca como favorita una dieta desde su detalle para verla aquí de forma rápida.' 
              : 'Completa tu información nutricional y genera tu primer menú típico con Inteligencia Artificial.'}
          </Typography>
          {filtro !== 'favoritas' && (
            <Button variant="contained" onClick={() => navigate('/generar-dieta')}>
              Generar Mi Primera Dieta
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {dietasFiltradas.map((dieta, index) => (
            <Grid item xs={12} md={6} key={dieta.DietaId}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, pr: 2 }} noWrap>
                      {dieta.Objetivo}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => manejarAlternarFavorita(dieta.DietaId, dieta.EsFavorita, index)}
                        color="warning"
                      >
                        {dieta.EsFavorita ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => manejarDuplicar(dieta.DietaId)} title="Duplicar">
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => manejarEliminar(dieta.DietaId, index)} color="error" title="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Creado el {new Date(dieta.FechaCreacion).toLocaleDateString('es-EC')}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Calorías Diarias:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{dieta.CaloriasTotales} kcal</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Presupuesto Diario:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        ${parseFloat(dieta.PresupuestoEstimado).toFixed(2)} USD
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      endIcon={<LaunchIcon />}
                      onClick={() => navigate(`/dieta/${dieta.DietaId}`)}
                      size="small"
                    >
                      Ver Detalle Completo
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PaginaHistorial;
