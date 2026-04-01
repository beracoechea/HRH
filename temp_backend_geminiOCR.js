const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializar el SDK de Gemini usando una variable de entorno de Google Cloud Functions
// Si usas dotenv, asegúrate de cargarlo, pero en Firebase Functions nativo se usa config o .env nativo (V2).
// Asegurate de añadir GEMINI_API_KEY en tu archivo .env de functions
const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
const genAI = new GoogleGenerativeAI(apiKey);

// Asegurarse de que admin esté inicializado en el index.js principal.
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Endpoint para analizar los documentos subidos en el Paso 1 y extraer datos KYC
 *
 * Request Payload esperado:
 * {
 *   data: {
 *     creditoId: "ID_DEL_ESTATUS",
 *     documentUrls: ["url_doc1", "url_doc2"] // URLs públicas o referencias de Storage
 *   }
 * }
 */
exports.analizarDocumentosGenerales = functions.https.onCall(async (data, context) => {
    // 1. Validar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Debe estar autenticado para procesar documentos."
        );
    }

    const { creditoId, documentUrls } = data;

    if (!creditoId || !documentUrls || documentUrls.length === 0) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Faltan parámetros requeridos: creditoId o documentUrls."
        );
    }

    try {
        console.log(`Iniciando OCR con Gemini para crédito: ${creditoId}`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // TODO: En producción real, es mejor usar la API 'File' de Gemini si se pasan referencias de GS://
        // o descargar los buffers desde Firebase Storage e inyectarlos. 
        // Para simplificar, suponemos que las urls están pre-cargadas o le enviamos un texto si fallara.
        // Aquí simulamos cómo construirías el requerimiento enviando las URIs directamente si son accesibles
        // o usando base64 (recomendado para Firebase Storage sin acceso público).
        
        const prompt = `
        Eres un asistente experto en revisión de documentos legales (KYC) y extracción de datos.
        A continuación procesarás varios documentos de identidad (como INE, pasaporte) y comprobantes de domicilio / fiscales.
        
        Actúa como un OCR súper preciso y cruza la información de todos los documentos provistos.
        Extrae y devuelve UNICAMENTE un objeto JSON con la siguiente estructura, sin texto adicional ni markdown:
        {
          "scoreLegibilidad": 0, // Un número del 0 al 100 indicando qué tan nítida y confiable es la lectura global. Si la imagen es borrosa, pon menos de 90.
          "nombreCompleto": "",
          "nombres": "",
          "apellidos": "",
          "curp": "",
          "rfc": "",
          "fechaNacimiento": "YYYY-MM-DD",
          "genero": "", // M, F, u otro
          "estadoCivil": "", // Soltero, Casado, etc si se detecta
          "direccionCompleta": "",
          "calleYNumero": "",
          "colonia": "",
          "codigoPostal": "",
          "ciudad": "",
          "estadoProvincia": ""
        }
        Asegúrate de deducir campos que estén claros y llena con "" los que no encuentres.
        `;

        // Lógica de descarga en buffer (Omitido por brevedad, requiere fetch() o admin.storage() para convertirlos a formato multimonodal para Gemini)
        /* EJEMPLO DE INYECCIÓN DE IMÁGENES
        const imageParts = documentUrls.map(url => ({
            inlineData: {
                data: Buffer.from(descargado).toString("base64"),
                mimeType: "image/jpeg"
            }
        }));
        */
        
        // Simulación: asumiendo que ya convertimos las imágenes. Si envías solo URLs de imágenes públicas, Gemini 1.5 a veces las soporta vía Part.
        // Por ahora, enviaremos la petición al modelo.
        
        // LLAAMDA REAL AL MODELO (Debes inyectar imageParts además del prompt en generateContent)
        // const result = await model.generateContent([prompt, ...imageParts]);
        const result = await model.generateContent(prompt); // Placeholder de llamada simple

        const responseText = result.response.text();
        
        // Limpiamos el json si Gemini devolvió backticks
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const extractedData = JSON.parse(cleanJson);

        if (extractedData.scoreLegibilidad < 90) {
            return {
                success: false,
                error: "Detección de baja legibilidad. Por favor, sube imágenes más claras.",
                score: extractedData.scoreLegibilidad
            };
        }

        // 3. Guardar en Base de Datos
        // Guardamos el kycData en el crédito correspondiente para que el usuario proceda al Paso 2
        await admin.firestore().collection('creditos').doc(creditoId).update({
            kycData: extractedData,
            fase: 2, // AVANZA AUTOMÁTICAMENTE LA FASE A KYC
            lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            data: extractedData
        };

    } catch (error) {
        console.error("Error en analizarDocumentosGenerales:", error);
        throw new functions.https.HttpsError("internal", "Error procesando con Gemini: " + error.message);
    }
});
