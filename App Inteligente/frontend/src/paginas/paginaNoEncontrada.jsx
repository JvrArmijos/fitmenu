import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

export const PaginaNoEncontrada = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <SentimentVeryDissatisfiedIcon color="secondary" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        404 - Página No Encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
        Lo sentimos, la sección que buscas no existe o ha sido movida. Verifica la dirección URL.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Volver a Inicio
      </Button>
    </Box>
  );
};

export default PaginaNoEncontrada;
