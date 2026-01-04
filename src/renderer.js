const puppeteer = require('puppeteer');

let browser;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browser;
}

async function takeScreenshot(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Configurar viewport al tamaño exacto de TRMNL (800x480)
    await page.setViewport({
        width: 800,
        height: 480,
        deviceScaleFactor: 1
    });

    await page.goto(url, { waitUntil: 'networkidle0' });

    // Tomar screenshot
    const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'binary'
    });

    await page.close();
    return screenshot;
}

module.exports = { takeScreenshot };
