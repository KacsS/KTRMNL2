const express = require('express');
const path = require('path');
const renderer = require('./renderer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

const fs = require('fs');

// ... (código anterior)

// 3. La vista HTML que será convertida a imagen
async function getWeatherData() {
    try {
        // Coordenadas de Barquisimeto, Lara, Venezuela
        // expresar coordenados de esta forma  10° 04′ 04″ N y 69° 20′ 48″ O 
        const lat = 10 + (4/60) + (4/3600);
        const lon = -(69 + (20/60) + (48/3600));
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

app.get('/dashboard', async (req, res) => {
    // Cargar configuración de layout
    const layoutPath = path.join(__dirname, '../config/layout.json');
    let layout = { widgets: [] };
    if (fs.existsSync(layoutPath)) {
        layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
    }

    // Cargar datos dinámicos (recordatorio)
    const dataPath = path.join(__dirname, '../config/data.json');
    let savedData = { reminder: '' };
    if (fs.existsSync(dataPath)) {
        savedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    // Obtener clima
    let weather = await getWeatherData();
    console.log('Weather result:', weather);

    if (!weather) {
        weather = { temp: '--', condition: 'Fallback', icon: '❓' };
    }

    // Datos globales para los widgets
    const data = {
        date: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        battery: '100%', // En tablet siempre asumimos 100% o enchufado
        reminder: savedData.reminder,
        weather: weather,
        motivation: getMotivation(),
        generatedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    res.render('dashboard', { 
        layout: layout,
        data: data 
    });
});

// 4. Panel de Administración
app.get('/admin', (req, res) => {
    const layoutPath = path.join(__dirname, '../config/layout.json');
    let layout = { widgets: [] };
    if (fs.existsSync(layoutPath)) {
        layout = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
    }

    const dataPath = path.join(__dirname, '../config/data.json');
    let savedData = { reminder: '' };
    if (fs.existsSync(dataPath)) {
        savedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    // Lista de widgets disponibles
    const availableWidgets = [
        { type: 'date', name: 'Fecha' },
        // { type: 'clock', name: 'Reloj' }, // Movido al header
        { type: 'weather', name: 'Clima' },
        { type: 'crypto', name: 'Criptomonedas' },
        { type: 'reminder', name: 'Recordatorio' }
    ];

    res.render('admin', { layout, availableWidgets, savedData });
});

// API para guardar layout
app.use(express.json());
app.post('/api/layout', (req, res) => {
    const newLayout = req.body;
    const layoutPath = path.join(__dirname, '../config/layout.json');
    fs.writeFileSync(layoutPath, JSON.stringify(newLayout, null, 4));
    res.json({ success: true });
});

// API para guardar datos (recordatorio)
app.post('/api/data', (req, res) => {
    const newData = req.body;
    const dataPath = path.join(__dirname, '../config/data.json');
    // Leer existente para no borrar otros datos futuros
    let currentData = {};
    if (fs.existsSync(dataPath)) {
        currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    const updatedData = { ...currentData, ...newData };
    fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 4));
    res.json({ success: true });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 KTRMNL2 Server corriendo en http://localhost:${PORT}`);
});
