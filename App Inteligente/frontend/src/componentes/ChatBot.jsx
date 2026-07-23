import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Fab, Card, CardHeader, CardContent, TextField,
  IconButton, Typography, Paper, CircularProgress, Chip, Zoom
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { enviarMensajeChatbot } from '../servicios/servicioChatbot.js';

export const ChatBot = () => {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([
    {
      emisor: 'ai',
      texto: '¡Hola! Soy tu asistente de **FitMenu Local**. Puedo ayudarte con dudas de nutrición, recetas ecuatorianas, ingredientes locales o sobre tu propio perfil físico. ¿De qué te gustaría hablar hoy?'
    }
  ]);
  const [cargando, setCargando] = useState(false);
  const contenedorMensajesRef = useRef(null);

  // Desplazar al final cuando hay nuevos mensajes
  useEffect(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight;
    }
  }, [mensajes, abierto]);

  const manejarEnviar = async (parametro) => {
    // Si 'parametro' es un evento (viene de onClick o onKeyDown), lo ignoramos y usamos 'mensaje'
    const textoAEnviar = typeof parametro === 'string' ? parametro : null;
    const texto = (textoAEnviar || mensaje).trim();
    
    if (!texto) return;

    // Si enviamos desde el input (no desde un chip), limpiamos la caja
    if (!textoAEnviar) {
      setMensaje('');
    }

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario = { emisor: 'usuario', texto };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setCargando(true);

    try {
      const respuesta = await enviarMensajeChatbot(texto);
      setMensajes((prev) => [...prev, { emisor: 'ai', texto: respuesta }]);
    } catch (err) {
      console.error('Error al consultar al chatbot:', err);
      const errorMsg = err.response?.data?.mensaje || err.message || 'Lo siento, no pude procesar tu solicitud.';
      setMensajes((prev) => [...prev, { 
        emisor: 'ai', 
        texto: `⚠️ **Error:** ${errorMsg}\n\nPor favor, verifica que la clave de API de Gemini esté configurada en el servidor.` 
      }]);
    } finally {
      setCargando(false);
    }
  };

  const sugerencias = [
    '¿Qué ingredientes locales hay de temporada?',
    '¿Cuál es mi objetivo y restricciones?',
    '¿Cómo calculo mi IMC?',
    'Sugiéreme un desayuno saludable'
  ];

  // Helper para formatear texto simple con negritas y listas
  const formatearTexto = (texto) => {
    if (!texto) return '';
    return texto.split('\n').map((linea, index) => {
      const esVinyeta = linea.trim().startsWith('-') || linea.trim().startsWith('*');
      let contenido = esVinyeta ? linea.trim().substring(1).trim() : linea;

      // Parsear **negritas**
      const partes = contenido.split('**');
      const nodoTexto = partes.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i}>{part}</strong>;
        }
        return part;
      });

      if (esVinyeta) {
        return (
          <li key={index} style={{ marginLeft: 16, marginBottom: 4, fontSize: '0.875rem' }}>
            {nodoTexto}
          </li>
        );
      }

      return (
        <Typography key={index} variant="body2" sx={{ mb: 1, minHeight: '1.2em', fontSize: '0.875rem' }}>
          {nodoTexto}
        </Typography>
      );
    });
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {/* Botón Flotante */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setAbierto(!abierto)}
          sx={{
            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.4)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          {abierto ? <CloseIcon /> : <SmartToyIcon />}
        </Fab>
      </Zoom>

      {/* Ventana de Chat */}
      {abierto && (
        <Card
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 72,
            right: 0,
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            maxHeight: { xs: '80vh', sm: 520 },
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            '@media (max-width: 600px)': {
              position: 'fixed',
              bottom: 0,
              right: 0,
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              borderRadius: 0,
              zIndex: 1001
            }
          }}
        >
          {/* Cabecera */}
          <CardHeader
            avatar={<SmartToyIcon sx={{ color: 'white' }} />}
            title="Asistente Virtual FitMenu"
            subheader="Nutrición Inteligente Ecuatoriana"
            action={
              <IconButton onClick={() => setAbierto(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            }
            sx={{
              background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
              color: 'white',
              pb: 1.5,
              '& .MuiCardHeader-subheader': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem'
              },
              '& .MuiCardHeader-title': {
                fontWeight: 700,
                fontSize: '0.95rem'
              }
            }}
          />

          {/* Cuerpo - Mensajes */}
          <CardContent
            ref={contenedorMensajesRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : '#121212'
            }}
          >
            {mensajes.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: msg.emisor === 'usuario' ? 'flex-end' : 'flex-start'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    px: 2,
                    maxWidth: '85%',
                    borderRadius: msg.emisor === 'usuario' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    backgroundColor: msg.emisor === 'usuario' ? 'primary.main' : 'background.paper',
                    color: msg.emisor === 'usuario' ? 'primary.contrastText' : 'text.primary',
                    border: '1px solid',
                    borderColor: msg.emisor === 'usuario' ? 'primary.dark' : 'divider'
                  }}
                >
                  {formatearTexto(msg.texto)}
                </Paper>
              </Box>
            ))}

            {/* Cargador/Indicador de Escritura */}
            {cargando && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    px: 2.5,
                    borderRadius: '18px 18px 18px 2px',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={16} color="primary" />
                  <Typography variant="caption" color="text.secondary">
                    Pensando...
                  </Typography>
                </Paper>
              </Box>
            )}
          </CardContent>

          {/* Sugerencias rápidas (Solo si no está cargando) */}
          {!cargando && mensajes.length === 1 && (
            <Box
              sx={{
                p: 1.5,
                pt: 0,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : '#121212',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              {sugerencias.map((sug, i) => (
                <Chip
                  key={i}
                  label={sug}
                  size="small"
                  onClick={() => manejarEnviar(sug)}
                  sx={{
                    fontSize: '0.75rem',
                    backgroundColor: 'background.paper',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText'
                    }
                  }}
                />
              ))}
            </Box>
          )}

          {/* Acciones - Campo de Texto */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              manejarEnviar();
            }}
            sx={{
              display: 'flex',
              p: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              alignItems: 'center'
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe tu consulta nutricional..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={cargando}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  manejarEnviar();
                }
              }}
              slotProps={{
                htmlInput: {
                  style: { fontSize: '0.875rem' }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 4
                }
              }}
            />
            <IconButton
              type="button"
              color="primary"
              disabled={!mensaje.trim() || cargando}
              onClick={(e) => {
                e.preventDefault();
                manejarEnviar();
              }}
              sx={{
                ml: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled'
                }
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default ChatBot;