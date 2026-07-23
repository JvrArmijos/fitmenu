import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contextos/contextoAutenticacion.jsx';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

export const PaginaRegistro = () => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(false);
  const { registrar } = useAutenticacion();
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!nombreCompleto || !email || !contrasena || !confirmarContrasena) {
      setErrorLocal('Todos los campos son obligatorios.');
      return;
    }

    if (contrasena.length < 6) {
      setErrorLocal('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setErrorLocal('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setCargandoForm(true);
    try {
      await registrar(nombreCompleto, email, contrasena);
      setRegistroExitoso(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorLocal(err || 'Hubo un error al registrar el usuario.');
    } finally {
      setCargandoForm(false);
    }
  };

  if (registroExitoso) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
          ¡Registro Completado con Éxito!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Tu cuenta ha sido creada. Te estamos redirigiendo a la página de inicio de sesión para que ingreses por primera vez...
        </Typography>
        <CircularProgress size={30} />
      </Box>
    );
  }

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
          <AppRegistrationIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Crea tu Cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Únete y planifica tu nutrición con alimentos locales
        </Typography>
      </Box>

      {errorLocal && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {errorLocal}
        </Alert>
      )}

      <Box component="form" onSubmit={manejarEnvio}>
        <TextField
          margin="dense"
          required
          fullWidth
          id="nombreCompleto"
          label="Nombre Completo"
          name="nombreCompleto"
          autoFocus
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          disabled={cargandoForm}
        />
        <TextField
          margin="dense"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={cargandoForm}
        />
        <TextField
          margin="dense"
          required
          fullWidth
          name="contrasena"
          label="Contraseña (Mínimo 6 caracteres)"
          type="password"
          id="contrasena"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          disabled={cargandoForm}
        />
        <TextField
          margin="dense"
          required
          fullWidth
          name="confirmarContrasena"
          label="Confirmar Contraseña"
          type="password"
          id="confirmarContrasena"
          value={confirmarContrasena}
          onChange={(e) => setConfirmarContrasena(e.target.value)}
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
          {cargandoForm ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ¿Ya tienes una cuenta?{' '}
          <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 600 }}>
            Inicia sesión aquí
          </Link>
        </Typography>
        <Link component={RouterLink} to="/" variant="body2" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          Volver a la página principal
        </Link>
      </Box>
    </Box>
  );
};

export default PaginaRegistro;
