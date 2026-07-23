import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export const PaginaLogin = () => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const [cargandoForm, setCargandoForm] = useState(false);
  const { iniciarSesion } = useAutenticacion();
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!email || !contrasena) {
      setErrorLocal('Todos los campos son obligatorios.');
      return;
    }

    setCargandoForm(true);
    try {
      const datosUsuario = await iniciarSesion(email, contrasena);
      // Redirigir según el rol
      if (datosUsuario.rol === 'Administrador') {
        navigate('/dashboard');
      } else {
        // Redirige al generador de dietas
        navigate('/generar-dieta');
      }
    } catch (err) {
      setErrorLocal(err || 'Fallo de conexión. Intente más tarde.');
    } finally {
      setCargandoForm(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            color: 'white',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RestaurantIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Ingresa a FitMenu Local
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tu nutrición inteligente con alimentos ecuatorianos
        </Typography>
      </Box>

      {errorLocal && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorLocal}
        </Alert>
      )}

      <Box component="form" onSubmit={manejarEnvio}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={cargandoForm}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="contrasena"
          label="Contraseña"
          type="password"
          id="contrasena"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          disabled={cargandoForm}
          sx={{ mb: 3 }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={cargandoForm}
          sx={{ py: 1.5 }}
        >
          {cargandoForm ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ¿No tienes una cuenta aún?{' '}
          <Link component={RouterLink} to="/registro" variant="body2" sx={{ fontWeight: 600 }}>
            Regístrate aquí
          </Link>
        </Typography>
        <Link component={RouterLink} to="/" variant="body2" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          Volver a la página principal
        </Link>
      </Box>
    </Box>
  );
};

export default PaginaLogin;
