<<<<<<< HEAD
# biotag_mvp
En este repositorio está configurado el entorno de desarrollo del proyecto BioTag
=======
# BioTag React Native

App mobile en Expo + backend Express + PostgreSQL basada en BioTag.

## Setup

```bash
npm install
cp .env.example .env
npm run db:setup
npm run api
npm start
```

Para Android emulator, usar `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000`.

## Base de datos

El esquema PostgreSQL esta en `src/server/schema.sql` y replica las tablas del diagrama:

- `usuario`
- `perfil_salud`
- `enfermedad`
- `dieta`
- `alergia`
- `perfil_salud_enfermedad`
- `perfil_salud_dieta`
- `perfil_salud_alergia`
- `historial_escaneo`
>>>>>>> 66b3a39 (primer  commit)
