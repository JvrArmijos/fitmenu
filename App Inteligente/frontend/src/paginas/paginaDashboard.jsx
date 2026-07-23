import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Paper, LinearProgress, Divider, Avatar } from '@mui/material';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import servicioDietas from '../servicios/servicioDietas.js';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AppleIcon from '@mui/icons-material/Apple';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
import DateRangeIcon from '@mui/icons-material/DateRange';

export const PaginaDashboard = () => {
  const { usuario } = useAutenticacion();
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const esAdministrador = usuario?.rol === 'Administrador';

  useEffect(() => {
    const cargarEstadisticas = async () => {
      setCargando(true);
      setError('');
      try {
        const datos = await servicioDietas.obtenerEstadisticasDashboard();
        setEstadisticas(datos);
      } catch (err) {
        setError('Error al recuperar las estadísticas del sistema.');
      } finally {
        setCargando(false);
      }
    };
    cargarEstadisticas();
  }, [usuario]);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // --- RENDERIZADO PANEL ADMINISTRATIVO GLOBAL ---
  if (esAdministrador) {
    const { tarjetas, graficos } = estadisticas;

    // Calcular máximo para porcentajes de progreso en gráficos locales
    const maxUsuariosProvincia = Math.max(...graficos.provincias.map(p => p.CantidadUsuarios), 1);
    const maxDietasObjetivo = Math.max(...graficos.objetivos.map(o => o.Cantidad), 1);

    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Dashboard de Administración
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Métricas globales y distribución geográfica de FitMenu Local.
        </Typography>

        {/* METRICAS PRINCIPALES */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #2E7D32' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Usuarios Registrados</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{tarjetas.usuarios}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #E65100' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', width: 56, height: 56 }}>
                  <RestaurantIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Dietas Generadas</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{tarjetas.dietas}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #0288D1' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56 }}>
                  <AppleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Alimentos Catalogados</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{tarjetas.alimentos}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderLeft: '5px solid #7B1FA2' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'purple', width: 56, height: 56 }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Categorías</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{tarjetas.categorias}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* DISTRIBUCIONES */}
        <Grid container spacing={4}>
          {/* Distribución Provincial */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Usuarios por Provincia (Ecuador)
                </Typography>
                {graficos.provincias.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No hay datos suficientes.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {graficos.provincias.map(prov => (
                      <Box key={prov.Provincia}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{prov.Provincia}</Typography>
                          <Typography variant="body2" color="text.secondary">{prov.CantidadUsuarios} usuarios</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(prov.CantidadUsuarios / maxUsuariosProvincia) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Dietas por Objetivo */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Dieta Generada según Objetivo
                </Typography>
                {graficos.objetivos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No hay datos suficientes.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {graficos.objetivos.map(obj => (
                      <Box key={obj.Objetivo}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{obj.Objetivo}</Typography>
                          <Typography variant="body2" color="text.secondary">{obj.Cantidad} dietas</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(obj.Cantidad / maxDietasObjetivo) * 100}
                          color="secondary"
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // --- RENDERIZADO PANEL DE CLIENTE PERSONAL ---
  const { tarjetas, historialCalorias } = estadisticas;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Mi Progreso Nutricional
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Seguimiento personal de dietas y requerimientos calóricos.
      </Typography>

      {/* METRICAS PRINCIPALES CLIENTE */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderLeft: '5px solid #2E7D32' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                <RestaurantIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">Planes Generados</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{tarjetas.totalDietas}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ borderLeft: '5px solid #E65100' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.light', width: 56, height: 56 }}>
                <StarIcon color="warning" />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">Favoritos Guardados</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{tarjetas.favoritas}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* HISTORIAL CALÓRICO RECIENTE */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Historial Calórico Reciente
          </Typography>
          {historialCalorias.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Aún no has generado ninguna dieta. Dirígete a la sección de Generador para empezar.
            </Typography>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {historialCalorias.map((d, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DateRangeIcon color="primary" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Objetivo: {d.Objetivo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Generado el: {new Date(d.FechaCreacion).toLocaleDateString('es-EC')}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Energía:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{d.CaloriasTotales} kcal</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Presupuesto:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          ${parseFloat(d.PresupuestoEstimado).toFixed(2)} USD
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaginaDashboard;
