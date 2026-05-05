const express = require('express');
const path = require('path');
const renderer = require('./renderer');
const storage = require('./storage');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const REMOTE_WIDGETS_ONLY = process.env.REMOTE_WIDGETS_ONLY === '1';
const WIDGET_LAYOUT_API_URL = process.env.WIDGET_LAYOUT_API_URL || '';
const REMINDER_API_URL = process.env.REMINDER_API_URL || 'https://api.adviceslip.com/advice';
const allowedWidgetTypes = new Set(['date', 'weather', 'crypto', 'crypto_chart', 'reminder']);

// Permite obtener protocolo/host correctos detras de proxies (Vercel, Nginx, etc.)
app.set('trust proxy', true);

// Inicializar almacenamiento con valores por defecto
if (!REMOTE_WIDGETS_ONLY) {
    storage.initializeDefaults().then(() => {
        console.log('✅ Storage initialized');
    }).catch(err => {
        console.error('❌ Storage initialization error:', err);
    });
} else {
    console.log('🌐 REMOTE_WIDGETS_ONLY activo: storage local/KV deshabilitado');
}

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para logs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Redirección de la raíz a /dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// 1. Endpoint principal que llama el dispositivo TRMNL
app.get('/api/display', async (req, res) => {
    try {
        // Detectar URL base automáticamente
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Lógica de refresco (ej. 1 minuto)
        const refreshRate = 60;

        res.json({
            status: 0,
            image_url: `${baseUrl}/api/render`, // URL donde generamos la imagen
            filename: `screen_${Date.now()}`,
            refresh_rate: refreshRate,
            reset_firmware: false,
            update_firmware: false
        });
    } catch (error) {
        console.error('Error en /api/display:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Endpoint que genera la imagen (Puppeteer)
app.get('/api/render', async (req, res) => {
    try {
        const protocol = req.protocol;
        const host = req.get('host');
        // Añadimos timestamp para evitar cache interno de Puppeteer/Chrome
        const dashboardUrl = `${protocol}://${host}/dashboard?t=${Date.now()}`;

        console.log('Generando imagen desde:', dashboardUrl);
        const imageBuffer = await renderer.takeScreenshot(dashboardUrl);

        // Headers anti-cache para que el dispositivo siempre baje la nueva imagen
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Content-Type', 'image/png');

        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generando imagen:', error);
        res.status(500).send('Error generating image');
    }
});

// 3. La vista HTML que será convertida a imagen
async function getWeatherData() {
    try {
        // Coordenadas de Barquisimeto, Lara, Venezuela
        // expresar coordenados de esta forma  10° 04′ 04″ N y 69° 20′ 48″ O 
        const lat = 10 + (4 / 60) + (4 / 3600);
        const lon = -(69 + (20 / 60) + (48 / 3600));
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');
        const data = await response.json();

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;

        // Mapeo simple de códigos WMO a Español/Iconos
        let condition = 'Despejado';
        let icon = '☀️';

        if (code === 0) { condition = 'Despejado'; icon = '☀️'; }
        else if (code >= 1 && code <= 3) { condition = 'Parcialmente Nublado'; icon = '⛅'; }
        else if (code >= 45 && code <= 48) { condition = 'Niebla'; icon = '🌫️'; }
        else if (code >= 51 && code <= 55) { condition = 'Llovizna'; icon = '🌦️'; }
        else if (code >= 61 && code <= 65) { condition = 'Lluvia'; icon = '🌧️'; }
        else if (code >= 80 && code <= 82) { condition = 'Chubascos'; icon = '☔'; }
        else if (code >= 95) { condition = 'Tormenta'; icon = '⚡'; }

        return { temp, condition, icon };
    } catch (error) {
        console.error('Error obteniendo clima:', error);
        return { temp: '--', condition: 'Sin datos', icon: '❓' };
    }
}

function getMotivation() {
    const quotes = [
        "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
        "No te detengas hasta que te sientas orgulloso.",
        "Cada día es una nueva oportunidad para cambiar tu vida.",
        "Tu único límite es tu mente.",
        "Hazlo con pasión o no lo hagas.",
        "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.",
        "No sueñes tu vida, vive tus sueños.",
        "La disciplina es el puente entre metas y logros.",
        "Cree en ti mismo y todo será posible.",
        "El fracaso es solo la oportunidad de comenzar de nuevo con más inteligencia.",
        "No cuentes los días, haz que los días cuenten.",
        "La actitud es una pequeña cosa que hace una gran diferencia.",
        "Si puedes soñarlo, puedes hacerlo.",
        "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el valor para continuar.",
        "La persistencia puede cambiar el fracaso en un logro extraordinario."
    ];

    // Calcular el día del año para seleccionar una frase fija por 24 horas
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return quotes[dayOfYear % quotes.length];
}

async function getCryptoData() {
    try {
        // Obtener datos de Bitcoin, Ethereum y Tether con sparkline (gráfica simple 7 días)
        const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether&order=market_cap_desc&per_page=3&page=1&sparkline=true&price_change_percentage=24h';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Crypto API error');
        const data = await response.json();

        // Formatear datos
        return data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change: coin.price_change_percentage_24h,
            sparkline: coin.sparkline_in_7d.price
        }));
    } catch (error) {
        console.error('Error obteniendo crypto:', error);
        return null;
    }
}

