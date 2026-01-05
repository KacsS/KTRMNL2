# Configuración de Vercel KV (Redis) para KTRMNL2

## 🎯 Problema que resuelve

Vercel tiene un sistema de archivos **efímero**, lo que significa que cualquier archivo que guardes (como `layout.json` o `data.json`) se perderá cuando:
- ⏱️ La función se reinicie (cada ~20 minutos de inactividad)
- 🚀 Hagas un nuevo deploy
- 🔄 Vercel recicle la instancia automáticamente

**Solución:** Vercel KV (Upstash Redis) es una base de datos Redis que persiste tus datos permanentemente.

---

## ✅ Pasos de Configuración

### Paso 1: Crear base de datos Redis en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en la pestaña **"Storage"**
3. Haz clic en **"Create Database"** → Selecciona **"KV"** (Redis)
4. Dale un nombre: `ktrmnl2-storage`
5. Selecciona la región más cercana (ej: `us-east-1`)
6. Haz clic en **"Create"**

### Paso 2: Conectar Redis a tu proyecto

1. Después de crear la base de datos, haz clic en **"Connect to Project"**
2. Selecciona tu proyecto **KTRMNL2**
3. Haz clic en **"Connect"**

✨ Vercel automáticamente agregará estas variables de entorno:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Paso 3: Verificar variables de entorno

1. En Vercel Dashboard → Tu proyecto → **Settings** → **Environment Variables**
2. Verifica que existan las 3 variables mencionadas arriba
3. Deben estar disponibles para **Production**, **Preview** y **Development**

### Paso 4: Hacer deploy

```bash
git add .
git commit -m "Vercel KV configured"
git push
```

Vercel automáticamente detectará los cambios y hará el deploy.

---

## 🔧 Cómo funciona el código

El módulo `src/storage.js` detecta automáticamente el entorno:

| Entorno | Almacenamiento | Ubicación |
|---------|---------------|-----------|
| **Local** (desarrollo) | Archivos JSON | `config/layout.json`, `config/data.json` |
| **Vercel** (producción) | Redis (KV) | Upstash Cloud |

**Ventajas:**
- ✅ En desarrollo local funciona igual que antes (archivos JSON)
- ✅ En Vercel los datos persisten permanentemente (Redis)
- ✅ No necesitas cambiar nada en tu código
- ✅ Transición automática y transparente

---

## 🧪 Verificar que funciona

### Prueba 1: Después del deploy
1. Despliega a Vercel
2. Abre el admin: `https://tu-proyecto.vercel.app/admin`
3. Agrega algunos widgets y guarda
4. Refresca la página → Los widgets deben seguir ahí ✅

### Prueba 2: Persistencia a largo plazo
1. Espera 30+ minutos (o haz un nuevo deploy)
2. Abre el dashboard: `https://tu-proyecto.vercel.app/dashboard`
3. Los widgets deben seguir ahí ✅

### Prueba 3: Ver datos en Redis
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard) → **Storage** → Tu base de datos
2. Haz clic en **"Data Browser"**
3. Verás las claves `layout` y `data` con tus configuraciones

---

## 📊 Plan gratuito de Vercel KV

- ✅ **10,000 comandos/día** (más que suficiente)
- ✅ **256 MB de almacenamiento**
- ✅ **Sin tarjeta de crédito requerida**
- ✅ **Perfecto para KTRMNL2**

---

## 🐛 Troubleshooting

### ⚠️ "KV not available, falling back to file storage"

**Causa:** Esto es **NORMAL** en desarrollo local.  
**Solución:** No hacer nada. Vercel KV solo funciona en producción.

### ❌ Los datos siguen desapareciendo en Vercel

**Verificar:**
1. ✅ KV está conectado al proyecto en Vercel Dashboard → Storage
2. ✅ Variables de entorno existen: Settings → Environment Variables
3. ✅ Las variables están en **Production**
4. ✅ Revisa los logs: Vercel Dashboard → Deployments → Ver logs

**Ver logs en Vercel:**
```
Busca mensajes como:
✅ Vercel KV initialized
📤 KV SET layout: success
📥 KV GET layout: found
```

Si ves `❌ KV GET error` o `❌ KV SET error`, las variables de entorno no están configuradas correctamente.

### 🔍 Inspeccionar datos en Redis

**Opción 1: Vercel Dashboard**
1. Vercel Dashboard → Storage → Tu base de datos
2. Haz clic en **"Data Browser"**

**Opción 2: Upstash Console**
1. Ve a [Upstash Console](https://console.upstash.com/)
2. Inicia sesión con tu cuenta de Vercel
3. Selecciona tu base de datos
4. Haz clic en **"Data Browser"**

---

## 📝 Notas importantes

1. **No necesitas instalar nada localmente** - `@vercel/kv` ya está en `package.json`
2. **El código ya está implementado** - `src/storage.js` maneja todo automáticamente
3. **Solo necesitas configurar en Vercel** - Sigue los pasos 1-4 arriba
4. **Los archivos locales siguen funcionando** - Para desarrollo local

---

## 🚀 Siguiente paso

Después de configurar Vercel KV:
1. Haz un deploy
2. Prueba agregar widgets en `/admin`
3. Verifica que persistan después de 30 minutos o un nuevo deploy
4. ✅ ¡Listo! Tus datos ahora son permanentes
