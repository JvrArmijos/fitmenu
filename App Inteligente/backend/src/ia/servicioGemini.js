import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../configuracion/variablesEntorno.js';
import logs from '../utilidades/logs.js';

let genAI = null;

function inicializarGemini() {
    if (!CONFIG.gemini.apiKey || CONFIG.gemini.apiKey === 'CAMBIAME_CON_TU_GEMINI_API_KEY') {
        throw new Error('La clave API de Google Gemini (GEMINI_API_KEY) no está configurada.');
    }

    if (!genAI) {
        genAI = new GoogleGenAI({
            apiKey: CONFIG.gemini.apiKey
        });
    }

    return genAI;
}

/**
 * Llama a la API de Gemini para generar un menú nutricional.
 * 
 * @param {Object} perfilUsuario - Información nutricional, ubicación y restricciones del usuario.
 * @param {Array<Object>} alimentosDisponibles - Alimentos de temporada o locales de la BD.
 * @returns {Promise<Object>} Dieta estructurada en JSON.
 */
export async function generarDietaInteligente(perfilUsuario, alimentosDisponibles) {
  try {
    const clienteAI = inicializarGemini();
    logs.info('Generando dieta inteligente con Gemini...', {
      usuarioId: perfilUsuario.UsuarioId,
      objetivo: perfilUsuario.ObjetivoNombre,
      provincia: perfilUsuario.Provincia
    });

    // Formatear alimentos para el Prompt
    const listaAlimentosTexto = alimentosDisponibles.map(a => 
      `- ${a.Nombre} (${a.Categoria}): Proteínas ${a.Proteinas}g, Grasas ${a.Grasas}g, Carbohidratos ${a.Carbohidratos}g, Calorías ${a.Calorias}kcal, Precio aproximado $${a.PrecioAprox} (Temporada: ${a.Temporada}, Ubicación: ${a.Provincia || 'Nacional'})`
    ).join('\n');

    const restriccionesTexto = perfilUsuario.restricciones && perfilUsuario.restricciones.length > 0
      ? perfilUsuario.restricciones.map(r => `- ${r.Nombre} (${r.Tipo})`).join('\n')
      : 'Ninguna';

    // Construcción del Prompt dinámico enfocado en Ecuador
    const prompt = `
Eres un nutricionista experto en el contexto ecuatoriano y una Inteligencia Artificial altamente capacitada. Tu tarea es diseñar un plan alimenticio diario completo (desayuno, media mañana, almuerzo, merienda, cena) para un usuario en Ecuador, basándote en la siguiente información:

INFORMACIÓN DEL USUARIO:
- Edad: ${perfilUsuario.Edad} años
- Sexo: ${perfilUsuario.Sexo === 'M' ? 'Masculino' : 'Femenino'}
- Peso: ${perfilUsuario.PesoKg} kg
- Altura: ${perfilUsuario.AlturaCm} cm
- Nivel de Actividad: ${perfilUsuario.NivelActividad}
- IMC: ${perfilUsuario.IMC}
- Objetivo Nutricional: ${perfilUsuario.ObjetivoNombre}
- Presupuesto diario máximo estimado para alimentos: $${perfilUsuario.PresupuestoDiario} USD
- Ubicación: Provincia de ${perfilUsuario.Provincia}, Cantón ${perfilUsuario.Canton}, Parroquia ${perfilUsuario.Parroquia}

RESTRICCIONES ALIMENTICIAS / ENFERMEDADES / ALERGIAS:
${restriccionesTexto}

INGREDIENTES LOCALES Y DE TEMPORADA DISPONIBLES EN SU REGIÓN (Prioriza usar estos ingredientes en el plan):
${listaAlimentosTexto}

REQUISITOS DEL PLAN ALIMENTICIO:
1. El plan debe ser realista para el contexto local de Ecuador. Usa preparaciones típicas o adaptadas con ingredientes locales.
2. Respeta rigurosamente el presupuesto diario del usuario. La suma total debe ser menor o igual a $${perfilUsuario.PresupuestoDiario} USD.
3. Ajusta el contenido calórico al objetivo nutricional.
4. Si el usuario tiene restricciones, excluye totalmente ingredientes perjudiciales.
5. REGLA ESTRICTA DE FORMATO: La respuesta DEBE ser estrictamente un objeto JSON válido. NO uses comillas dobles ("") dentro de los textos o valores; si necesitas comillas, usa comillas simples (''). NO incluyas saltos de línea reales dentro de las cadenas de texto (usa \\n si es necesario). NO incluyas texto introductorio, markdown ni explicaciones fuera del JSON.

ESQUEMA JSON DE RETORNO:
{
  "objetivo": "Objetivo nutricional del usuario",
  "caloriasTotales": 2000,
  "proteinasTotales": 120.5,
  "grasasTotales": 65.2,
  "carbohidratosTotales": 220.0,
  "presupuestoEstimado": 4.50,
  "detalles": [
    {
      "tipoComida": "Desayuno",
      "alimentoSugerido": "Nombre de la preparación",
      "cantidad": "Descripción de la porción",
      "calorias": 450.0,
      "proteinas": 18.5,
      "grasas": 12.0,
      "carbohidratos": 55.0
    }
  ],
  "recetas": [
    {
      "nombre": "Nombre de la receta",
      "ingredientes": "Lista de ingredientes y cantidades",
      "preparacion": "Pasos detallados",
      "tiempoEstimadoMinutos": 15
    }
  ],
  "listaCompras": [
    {
      "ingrediente": "Nombre del ingrediente",
      "cantidad": "Cantidad total a comprar",
      "costoAproximado": 0.45
    }
  ],
  "explicacionNutricional": "Explicación detallada sin comillas dobles internas ni saltos de linea no escapados."
}
`;

    const resultado = await clienteAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
            temperature: 0.2, // Bajamos un poco la temperatura para que sea más determinista y respete mejor el formato
            responseMimeType: "application/json"
        }
    });

    const respuestaTexto = resultado.text || "";
    
    // Limpieza robusta del JSON por si el modelo devuelve bloques de markdown
    const jsonLimpio = respuestaTexto.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let datosDieta;
    
    try {
      datosDieta = JSON.parse(jsonLimpio);
    } catch (parseError) {
      // Si vuelve a fallar, guardamos el texto crudo en los logs para saber EXACTAMENTE dónde se equivocó Gemini
      logs.error('Error crítico al parsear el JSON devuelto por Gemini. Texto crudo recibido:', jsonLimpio);
      throw new Error('La IA generó un formato de datos inválido. Por favor, intenta de nuevo.');
    }
    
    // Validar esquema mínimo
    const camposRequeridos = ['objetivo', 'caloriasTotales', 'proteinasTotales', 'grasasTotales', 'carbohidratosTotales', 'presupuestoEstimado', 'detalles', 'recetas', 'listaCompras'];
    for (const campo of camposRequeridos) {
      if (datosDieta[campo] === undefined) {
        throw new Error(`La respuesta de Gemini carece del campo obligatorio: ${campo}`);
      }
    }

    logs.info('Plan alimenticio generado y validado con éxito.');
    return datosDieta;
    
  } catch (err) {
    logs.error('Error al generar dieta inteligente con Gemini:', err);
    throw new Error('Fallo en el servicio de Inteligencia Artificial para generar la dieta: ' + err.message);
  }
}