function sanitizeLayout(layout) {
    const inputWidgets = Array.isArray(layout?.widgets) ? layout.widgets : [];

    const widgets = inputWidgets
        .filter(widget => widget && typeof widget === 'object')
        .filter(widget => typeof widget.type === 'string' && allowedWidgetTypes.has(widget.type))
        .slice(0, 4)
        .map(widget => ({
            id: typeof widget.id === 'string' ? widget.id : `w${Date.now()}`,
            type: widget.type,
            title: typeof widget.title === 'string' ? widget.title.slice(0, 40) : widget.type.toUpperCase()
        }));

    if (widgets.length > 0) {
        return { widgets };
    }

    return {
        widgets: [
            { id: 'w-date', type: 'date', title: 'FECHA' },
            { id: 'w-weather', type: 'weather', title: 'CLIMA' },
            { id: 'w-crypto', type: 'crypto', title: 'CRIPTOS' },
            { id: 'w-reminder', type: 'reminder', title: 'RECORDATORIO' }
        ]
    };
}

async function getRemoteLayout() {
    if (!WIDGET_LAYOUT_API_URL) {
        return sanitizeLayout(null);
    }

    try {
        const response = await fetch(WIDGET_LAYOUT_API_URL, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`Layout API error: ${response.status}`);
        const data = await response.json();
        return sanitizeLayout(data);
    } catch (error) {
        console.error('Error obteniendo layout remoto:', error);
        return sanitizeLayout(null);
    }
}

function parseReminderFromApi(payload) {
    if (!payload) return null;

    if (typeof payload.reminder === 'string' && payload.reminder.trim()) {
        return payload.reminder.trim();
    }
    if (typeof payload.quote === 'string' && payload.quote.trim()) {
        return payload.quote.trim();
    }
    if (payload.slip && typeof payload.slip.advice === 'string' && payload.slip.advice.trim()) {
        return payload.slip.advice.trim();
    }
    if (Array.isArray(payload) && payload[0] && typeof payload[0].q === 'string') {
        return payload[0].q.trim();
    }
    if (Array.isArray(payload) && payload[0] && typeof payload[0].quote === 'string') {
        return payload[0].quote.trim();
    }

    return null;
}

async function getRemoteReminder() {
    try {
        const response = await fetch(REMINDER_API_URL, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`Reminder API error: ${response.status}`);
        const payload = await response.json();
        const reminder = parseReminderFromApi(payload);
        return reminder || 'Sin recordatorios remotos disponibles';
    } catch (error) {
        console.error('Error obteniendo reminder remoto:', error);
        return 'Sin recordatorios remotos disponibles';
    }
}

// API Endpoints para actualizaciones dinámicas
app.get('/api/weather-data', async (req, res) => {
    const weather = await getWeatherData();
    res.json(weather);
});

