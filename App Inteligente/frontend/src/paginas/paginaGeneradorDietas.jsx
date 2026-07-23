import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Paper, Alert, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import servicioDietas from '../servicios/servicioDietas.js';
import CargadorAnimado from '../componentes/cargadorAnimado.jsx';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

export const PaginaGeneradorDietas = () => {
  const { usuario } = useAutenticacion();
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const perfil = usuario?.perfilNutricional;
  const restricciones = usuario?.restricciones || [];

  const manejarGeneracion = async () => {
    setError('');
    setGenerando(true);
    try {
      const planGenerado = await servicioDietas.generarDietaInteligente();
      // Redirigir al detalle del plan alimenticio generado
      navigate(`/dieta/${planGenerado.DietaId}`);
    } catch (err) {
      const mensajeError = err.response?.data?.mensaje || err.message || 'Ocurrió un error al procesar tu solicitud con la IA.';
      setError(mensajeError);
      setGenerando(false);
    }
  };

  if (generando) {
    return (
      <Card sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 2 }}>
        <CargadorAnimado mensaje="Nuestra Inteligencia Artificial está estructurando tu dieta local ecuatoriana..." />
      </Card>
    );
  }

  // Si no tiene perfil nutricional completo
  if (!perfil) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
        <Card sx={{ borderLeft: '5px solid', borderColor: 'secondary.main' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <AssignmentLateIcon color="secondary" sx={{ fontSize: 50, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Perfil Nutricional Incompleto
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Para poder sugerir alimentos de temporada y calcular calorías ideales usando Inteligencia Artificial, primero necesitamos conocer tus datos físicos, ubicación en Ecuador y objetivo de salud.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/perfil')}
              sx={{ borderRadius: 2 }}
            >
              Completar Perfil Nutricional
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto', py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Planificador Alimenticio Inteligente
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Genera un menú diario equilibrado adaptado a tu geografía, presupuesto y salud.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* RESUMEN DE PERFIL */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Resumen de tu Perfil Nutricional
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Ubicación Local:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {perfil.Provincia}, {perfil.Canton}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Objetivo de Salud:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {perfil.ObjetivoNombre}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Presupuesto Diario:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ${parseFloat(perfil.PresupuestoDiario).toFixed(2)} USD
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    IMC Corporal:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {perfil.IMC} kg/m²
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Restricciones y Alergias médicas:
                </Typography>
                {restricciones.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {restricciones.map(r => (
                      <Paper
                        key={r.RestriccionId}
                        variant="outlined"
                        sx={{ px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.8rem', backgroundColor: 'background.default', color: 'secondary.main', borderColor: 'secondary.light' }}
                      >
                        {r.Nombre}
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Ninguna restricción declarada. El menú podrá incluir todo tipo de alimentos locales.
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button size="small" onClick={() => navigate('/perfil')}>
                  Modificar datos de perfil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ACCIÓN DE GENERAR */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: (theme) => theme.palette.mode === 'light' ? '#E8F5E9' : '#0B251A',
              borderRadius: 4,
              border: '2px dashed',
              borderColor: 'primary.light'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              ¿Listo para planificar tu menú de hoy?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Nuestra IA buscará los mejores alimentos disponibles de temporada específicos para **{perfil.Provincia}** y diseñará un desayuno, media mañana, almuerzo, merienda y cena balanceados.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={manejarGeneracion}
              startIcon={<AutoAwesomeIcon />}
              sx={{
                px: 5,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                boxShadow: '0 4px 20px rgba(46, 125, 50, 0.25)'
              }}
            >
              Generar Menú Inteligente
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaginaGeneradorDietas;
