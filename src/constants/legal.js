export const LEGAL_CONTACT_EMAIL = "BioTag@gmail.com";
export const TERMS_VERSION = "1.0";
export const PRIVACY_VERSION = "1.0";

export const termsSections = [
  {
    title: "Uso de BioTag",
    body:
      "BioTag permite escanear productos alimenticios y recibir informacion orientativa segun los datos del producto y el perfil cargado por el usuario."
  },
  {
    title: "Informacion no medica",
    body:
      "Las recomendaciones de BioTag son informativas y no reemplazan diagnostico, tratamiento, indicacion medica ni la consulta con profesionales de salud."
  },
  {
    title: "Datos de productos",
    body:
      "La informacion de alimentos puede provenir de bases externas y etiquetas cargadas por terceros. Puede estar incompleta, desactualizada o contener errores."
  },
  {
    title: "Uso de inteligencia artificial",
    body:
      "BioTag puede usar modelos de IA para generar recomendaciones. Esas respuestas deben ser revisadas por el usuario y no deben tomarse como decisiones medicas definitivas."
  },
  {
    title: "Responsabilidad del usuario",
    body:
      "El usuario debe revisar siempre la etiqueta del producto, ingredientes, alergenos y advertencias del fabricante antes de consumirlo."
  },
  {
    title: "Cambios en los terminos",
    body:
      "BioTag puede actualizar estos terminos. Si los cambios son relevantes, la app podra solicitar una nueva aceptacion antes de continuar."
  }
];

export const privacySections = [
  {
    title: "Datos que se guardan",
    body:
      "BioTag puede guardar email, nombre, perfil de salud, edad, peso, altura, enfermedades, dietas, alergias e historial de escaneos."
  },
  {
    title: "Para que se usan",
    body:
      "Estos datos se usan para autenticar la cuenta, personalizar recomendaciones, mostrar el historial y mejorar la experiencia dentro de la app."
  },
  {
    title: "Datos sensibles",
    body:
      "Al cargar informacion de salud, el usuario autoriza a BioTag a procesarla para generar recomendaciones alimentarias orientativas."
  },
  {
    title: "Servicios externos",
    body:
      "BioTag puede consultar servicios externos para autenticacion, informacion de productos y generacion de recomendaciones con IA."
  },
  {
    title: "Contacto",
    body:
      `Para consultas sobre terminos, privacidad o datos personales, escribi a ${LEGAL_CONTACT_EMAIL}.`
  }
];
