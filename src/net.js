export async function buildPeerConfigAsync() {
    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    try {
        const apiKey = process.env.METERED_API_KEY ? atob(process.env.METERED_API_KEY) : '';
        const appName = process.env.METERED_APP_NAME ? atob(process.env.METERED_APP_NAME) : '';
        
        if (apiKey && appName) {
            const resp = await fetch(`https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`);
            if (resp.ok) {
                const servers = await resp.json();
                iceServers.push(...servers);
                return { config: { iceServers } };
            }
        }
        
        const secret = 'openrelayprojectsecret';
        const expiry = Math.floor(Date.now() / 1000) + 24 * 3600;
        const username = String(expiry);
        const enc = new TextEncoder();
        const keyMat = await crypto.subtle.importKey(
            'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
        );
        const sig = await crypto.subtle.sign('HMAC', keyMat, enc.encode(username));
        const credential = btoa(String.fromCharCode(...new Uint8Array(sig)));
        
        iceServers.push(
            { urls: 'stun:openrelay.metered.ca:80' },
            { urls: 'turn:openrelay.metered.ca:80', username, credential },
            { urls: 'turn:openrelay.metered.ca:443', username, credential },
            { urls: 'turns:openrelay.metered.ca:443', username, credential }
        );
    } catch (err) {
        console.warn('Failed to generate OpenRelay credentials:', err);
    }
    return { config: { iceServers } };
}