/**
 * Llama a la API de Gemini para responder consultas nutricionales/de la aplicación personalizadamente.
 * 
 * @param {string} mensaje - Consulta del usuario.
 * @param {Object} perfilUsuario - Perfil completo del usuario (incluyendo restricciones).
 * @returns {Promise<string>} Respuesta del Chatbot.
 */
export async function consultarChatbot(mensaje, perfilUsuario) {
  try {
    const clienteAI = inicializarGemini();

    logs.info("Enviando consulta a Chatbot Gemini...", {
      usuarioId: perfilUsuario?.UsuarioId
    });

    const restriccionesTexto = perfilUsuario?.restricciones && perfilUsuario.restricciones.length > 0
      ? perfilUsuario.restricciones.map((r) => `- ${r.Nombre} (${r.Tipo})`).join("\n")
      : "Ninguna";

    const infoUsuarioContexto = perfilUsuario
      ? `DATOS DEL USUARIO AUTENTICADO:
- Nombre: ${perfilUsuario.NombreCompleto || "Usuario"}
- Edad: ${perfilUsuario.Edad || "No especificada"} años
- Sexo: ${perfilUsuario.Sexo === "M" ? "Masculino" : perfilUsuario.Sexo === "F" ? "Femenino" : "No especificado"}
- Peso: ${perfilUsuario.PesoKg || "No especificado"} kg
- Altura: ${perfilUsuario.AlturaCm || "No especificada"} cm
- Nivel de Actividad: ${perfilUsuario.NivelActividad || "No especificado"}
- IMC: ${perfilUsuario.IMC || "No especificado"}
- Objetivo Nutricional: ${perfilUsuario.ObjetivoNombre || "No especificado"}
- Presupuesto Diario Máximo: $${perfilUsuario.PresupuestoDiario || "No especificado"} USD
- Ubicación: Provincia ${perfilUsuario.Provincia || ""}, Cantón ${perfilUsuario.Canton || ""}, Parroquia ${perfilUsuario.Parroquia || ""}
- Restricciones Alimenticias / Alergias:
${restriccionesTexto}`
      : "El usuario no ha completado su perfil nutricional o no está autenticado.";

    const systemPrompt = `Eres un asistente nutricional virtual experto integrado en la aplicación "FitMenu Local" de Ecuador. Tu objetivo es ayudar a los usuarios con preguntas sobre la aplicación, nutrición, hábitos saludables, y recetas/ingredientes locales ecuatorianos (Costa, Sierra, Amazonía, Galápagos).

${infoUsuarioContexto}

REGLAS DE COMPORTAMIENTO:
1. Sé amable, empático y profesional.
2. Si el usuario te hace preguntas personales como "¿Cuál es mi IMC?" o "¿Qué alimentos debo evitar según mi salud?", consulta la información del usuario proporcionada arriba y dale una respuesta personalizada y detallada.
3. Si el usuario no ha completado su perfil (o ciertos datos están ausentes) y te pregunta sobre ellos, indícales amablemente que pueden completarlos en la sección "Perfil" de la aplicación.
4. Promueve siempre el uso de ingredientes locales de Ecuador que sean económicos y de temporada (mote, chochos, quinua, papa chola, yuca, plátano verde, maracuyá, etc.).
5. Mantén las respuestas claras, concisas, estructuradas con viñetas cuando sea apropiado, y en un tono motivador.
6. Nunca inventes datos médicos. Si el usuario te hace consultas sobre síntomas graves o tratamientos médicos complejos, sugiérele consultar a un profesional de la salud.

PREGUNTA DEL USUARIO:
"${mensaje}"
`;

    const resultado = await clienteAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt
    });

    return resultado.text;

  } catch (err) {
    logs.error("Error en Chatbot Gemini:", err);
    throw new Error("Fallo al obtener respuesta del asistente virtual: " + err.message);
  }
}

export default {
  generarDietaInteligente,
  consultarChatbot
};