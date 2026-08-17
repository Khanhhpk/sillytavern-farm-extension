import { initializeApp } from 'firebase/app';
import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY ? atob(process.env.FIREBASE_API_KEY) : '',
    authDomain: process.env.FIREBASE_PROJECT_ID ? atob(process.env.FIREBASE_PROJECT_ID) + ".firebaseapp.com" : '',
    projectId: process.env.FIREBASE_PROJECT_ID ? atob(process.env.FIREBASE_PROJECT_ID) : '',
    storageBucket: process.env.FIREBASE_PROJECT_ID ? atob(process.env.FIREBASE_PROJECT_ID) + ".appspot.com" : '',
    messagingSenderId: process.env.FIREBASE_SENDER_ID ? atob(process.env.FIREBASE_SENDER_ID) : '',
    appId: process.env.FIREBASE_APP_ID ? atob(process.env.FIREBASE_APP_ID) : ''
};

let players = [];
let isGlobalActive = false;

async function toggleGlobalSwitch() {
    if (!db) return;
    const globalRef = doc(db, 'game_metrics_config', 'global');
    try {
        await setDoc(globalRef, { active: !isGlobalActive, timestamp: Date.now() }, { merge: true });
    } catch (e) {
        console.error(e);
        alert("Lỗi khi chuyển trạng thái Công tắc");
    }
}

function initGlobalListener() {
    if (!db) {
        alert("Firebase config missing!");
        return;
    }
    const globalRef = doc(db, 'game_metrics_config', 'global');
    
    onSnapshot(globalRef, (docSnap) => {
        const toggleBtn = document.getElementById('toggle-switch-btn');
        const statusText = document.getElementById('switch-status');
        
        if (docSnap.exists()) {
            isGlobalActive = docSnap.data().active;
        } else {
            isGlobalActive = false;
        }
        
        if (isGlobalActive) {
            statusText.innerText = "ONLINE (CÁC MÁY ĐANG HOẠT ĐỘNG)";
            statusText.style.color = "#39d353"; // Green
            toggleBtn.innerText = "Tắt Khảo Sát (Kill Switch)";
            toggleBtn.className = "btn-danger";
            loadMetrics();
        } else {
            statusText.innerText = "OFFLINE (CÁC MÁY ĐANG NGỦ ĐÔNG)";
            statusText.style.color = "#f85149"; // Red
            toggleBtn.innerText = "Bật Khảo Sát (Wake Up)";
            toggleBtn.className = "btn-success";
        }
    });
}

async function loadMetrics() {
    if (!db) return;
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
        const invest = Math.floor(p.bankInvestBalance || 0).toLocaleString();
        const stockB = Math.floor(p.stockBalance || 0).toLocaleString();
        const stockP = Math.floor(p.stockPortfolio || 0).toLocaleString();
        
        tr.innerHTML = `
            <td>${p.playerName || 'Unknown'} <br><small style="color:#666">${p.playerId}</small></td>
            <td style="color: #58a6ff; font-weight: bold;">${nw} cp</td>
            <td>${coins}</td>
            <td>
                TK: ${bank}<br>
                ĐT: ${invest}
            </td>
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
    
    const modal = document.getElementById('action-modal');
    document.getElementById('modal-title').innerText = 'Actions for: ' + (p.playerName || 'Unknown');
    modal.style.display = 'block';
    
    const actionBtn = /** @type {HTMLButtonElement} */ (document.getElementById('submit-action'));
    const docRef = doc(db, 'game_metrics', playerId);
    
    actionBtn.onclick = async () => {
        const actionType = /** @type {HTMLSelectElement} */ (document.getElementById('action-type')).value;
        const amount = parseInt(/** @type {HTMLInputElement} */ (document.getElementById('action-amount')).value) || 0;
        const message = /** @type {HTMLInputElement} */ (document.getElementById('action-msg')).value;

        if (actionType === 'delete_db') {
            if (!confirm(`Bạn có chắc muốn xóa bản ghi của ${p.playerName || 'người chơi'} khỏi Database? Lệnh này KHÔNG Ban tài khoản, chỉ dọn dẹp data rác/zombie trên server.`)) return;
            actionBtn.innerText = 'Đang xóa...';
            actionBtn.disabled = true;
            try {
                await deleteDoc(docRef);
                alert('Đã xóa DB record thành công!');
                modal.style.display = 'none';
                loadMetrics();
            } catch (e) {
                alert('Lỗi xóa DB!');
            }
            actionBtn.innerText = 'Gửi lệnh';
            actionBtn.disabled = false;
            return;
        }

        if (actionType === 'none' && !message) {
            alert('Vui lòng chọn loại lệnh hoặc nhập tin nhắn!');
            return;
        }

        actionBtn.innerText = 'Sending...';
        actionBtn.disabled = true;

        try {
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
        
        actionBtn.innerText = 'Send Command';
        actionBtn.disabled = false;
    };
}

document.getElementById('close-modal').onclick = () => {
    document.getElementById('action-modal').style.display = 'none';
};

document.getElementById('refresh-btn').onclick = loadMetrics;
document.getElementById('toggle-switch-btn').onclick = toggleGlobalSwitch;

document.getElementById('broadcast-btn').onclick = async () => {
    if (players.length === 0) return alert("Không có người chơi nào!");
    
    const actionType = /** @type {HTMLSelectElement} */ (document.getElementById('bc-action-type')).value;
    const amount = parseInt(/** @type {HTMLInputElement} */ (document.getElementById('bc-action-amount')).value) || 0;
    const message = /** @type {HTMLInputElement} */ (document.getElementById('bc-action-msg')).value;
    
    if (actionType === 'none' && !message) {
        alert('Cần nhập tin nhắn hoặc chọn loại tài sản để phát');
        return;
    }
    
    if (!confirm(`Bạn chuẩn bị phát sóng lệnh này tới TOÀN BỘ ${players.length} người chơi trong danh sách. Cân nhắc kỹ nhé. Đồng ý?`)) return;

    const btn = /** @type {HTMLButtonElement} */ (document.getElementById('broadcast-btn'));
    btn.innerText = 'Đang phát sóng...';
    btn.disabled = true;

    try {
        const promises = players.map(async (p) => {
            const docRef = doc(db, 'game_metrics', p.playerId);
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
            return setDoc(docRef, { pendingCommands: pending }, { merge: true });
        });
        
        await Promise.all(promises);
        alert('🎉 Phát sóng thành công tới ' + players.length + ' người chơi!');
        
        /** @type {HTMLInputElement} */ (document.getElementById('bc-action-msg')).value = '';
        /** @type {HTMLInputElement} */ (document.getElementById('bc-action-amount')).value = '';
    } catch (e) {
        console.error(e);
        alert('Lỗi khi phát sóng');
    }
    
    btn.innerText = '🚀 PHÁT SÓNG TOÀN SERVER';
    btn.disabled = false;
};

// Initialize
initGlobalListener();
