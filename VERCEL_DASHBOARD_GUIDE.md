# Guía Visual: Configurar Vercel KV

Esta guía te muestra exactamente dónde hacer clic en Vercel Dashboard para configurar Redis (KV).

---

## 📍 Paso 1: Ir a Storage

1. Abre [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **KTRMNL2**
3. Haz clic en la pestaña **"Storage"** (en el menú superior)

```
Vercel Dashboard
├── Overview
├── Deployments
├── Analytics
├── Logs
├── Settings
└── 📦 Storage  ← HAZ CLIC AQUÍ
```

---

## 📍 Paso 2: Crear base de datos KV

En la página de Storage:

1. Haz clic en el botón **"Create Database"** o **"Connect Store"**
2. Selecciona **"KV"** (aparecerá con el logo de Upstash/Redis)
3. Haz clic en **"Continue"**

```
┌─────────────────────────────────────┐
│  Choose a database type:            │
│                                      │
│  ┌──────────┐  ┌──────────┐        │
│  │   KV     │  │ Postgres │        │
│  │  Redis   │  │          │        │
│  └──────────┘  └──────────┘        │
│      ↑                              │
│  HAZ CLIC AQUÍ                      │
└─────────────────────────────────────┘
```

---

## 📍 Paso 3: Configurar la base de datos

Completa el formulario:

| Campo | Valor |
|-------|-------|
| **Database Name** | `ktrmnl2-storage` |
| **Region** | `us-east-1` (o la más cercana) |

Luego haz clic en **"Create"**

```
┌─────────────────────────────────────┐
│  Create KV Database                  │
│                                      │
│  Database Name:                      │
│  ┌────────────────────────────────┐ │
│  │ ktrmnl2-storage                │ │
│  └────────────────────────────────┘ │
│                                      │
│  Region:                             │
│  ┌────────────────────────────────┐ │
│  │ us-east-1 ▼                    │ │
│  └────────────────────────────────┘ │
│                                      │
│  [ Create ]  [ Cancel ]              │
└─────────────────────────────────────┘
```

---

## 📍 Paso 4: Conectar al proyecto

Después de crear la base de datos:

1. Vercel te mostrará un mensaje: **"Connect to a project"**
2. Selecciona **KTRMNL2** de la lista
3. Haz clic en **"Connect"**

```
┌─────────────────────────────────────┐
│  ✅ Database created successfully!   │
│                                      │
│  Connect to a project:               │
│  ┌────────────────────────────────┐ │
│  │ KTRMNL2                    ✓   │ │
│  └────────────────────────────────┘ │
│                                      │
│  [ Connect ]                         │
└─────────────────────────────────────┘
```

---

## 📍 Paso 5: Verificar variables de entorno

Después de conectar, verifica que las variables se crearon:

1. Ve a **Settings** → **Environment Variables**
2. Debes ver estas 3 variables:

| Variable | Descripción |
|----------|-------------|
| `KV_REST_API_URL` | URL de conexión a Redis |
| `KV_REST_API_TOKEN` | Token de autenticación |
| `KV_REST_API_READ_ONLY_TOKEN` | Token de solo lectura |

**IMPORTANTE:** Verifica que estén disponibles para:
- ✅ Production
- ✅ Preview
- ✅ Development

```
Settings → Environment Variables

┌──────────────────────────────────────────────────┐
│ KV_REST_API_URL                                  │
│ https://xxx.upstash.io                           │
│ Production ✓  Preview ✓  Development ✓          │
├──────────────────────────────────────────────────┤
│ KV_REST_API_TOKEN                                │
│ ••••••••••••••••••••                             │
│ Production ✓  Preview ✓  Development ✓          │
├──────────────────────────────────────────────────┤
│ KV_REST_API_READ_ONLY_TOKEN                      │
│ ••••••••••••••••••••                             │
│ Production ✓  Preview ✓  Development ✓          │
└──────────────────────────────────────────────────┘
```

---

## ✅ Listo para Deploy

Una vez completados estos pasos:

```bash
git add .
git commit -m "Vercel KV configured"
git push
```

Vercel automáticamente:
1. Detectará el push
2. Iniciará el build
3. Desplegará con las variables de entorno configuradas
4. Tu aplicación usará Redis para almacenamiento persistente

---

## 🔍 Verificar que funciona

### Ver datos en Redis:

1. Ve a **Storage** → Tu base de datos `ktrmnl2-storage`
2. Haz clic en **"Data Browser"**
3. Después de usar el admin, verás:
   - Clave: `layout` → Configuración de widgets
   - Clave: `data` → Datos del recordatorio

```
Data Browser

┌──────────────────────────────────────┐
│ Key: layout                          │
│ Type: JSON                           │
│ Value: { "widgets": [...] }          │
├──────────────────────────────────────┤
│ Key: data                            │
│ Type: JSON                           │
│ Value: { "reminder": "..." }         │
└──────────────────────────────────────┘
```

---

## 🆘 ¿Necesitas ayuda?

Si algo no funciona, revisa:
- ✅ La base de datos está **conectada** al proyecto KTRMNL2
- ✅ Las 3 variables de entorno existen
- ✅ Las variables están en **Production**
- ✅ Hiciste un nuevo deploy después de conectar

**Ver logs:**
- Vercel Dashboard → Deployments → Selecciona el último → Function Logs
- Busca: `✅ Vercel KV initialized`
