# Configuración de Vercel KV para KTRMNL2

## ¿Por qué Vercel KV?

Vercel tiene un sistema de archivos **efímero**, lo que significa que cualquier archivo que guardes (como `layout.json` o `data.json`) se perderá cuando:
- La función se reinicie (cada ~20 minutos de inactividad)
- Hagas un nuevo deploy
- Vercel recicle la instancia automáticamente

**Vercel KV** es una base de datos Redis que persiste tus datos permanentemente.

## Pasos para configurar Vercel KV

### 1. Crear una base de datos KV en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en la pestaña **"Storage"**
3. Haz clic en **"Create Database"**
4. Selecciona **"KV"** (Redis)
5. Dale un nombre (por ejemplo: `ktrmnl2-storage`)
6. Haz clic en **"Create"**

### 2. Conectar KV a tu proyecto

1. En la página de tu base de datos KV, haz clic en **"Connect Project"**
2. Selecciona tu proyecto `KTRMNL2`
3. Haz clic en **"Connect"**

Vercel automáticamente agregará las variables de entorno necesarias:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 3. Hacer deploy

```bash
git add .
git commit -m "Add Vercel KV for persistent storage"
git push
```

Vercel automáticamente detectará los cambios y hará el deploy.

## ¿Cómo funciona?

El código ahora usa un **módulo de almacenamiento** (`src/storage.js`) que:

- **En Vercel**: Usa Vercel KV (Redis) para guardar datos permanentemente
- **En local**: Usa archivos JSON en la carpeta `config/` (como antes)

Esto significa que:
- ✅ En desarrollo local, todo funciona igual que antes
- ✅ En Vercel, tus widgets y configuraciones persisten para siempre
- ✅ No necesitas cambiar nada en tu código

## Verificar que funciona

1. Despliega a Vercel
2. Agrega algunos widgets en el admin
3. Espera 30+ minutos (o haz un nuevo deploy)
4. Verifica que los widgets sigan ahí

## Plan gratuito de Vercel KV

- ✅ 256 MB de almacenamiento
- ✅ 30,000 comandos por día
- ✅ Más que suficiente para KTRMNL2

## Troubleshooting

### "KV not available, falling back to file storage"

Esto es normal en desarrollo local. Vercel KV solo funciona en producción.

### Los datos siguen desapareciendo

1. Verifica que KV esté conectado a tu proyecto en Vercel Dashboard
2. Revisa los logs de Vercel para ver si hay errores
3. Asegúrate de que las variables de entorno estén configuradas

### Ver los datos en KV

1. Ve a Vercel Dashboard → Storage → Tu base de datos KV
2. Haz clic en **"Data Browser"**
3. Verás las claves `layout` y `data` con tus configuraciones
