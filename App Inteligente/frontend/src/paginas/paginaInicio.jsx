import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Container, useTheme } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';

export const PaginaInicio = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { usuario } = useAutenticacion();

  const caracteristicas = [
    {
      titulo: '100% Local y Típico',
      descripcion: 'Sugerencias de alimentos típicos ecuatorianos (mote, chocho, yuca, verde, quinua) adaptados a tu provincia.',
      icono: <MapIcon color="primary" sx={{ fontSize: 40 }} />
    },
    {
      titulo: 'Nutrición por IA',
      descripcion: 'La API de Google Gemini procesa tus datos corporales para armar un plan balanceado en segundos.',
      icono: <RestaurantMenuIcon color="primary" sx={{ fontSize: 40 }} />
    },
    {
      titulo: 'Ajustado a tu Bolsillo',
      descripcion: 'Calculamos el costo aproximado del menú diario para que no gastes más de tu presupuesto establecido.',
      icono: <AttachMoneyIcon color="primary" sx={{ fontSize: 40 }} />
    },
    {
      titulo: 'Listas e Ingredientes',
      descripcion: 'Genera de forma automática tu lista de compras semanal y accede a recetas ecuatorianas paso a paso.',
      icono: <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* SECCIÓN HERO */}
      <Grid container spacing={4} alignItems="center" sx={{ mb: { xs: 6, md: 10 } }}>
        <Grid item xs={12} md={7}>
          <Box sx={{ pr: { md: 4 } }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 800, letterSpacing: '0.1em', mb: 1, display: 'block' }}
            >
              NUTRICIÓN REAL, REGIONAL Y ACCESIBLE
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              FitMenu Local
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400, mb: 4, lineHeight: 1.5 }}>
              ¿Cansado de dietas con salmón, blueberries o kale importado? Genera planes de alimentación saludables basados únicamente en alimentos ecuatorianos de temporada, económicos y fáciles de conseguir en tu provincia.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {usuario ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(usuario.rol === 'Administrador' ? '/dashboard' : '/generar-dieta')}
                  sx={{ py: 1.5, px: 3, borderRadius: 2 }}
                >
                  Ir a mi Panel de Control
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/registro')}
                    sx={{ py: 1.5, px: 3, borderRadius: 2 }}
                  >
                    Registrarme Gratis
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ py: 1.5, px: 3, borderRadius: 2 }}
                  >
                    Iniciar Sesión
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
            alt="Plato de comida saludable local"
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 8,
              boxShadow: '0px 20px 40px rgba(0,0,0,0.15)',
              border: '4px solid',
              borderColor: 'primary.light'
            }}
          />
        </Grid>
      </Grid>

      {/* SECCIÓN CARACTERÍSTICAS */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          ¿Por qué elegir FitMenu Local?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 6 }}>
          Resolvemos la brecha alimenticia recomendando ingredientes que encuentras en los mercados de tu parroquia y cantón en el Ecuador.
        </Typography>

        <Grid container spacing={3}>
          {caracteristicas.map((c, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ p: 1.5, borderRadius: '50%', backgroundColor: 'background.default', mb: 2 }}>
                    {c.icono}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {c.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.descripcion}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PaginaInicio;