app.get('/api/crypto-data', async (req, res) => {
    const crypto = await getCryptoData();
    res.json(crypto);
});

app.get('/api/reminder-data', async (req, res) => {
    if (REMOTE_WIDGETS_ONLY) {
        const reminder = await getRemoteReminder();
        return res.json({ reminder });
    }

    const savedData = await storage.get('data') || { reminder: '' };
    res.json({ reminder: savedData.reminder });
});

app.get('/dashboard', async (req, res) => {
    // Cargar configuración de layout
    const layout = REMOTE_WIDGETS_ONLY
        ? await getRemoteLayout()
        : (await storage.get('layout') || { widgets: [] });

    // Cargar datos dinámicos (recordatorio)
    const savedData = REMOTE_WIDGETS_ONLY
        ? { reminder: await getRemoteReminder() }
        : (await storage.get('data') || { reminder: '' });

    // Obtener clima
    let weather = await getWeatherData();
    console.log('Weather result:', weather);

    if (!weather) {
        weather = { temp: '--', condition: 'Fallback', icon: '❓' };
    }

    // Obtener Criptos
    let crypto = await getCryptoData();
    if (!crypto) {
        // Datos falsos de respaldo si falla la API
        crypto = [
            { symbol: 'BTC', price: 0, change: 0, sparkline: [] },
            { symbol: 'ETH', price: 0, change: 0, sparkline: [] },
            { symbol: 'USDT', price: 1, change: 0, sparkline: [] }
        ];
    }

    // Datos globales para los widgets
    const data = {
        date: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        battery: '100%', // En tablet siempre asumimos 100% o enchufado
        reminder: savedData.reminder,
        weather: weather,
        crypto: crypto,
        motivation: getMotivation(),
        generatedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    res.render('dashboard', {
        layout: layout,
        data: data
    });
});

// 4. Panel de Administración
app.get('/admin', async (req, res) => {
    if (REMOTE_WIDGETS_ONLY) {
        return res.status(403).send('Admin deshabilitado en modo REMOTE_WIDGETS_ONLY');
    }

    const layout = await storage.get('layout') || { widgets: [] };
    const savedData = await storage.get('data') || { reminder: '' };

    // Lista de widgets disponibles
    const availableWidgets = [
        { type: 'date', name: 'Fecha' },
        // { type: 'clock', name: 'Reloj' }, // Movido al header
        { type: 'weather', name: 'Clima' },
        { type: 'crypto', name: 'Criptomonedas' },
        { type: 'crypto_chart', name: 'Gráfica Cripto' },
        { type: 'reminder', name: 'Recordatorio' }
    ];

    res.render('admin', { layout, availableWidgets, savedData });
});

// API para guardar layout
app.use(express.json());
app.post('/api/layout', async (req, res) => {
    if (REMOTE_WIDGETS_ONLY) {
        return res.status(403).json({ success: false, error: 'Layout API disabled in REMOTE_WIDGETS_ONLY mode' });
    }

    const inputWidgets = Array.isArray(req.body?.widgets) ? req.body.widgets : null;
    if (!inputWidgets) {
        return res.status(400).json({ success: false, error: 'Invalid layout payload' });
    }

    const newLayout = sanitizeLayout({ widgets: inputWidgets });
    const success = await storage.set('layout', newLayout);
    res.json({ success, widgets: newLayout.widgets.length });
});

// API para guardar datos (recordatorio)
app.post('/api/data', async (req, res) => {
    if (REMOTE_WIDGETS_ONLY) {
        return res.status(403).json({ success: false, error: 'Data API disabled in REMOTE_WIDGETS_ONLY mode' });
    }

    const newData = req.body;
    // Leer existente para no borrar otros datos futuros
    const currentData = await storage.get('data') || {};
    const updatedData = { ...currentData, ...newData };
    const success = await storage.set('data', updatedData);
    res.json({ success });
});

// Iniciar servidor solo en entorno local (no serverless)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 KTRMNL2 Server corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
