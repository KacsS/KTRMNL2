
try {
    const kvModule = require('@vercel/kv');
    console.log('Type of module:', typeof kvModule);
    console.log('Keys of module:', Object.keys(kvModule));
    console.log('Is kv.set a function?', typeof kvModule.set === 'function');
    console.log('Is kv.kv.set a function?', kvModule.kv && typeof kvModule.kv.set === 'function');
} catch (e) {
    console.error(e);
}
