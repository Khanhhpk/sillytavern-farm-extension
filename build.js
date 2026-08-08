import esbuild from 'esbuild';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env if it exists
if (fs.existsSync('.env')) {
    dotenv.config();
}

// Prepare env vars for define (must be stringified)
// Obfuscate with base64 so they don't appear in plaintext in the built JS
const define = {
    'process.env.METERED_API_KEY': JSON.stringify(Buffer.from(process.env.METERED_API_KEY || '').toString('base64')),
    'process.env.METERED_APP_NAME': JSON.stringify(Buffer.from(process.env.METERED_APP_NAME || '').toString('base64'))
};

esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'index.js',
    format: 'esm',
    define: define,
}).then(() => {
    console.log('Build completed!');
}).catch(() => process.exit(1));
