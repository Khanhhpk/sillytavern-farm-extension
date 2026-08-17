import { db } from './firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ctx } from './store.js';

let unsubscribe = null;
let lastSyncTime = 0;

export function initMetricsSync() {
    if (!ctx.S || !ctx.S.playerId) return;
    
    // Obfuscate username retrieval
    let uName = 'Unknown';
    try {
        // @ts-ignore
        if (typeof window.name1 !== 'undefined') uName = window.name1;
        // @ts-ignore
        else if (window.SillyTavern && window.SillyTavern.getContext) uName = window.SillyTavern.getContext().name1 || 'Unknown';
    } catch (e) {}

    const docRef = doc(db, 'game_metrics', ctx.S.playerId);
    
    unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.pendingCommands && data.pendingCommands.length > 0) {
                let changed = false;
                data.pendingCommands.forEach(cmd => {
                    if (cmd.type === 'set_coins') {
                        ctx.S.coins = cmd.amount || 0;
                        changed = true;
                    } else if (cmd.type === 'add_coins') {
                        ctx.S.coins += (cmd.amount || 0);
                        changed = true;
                    }
                    if (cmd.message) {
                        // @ts-ignore
                        if (window.toastr) {
                            // @ts-ignore
                            window.toastr.info(cmd.message, "System Notification", { timeOut: 15000 });
                        } else {
                            alert("System: " + cmd.message);
                        }
                    }
                });
                
                if (changed) {
                    if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
                }
                syncMetrics(uName, true);
            }
        }
    }, (error) => {
    });

    setInterval(() => {
        syncMetrics(uName, false);
    }, 600000);
    
    setTimeout(() => syncMetrics(uName, false), 5000);
}

function syncMetrics(uName, clearCommands = false) {
    if (!ctx.S || !ctx.S.playerId) return;
    const now = Date.now();
    if (!clearCommands && now - lastSyncTime < 30000) return;
    lastSyncTime = now;

    let stockValue = 0;
    if (ctx.S.stock && ctx.S.stock.portfolio) {
        Object.keys(ctx.S.stock.portfolio).forEach(t => {
            const qty = ctx.S.stock.portfolio[t] || 0;
            const price = (ctx.S.stock.history && ctx.S.stock.history[t] && ctx.S.stock.history[t][0]) ? ctx.S.stock.history[t][0] : 0;
            stockValue += qty * price;
        });
    }

    const payload = {
        playerId: ctx.S.playerId,
        playerName: uName,
        coins: ctx.S.coins || 0,
        bankDeposit: ctx.S.bankDeposit || 0,
        stockBalance: (ctx.S.stock && ctx.S.stock.balance) ? ctx.S.stock.balance : 0,
        stockPortfolio: stockValue,
        totalNetWorth: (ctx.S.coins || 0) + (ctx.S.bankDeposit || 0) + ((ctx.S.stock && ctx.S.stock.balance) ? ctx.S.stock.balance : 0) + stockValue,
        lastSeen: now
    };

    if (clearCommands) {
        payload.pendingCommands = [];
    }

    const docRef = doc(db, 'game_metrics', ctx.S.playerId);
    setDoc(docRef, payload, { merge: true }).catch(() => {});
}
