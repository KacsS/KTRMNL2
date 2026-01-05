# 🚀 Checklist de Deployment - KTRMNL2

## Pre-Deploy

- [ ] **Código actualizado en Git**
  ```bash
  git status
  git add .
  git commit -m "Descripción del cambio"
  ```

- [ ] **Vercel KV configurado**
  - [ ] Base de datos Redis creada en Vercel Dashboard
  - [ ] Redis conectado al proyecto KTRMNL2
  - [ ] Variables de entorno verificadas (KV_REST_API_URL, KV_REST_API_TOKEN)

- [ ] **Dependencias actualizadas**
  ```bash
  npm install
  ```

## Deploy

- [ ] **Push a GitHub**
  ```bash
  git push
  ```

- [ ] **Vercel auto-deploy**
  - Vercel detectará el push automáticamente
  - Espera a que termine el build (~2-3 minutos)

## Post-Deploy

- [ ] **Verificar deployment**
  - [ ] Abrir URL de producción: `https://tu-proyecto.vercel.app`
  - [ ] Verificar que el dashboard carga correctamente
  - [ ] Verificar que los widgets se muestran

- [ ] **Probar funcionalidad del admin**
  - [ ] Abrir `/admin`
  - [ ] Agregar un widget nuevo
  - [ ] Guardar configuración
  - [ ] Recargar página y verificar que persiste

- [ ] **Verificar persistencia de datos**
  - [ ] Esperar 30 minutos O hacer un nuevo deploy
  - [ ] Verificar que los widgets siguen ahí
  - [ ] Si persisten → ✅ Vercel KV funciona correctamente

- [ ] **Revisar logs en Vercel**
  - [ ] Vercel Dashboard → Deployments → Ver logs
  - [ ] Buscar: `✅ Vercel KV initialized`
  - [ ] Buscar: `📤 KV SET layout: success`
  - [ ] No debe haber errores de KV

## Troubleshooting

### Si los datos no persisten:

1. **Verificar variables de entorno**
   - Vercel Dashboard → Settings → Environment Variables
   - Deben existir: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

2. **Verificar conexión de Redis**
   - Vercel Dashboard → Storage
   - Debe aparecer tu base de datos conectada al proyecto

3. **Ver datos en Redis**
   - Vercel Dashboard → Storage → Data Browser
   - Deben aparecer las claves `layout` y `data`

4. **Revisar logs**
   - Buscar mensajes de error relacionados con KV
   - Si ves `⚠️ Vercel KV not available`, las variables no están configuradas

### Si el build falla:

1. **Verificar package.json**
   - Debe incluir `@vercel/kv` en dependencies

2. **Verificar logs de build**
   - Vercel Dashboard → Deployments → Build Logs
   - Buscar errores de instalación de dependencias

## Comandos útiles

```bash
# Ver status de Git
git status

# Agregar todos los cambios
git add .

# Commit con mensaje
git commit -m "Mensaje descriptivo"

# Push a GitHub (trigger deploy)
git push

# Ver logs en tiempo real (si tienes Vercel CLI)
vercel logs
```

## URLs importantes

- **Dashboard de Vercel:** https://vercel.com/dashboard
- **Upstash Console:** https://console.upstash.com/
- **Tu proyecto (producción):** https://tu-proyecto.vercel.app
- **Admin panel:** https://tu-proyecto.vercel.app/admin
- **Dashboard:** https://tu-proyecto.vercel.app/dashboard

---

**Última actualización:** 2026-01-05
