import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary ha capturado un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 5,
              maxWidth: 550,
              textAlign: 'center',
              borderRadius: 4,
              borderLeft: '6px solid',
              borderColor: 'error.main'
            }}
          >
            <WarningAmberIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
              Algo salió mal
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              La aplicación ha detectado un error inesperado. Por favor, intenta recargar la página o volver al inicio.
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  p: 2,
                  mb: 4,
                  backgroundColor: 'background.default',
                  borderRadius: 2,
                  textAlign: 'left',
                  maxHeight: 150,
                  overflowY: 'auto'
                }}
              >
                <code style={{ fontSize: '0.85rem', color: '#d32f2f' }}>
                  {this.state.error.toString()}
                </code>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
                sx={{ borderRadius: 2 }}
              >
                Recargar Página
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/'}
                sx={{ borderRadius: 2 }}
              >
                Ir al Inicio
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
