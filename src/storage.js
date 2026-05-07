const fs = require('fs');
const path = require('path');

// Detectar si estamos en Vercel
const isVercel = process.env.VERCEL === '1';
let kv = null;

// Intentar cargar Vercel KV solo si estamos en Vercel
if (isVercel) {
    try {
        const { kv: vercelKv } = require('@vercel/kv');
        kv = vercelKv;
        console.log('✅ Vercel KV initialized');
    } catch (error) {
        console.warn('⚠️ Vercel KV not available, falling back to file storage');
    }
}

// Directorio para almacenamiento local
const localConfigDir = path.join(__dirname, '../config');

// Asegurar que el directorio local exista
if (!isVercel && !fs.existsSync(localConfigDir)) {
    fs.mkdirSync(localConfigDir, { recursive: true });
}

/**
 * Obtener datos del almacenamiento
 * @param {string} key - Clave del dato ('layout' o 'data')
 * @returns {Promise<object|null>}
 */
async function get(key) {
    // Si estamos en Vercel y KV está disponible
    if (isVercel && kv) {
        try {
            const data = await kv.get(key);
            console.log(`📥 KV GET ${key}:`, data ? 'found' : 'not found');
            return data;
        } catch (error) {
            console.error(`❌ KV GET error for ${key}:`, error);
            return null;
        }
    }

    // Fallback a archivos locales
    const filePath = path.join(localConfigDir, `${key}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`❌ File read error for ${key}:`, error);
            return null;
        }
    }

    return null;
}

/**
 * Guardar datos en el almacenamiento
 * @param {string} key - Clave del dato ('layout' o 'data')
 * @param {object} value - Valor a guardar
 * @returns {Promise<boolean>}
 */
async function set(key, value) {
    // Si estamos en Vercel y KV está disponible
    if (isVercel && kv) {
        try {
            await kv.set(key, value);
            console.log(`📤 KV SET ${key}: success`);
            return true;
        } catch (error) {
            console.error(`❌ KV SET error for ${key}:`, error);
            return false;
        }
    }

    // Fallback a archivos locales (Solo si NO estamos en Vercel)
    if (isVercel) {
        console.warn(`⚠️ Intento de guardado en Vercel sin KV configurado para la clave: ${key}`);
        return false;
    }

    const filePath = path.join(localConfigDir, `${key}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(value, null, 4));
        console.log(`💾 File saved: ${key}.json`);
        return true;
    } catch (error) {
        console.error(`❌ File write error for ${key}:`, error);
        return false;
    }
}

/**
 * Inicializar datos por defecto si no existen
 */
async function initializeDefaults() {
    // En Vercel, si no hay KV, no podemos inicializar nada persistente
    if (isVercel && !kv) {
        console.warn('⚠️ Vercel KV no configurado. Saltando inicialización de valores por defecto.');
        return;
    }

    // Verificar y crear layout por defecto
    const existingLayout = await get('layout');
    if (!existingLayout) {
        const defaultLayout = {
            widgets: [
                { type: 'date', id: `widget-${Date.now()}`, x: 0, y: 0, w: 6, h: 2 },
                { type: 'weather', id: `widget-${Date.now() + 1}`, x: 6, y: 0, w: 6, h: 2 },
                { type: 'crypto', id: `widget-${Date.now() + 2}`, x: 0, y: 2, w: 12, h: 4 },
                { type: 'reminder', id: `widget-${Date.now() + 3}`, x: 0, y: 6, w: 12, h: 2 }
            ]
        };
        await set('layout', defaultLayout);
        console.log('🎨 Default layout created');
    }

    // Verificar y crear data por defecto
    const existingData = await get('data');
    if (!existingData) {
        const defaultData = {
            reminder: "¡Bienvenido a KTRMNL2! Puedes cambiar este recordatorio en el panel de administración."
        };
        await set('data', defaultData);
        console.log('📝 Default data created');
    }
}

module.exports = {
    get,
    set,
    initializeDefaults,
    isVercel
};
