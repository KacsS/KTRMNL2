const isVercel = process.env.VERCEL === '1';

let puppeteer;
let chromium;

if (isVercel) {
    puppeteer = require('puppeteer-core');
    chromium = require('@sparticuz/chromium');
} else {
    puppeteer = require('puppeteer');
}

async function takeScreenshot(url) {
    let browser;
    try {
        if (isVercel) {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless
            });
        } else {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

        const page = await browser.newPage();

        // Configurar viewport al tamaño exacto de TRMNL (800x480)
        await page.setViewport({
            width: 800,
            height: 480,
            deviceScaleFactor: 1
        });

        // Esperar a que no haya más de 2 conexiones de red activas (asegura carga de Chart.js)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Tomar screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            encoding: 'binary'
        });

        return screenshot;
    } catch (error) {
        console.error('Error in takeScreenshot:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { takeScreenshot };
