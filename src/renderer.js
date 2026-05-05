const isVercel = process.env.VERCEL === '1';

let puppeteer;
let chromium;

if (isVercel) {
    puppeteer = require('puppeteer-core');
    chromium = require('@sparticuz/chromium');
} else {
    puppeteer = require('puppeteer');
}

let browser;

async function getBrowser() {
    if (!browser) {
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

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Tomar screenshot
    const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'binary'
    });

    await page.close();
    return screenshot;
}

module.exports = { takeScreenshot };
