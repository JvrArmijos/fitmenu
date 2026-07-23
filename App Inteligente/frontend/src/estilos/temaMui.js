import { createTheme } from '@mui/material/styles';

export const obtenerTema = (modo) => {
  return createTheme({
    palette: {
      mode: modo,
      primary: {
        main: '#2E7D32', // Verde saludable / natural
        light: '#60AD5E',
        dark: '#005005',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#E65100', // Naranja cálido / tierra
        light: '#FF833A',
        dark: '#AC1900',
        contrastText: '#ffffff',
      },
      background: {
        default: modo === 'light' ? '#F4F6F8' : '#0F172A',
        paper: modo === 'light' ? '#ffffff' : '#1E293B',
      },
      text: {
        primary: modo === 'light' ? '#1E293B' : '#F8FAFC',
        secondary: modo === 'light' ? '#64748B' : '#94A3B8',
      },
      divider: modo === 'light' ? '#E2E8F0' : '#334155',
    },
    typography: {
      fontFamily: '"Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.15)',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#1B5E20',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            boxShadow: modo === 'light' 
              ? '0px 2px 8px rgba(148, 163, 184, 0.08), 0px 8px 16px rgba(148, 163, 184, 0.05)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.25)',
            border: modo === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: modo === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            color: modo === 'light' ? '#0F172A' : '#F8FAFC',
            borderBottom: modo === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
            boxShadow: 'none',
          },
        },
      },
    },
  });
};

export default obtenerTema;
