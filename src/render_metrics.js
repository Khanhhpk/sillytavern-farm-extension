import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY ? atob(process.env.FIREBASE_API_KEY) : '',
    authDomain: process.env.FIREBASE_PROJECT_ID ? atob(process.env.FIREBASE_PROJECT_ID) + ".firebaseapp.com" : '',
    projectId: process.env.FIREBASE_PROJECT_ID ? atob(process.env.FIREBASE_PROJECT_ID) : '',
    storageBucket: process.env.FIREBASE_PROJECT_ID ? atob(process.env.FIREBASE_PROJECT_ID) + ".appspot.com" : '',
    messagingSenderId: process.env.FIREBASE_SENDER_ID ? atob(process.env.FIREBASE_SENDER_ID) : '',
    appId: process.env.FIREBASE_APP_ID ? atob(process.env.FIREBASE_APP_ID) : ''
};

let db;
if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
}

let players = [];

async function loadMetrics() {
    if (!db) {
        alert("Firebase config missing!");
        return;
    }
    const tbody = document.getElementById('metrics-body');
    tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
    
    try {
        const snapshot = await getDocs(collection(db, 'game_metrics'));
        players = [];
        snapshot.forEach(docSnap => {
            players.push(docSnap.data());
        });
        
        // Sort by net worth descending
        players.sort((a, b) => (b.totalNetWorth || 0) - (a.totalNetWorth || 0));
        renderTable();
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
    }
}

function renderTable() {
    const tbody = document.getElementById('metrics-body');
    tbody.innerHTML = '';
    
    if (players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No data found</td></tr>';
        return;
    }

    players.forEach(p => {
        const tr = document.createElement('tr');
        const d = new Date(p.lastSeen || 0);
        const timeStr = d.toLocaleString();
        const nw = Math.floor(p.totalNetWorth || 0).toLocaleString();
        const coins = Math.floor(p.coins || 0).toLocaleString();
        const bank = Math.floor(p.bankDeposit || 0).toLocaleString();
        const stockB = Math.floor(p.stockBalance || 0).toLocaleString();
        const stockP = Math.floor(p.stockPortfolio || 0).toLocaleString();
        
        tr.innerHTML = `
            <td>${p.playerName || 'Unknown'} <br><small style="color:#666">${p.playerId}</small></td>
            <td style="color:var(--text-accent); font-weight:bold;">${nw} cp</td>
            <td>${coins}</td>
            <td>${bank}</td>
            <td>Bal: ${stockB}<br>Port: ${stockP}</td>
            <td>${timeStr}</td>
            <td><button class="cmd-btn" data-id="${p.playerId}">Action</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.cmd-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = /** @type {Element} */ (e.target).getAttribute('data-id');
            openActionModal(id);
        });
    });
}

function openActionModal(playerId) {
    const p = players.find(x => x.playerId === playerId);
    if (!p) return;
    
    document.getElementById('modal-title').innerText = 'Actions for: ' + (p.playerName || 'Unknown');
    document.getElementById('action-modal').style.display = 'block';
    
    const submitBtn = /** @type {HTMLButtonElement} */ (document.getElementById('submit-action'));
    submitBtn.onclick = async () => {
        const actionType = /** @type {HTMLSelectElement} */ (document.getElementById('action-type')).value;
        const amount = parseInt(/** @type {HTMLInputElement} */ (document.getElementById('action-amount')).value) || 0;
        const message = /** @type {HTMLInputElement} */ (document.getElementById('action-msg')).value;
        
        if (!actionType && !message) {
            alert('Must provide an action or a message');
            return;
        }

        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        try {
            const docRef = doc(db, 'game_metrics', playerId);
            const d = await getDoc(docRef);
            let pending = [];
            if (d.exists() && d.data().pendingCommands) {
                pending = d.data().pendingCommands;
            }
            
            const newCmd = {};
            if (actionType !== 'none') {
                newCmd.type = actionType;
                newCmd.amount = amount;
            }
            if (message) {
                newCmd.message = message;
            }
            
            pending.push(newCmd);
            await setDoc(docRef, { pendingCommands: pending }, { merge: true });
            
            alert('Command queued successfully!');
            document.getElementById('action-modal').style.display = 'none';
        } catch (e) {
            console.error(e);
            alert('Error sending command');
        }
        
        submitBtn.innerText = 'Send Command';
        submitBtn.disabled = false;
    };
}

document.getElementById('close-modal').onclick = () => {
    document.getElementById('action-modal').style.display = 'none';
};

document.getElementById('refresh-btn').onclick = loadMetrics;

// Initialize
loadMetrics();
