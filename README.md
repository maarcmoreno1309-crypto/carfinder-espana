# CarFinder España — Instrucciones de instalación

## Archivos del proyecto
- `page.jsx` → Página principal (pega en v0.dev)
- `api/search/route.js` → Backend que llama a Apify + Claude
- `.env.local` → Variables de entorno (NUNCA subas este archivo a GitHub)

## Pasos para poner en marcha

### 1. En v0.dev
- Pega el contenido de `page.jsx` en el editor
- Descarga el proyecto como Next.js

### 2. Variables de entorno en Vercel
Ve a tu proyecto en Vercel → Settings → Environment Variables y añade:
- `APIFY_API_KEY` = tu clave de Apify
- `ANTHROPIC_API_KEY` = tu clave de Anthropic

### 3. Estructura de carpetas en tu proyecto Next.js
```
/app
  page.jsx          ← el frontend
  /api
    /search
      route.js      ← el backend
```
