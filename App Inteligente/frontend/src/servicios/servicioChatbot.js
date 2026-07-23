import clienteApi from './clienteApi.js';

export const enviarMensajeChatbot = async (mensaje) => {
  const res = await clienteApi.post('/usuarios/chatbot', { mensaje });
  return res.data.datos.respuesta;
};

export default {
  enviarMensajeChatbot
};
