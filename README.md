# KTRMNL2 - Dashboard Híbrido (Tablet & TRMNL)

**KTRMNL2** es un servidor personalizado (BYOS - Bring Your Own Server) diseñado originalmente para dispositivos de tinta electrónica [TRMNL](https://usetrmnl.com/), pero evolucionado para funcionar también como un **Dashboard Inteligente para Tablets** y navegadores web.

Este proyecto permite reutilizar tablets antiguas o dispositivos móviles como pantallas de información "siempre encendidas", mostrando la hora, el clima local y frases motivacionales diarias.

## 🚀 Características Principales

### 📱 Modo Tablet / Navegador
- **Reloj en Tiempo Real:** Actualización segundo a segundo sin recargar la página.
- **Auto-Refresco Inteligente:** La página se recarga automáticamente cada 1 minuto para actualizar datos externos (clima, fecha).
- **Interfaz Adaptable:** Diseño limpio y legible, ideal para dejar en una mesa o pared.
- **Frases Diarias:** Muestra una frase de motivación diferente cada 24 horas.
- **Modos de Enfoque:**
    - **Modo Estudio:** Temporizador Pomodoro (25 min) con overlay visual.
    - **Modo Dormir:** Reloj atenuado sobre fondo negro para la noche.
- **Pantalla Completa:** Botón manual para activar el modo fullscreen.

### 📟 Modo TRMNL (E-Ink)
- **Generación de Imágenes:** Renderiza la vista HTML a una imagen PNG optimizada (800x480) usando Puppeteer.
- **Anti-Caching:** Headers HTTP configurados para asegurar que el dispositivo siempre reciba la imagen más reciente.
- **Bajo Consumo:** Lógica de servidor optimizada para servir contenido estático cuando se solicita.

### 🌤️ Integraciones
- **Clima en Tiempo Real:** Conexión con la API de [Open-Meteo](https://open-meteo.com/) para obtener temperatura y condiciones climáticas.
  - *Configurado actualmente para:* Barquisimeto, Lara, Venezuela.
- **Criptomonedas:**
    - **Precios:** Seguimiento en tiempo real de BTC, ETH y USDT vía [CoinGecko](https://www.coingecko.com/).
    - **Gráficas:** Widget visual con historial de precios de 7 días (Sparkline) usando Chart.js.
- **Sistema de Frases:** Base de datos local de frases inspiradoras que rotan diariamente.

## 🛠️ Tecnologías Utilizadas

- **Node.js:** Entorno de ejecución del servidor.
- **Express:** Framework web para manejar las rutas y la API.
- **EJS (Embedded JavaScript):** Motor de plantillas para generar el HTML dinámico.
- **Chart.js:** Librería para renderizar gráficas de criptomonedas en el cliente.
- **Puppeteer:** Librería para controlar Chrome/Chromium y generar capturas de pantalla (para el modo TRMNL).
- **CSS3 / HTML5:** Diseño y maquetación del dashboard.

## 📋 Requisitos Previos

- **Node.js** (v16 o superior recomendado).
- **NPM** (Gestor de paquetes de Node).
- Conexión a Internet (para obtener datos del clima).

## 🔧 Instalación

1.  **Clonar o descargar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd KTRMNL2
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar entorno (Opcional):**
    Puedes crear un archivo `.env` si necesitas cambiar el puerto (por defecto 3000).
    ```env
    PORT=3000
    ```

## ▶️ Ejecución

Para iniciar el servidor en modo desarrollo (con reinicio automático si usas nodemon):

```bash
npm run dev
```

O para producción:

```bash
npm start
```

El servidor iniciará en: `http://localhost:3000`

## 📖 Uso

### 1. En una Tablet / PC (Modo Interactivo)
Abre el navegador de tu tablet y navega a la IP de tu PC donde corre el servidor:
```
http://<TU-IP-LOCAL>:3000/dashboard
```
*Ejemplo: `http://192.168.1.50:3000/dashboard`*

### 2. En un Dispositivo TRMNL (Modo Imagen)
Configura tu dispositivo TRMNL para apuntar a la API de visualización:
```
http://<TU-IP-PUBLICO-O-TUNEL>:3000/api/display
```
Esto devolverá el JSON de configuración que instruye al dispositivo a descargar la imagen renderizada.

## ⚙️ Configuración Personalizada

### Cambiar Ubicación del Clima
Editar el archivo `src/server.js` y buscar la función `getWeatherData`. Modificar las variables `lat` y `lon`:

```javascript
// Coordenadas para tu ciudad
const lat = 10.0678; 
const lon = -69.3474;
```

### Modificar Frases
Editar el array `quotes` en la función `getMotivation` dentro de `src/server.js`.

## 📂 Estructura del Proyecto

```
KTRMNL2/
├── config/             # Archivos de configuración (layout, data)
├── public/             # Archivos estáticos
├── src/
│   ├── server.js       # Punto de entrada y lógica del servidor
│   └── renderer.js     # Lógica de Puppeteer para capturas
├── views/              # Plantillas EJS
│   ├── dashboard.ejs   # Vista principal
│   └── widgets/        # Componentes (reloj, clima, fecha)
├── package.json        # Dependencias y scripts
└── README.md           # Documentación
```

## ⚖️ Propósito y Aviso Legal

Este proyecto es una iniciativa independiente de código abierto y **no tiene ninguna intención de plagiar, competir ni menoscabar la tecnología original de TRMNL**. No promuevo ninguna actividad ilegal ni la elusión de sistemas propietarios.

Mi misión es puramente **ecológica y educativa**: buscamos ofrecer una solución de software para **reutilizar hardware antiguo** (tablets, móviles viejos) que ha quedado obsoleto para el uso diario, dándoles una segunda vida útil como dashboards informativos. Respetamos y admiramos la innovación del producto original y animamos a quienes puedan a adquirir el hardware oficial.

## 👤 Autor
Desarrollado por Kenner Cadenas.

