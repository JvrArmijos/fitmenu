import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Paper, Zoom } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const consejosEcuatorianos = [
  'El chocho es una leguminosa andina con más del 50% de proteína en seco y alto contenido de calcio.',
  'El plátano verde (barraganete) aporta almidón resistente, excelente para la salud de tu microbiota intestinal.',
  'La quinua es considerada un superalimento; posee todos los aminoácidos esenciales que el cuerpo necesita.',
  'El aguacate nacional contiene grasas monoinsaturadas saludables que ayudan a regular el colesterol.',
  'Consumir zanahoria blanca te brinda energía de fácil digestión, ideal para recargar fuerzas.',
  'El tomate de árbol es rico en vitaminas A, C y E, además de poseer propiedades antioxidantes.',
  'La guayaba y la naranjilla son fuentes locales extraordinarias de vitamina C, superiores a la naranja comercial.'
];

export const CargadorAnimado = ({ mensaje = 'Generando tu menú personalizado con Inteligencia Artificial...' }) => {
  const [indiceConsejo, setIndiceConsejo] = useState(0);
  const [mostrar, setMostrar] = useState(true);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setMostrar(false);
      setTimeout(() => {
        setIndiceConsejo((prev) => (prev + 1) % consejosEcuatorianos.length);
        setMostrar(true);
      }, 500); // Duración de transición de salida
    }, 4500); // Cambiar consejo cada 4.5 segundos

    return () => clearInterval(intervalo);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
        <CircularProgress size={80} thickness={4} color="primary" />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RestaurantIcon color="primary" sx={{ fontSize: 32 }} />
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
        {mensaje}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, maxWidth: 500 }}>
        Nuestra IA está analizando tu perfil nutricional y los alimentos locales disponibles en tu zona para crear un plan balanceado.
      </Typography>

      <Zoom in={mostrar} style={{ transitionDelay: mostrar ? '200ms' : '0ms' }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#E8F5E9' : '#064E3B',
            borderRadius: 3,
            maxWidth: 450,
            borderLeft: '5px solid',
            borderColor: 'primary.main'
          }}
        >
          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 800, mb: 0.5, textAlign: 'left' }}>
            ¿Sabías que?
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'left', color: 'text.primary', fontStyle: 'italic' }}>
            "{consejosEcuatorianos[indiceConsejo]}"
          </Typography>
        </Paper>
      </Zoom>
    </Box>
  );
};

export default CargadorAnimado;
