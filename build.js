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
    'process.env.METERED_APP_NAME': JSON.stringify(Buffer.from(process.env.METERED_APP_NAME || '').toString('base64')),
    'process.env.FIREBASE_API_KEY': JSON.stringify(Buffer.from(process.env.FIREBASE_API_KEY || '').toString('base64')),
    'process.env.FIREBASE_PROJECT_ID': JSON.stringify(Buffer.from(process.env.FIREBASE_PROJECT_ID || '').toString('base64')),
    'process.env.FIREBASE_SENDER_ID': JSON.stringify(Buffer.from(process.env.FIREBASE_SENDER_ID || '').toString('base64')),
    'process.env.FIREBASE_APP_ID': JSON.stringify(Buffer.from(process.env.FIREBASE_APP_ID || '').toString('base64'))
};

esbuild.build({
    entryPoints: ['src/main.js'],
    bundle: true,
    outfile: 'index.js',
    format: 'esm',
    define: define,
}).then(() => {
    console.log('Main build completed!');
    
    // Build admin metrics bundle
    esbuild.build({
        entryPoints: ['src/render_metrics.js'],
        bundle: true,
        outfile: 'metrics_bundle.js',
        format: 'iife',
        define: define,
    }).then(() => {
        console.log('Metrics bundle completed!');
    }).catch(() => process.exit(1));
    
}).catch(() => process.exit(1));
