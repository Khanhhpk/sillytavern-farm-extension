import { db } from './firebase.js';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ctx } from './store.js';

let unsubscribeGlobal = null;
let unsubscribePersonal = null;
let syncInterval = null;
let lastSyncTime = 0;
let uName = 'Unknown';
let isAwake = false;

export function initMetricsSync() {
    if (!ctx.S || !ctx.S.playerId) return;
    
    try {
        if (ctx.S && ctx.S.username) {
            uName = ctx.S.username;
        } else {
            // @ts-ignore
            if (typeof window.name1 !== 'undefined') uName = window.name1;
            // @ts-ignore
            else if (window.SillyTavern && window.SillyTavern.getContext) uName = window.SillyTavern.getContext().name1 || 'Unknown';
        }
    } catch (e) {}

    const globalRef = doc(db, 'game_metrics_config', 'global');
    
    // Listen to global kill-switch
    unsubscribeGlobal = onSnapshot(globalRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.active === true) {
                if (!isAwake) wakeUp();
            } else {
                if (isAwake) goToSleep();
            }
        } else {
            // Document doesn't exist, assume sleep
            if (isAwake) goToSleep();
        }
    }, (error) => {
        // Silently ignore permission/network errors
    });
}

function wakeUp() {
    isAwake = true;
    
    // 1. Immediately sync stats
    syncMetrics(true);
    
    // 2. Start periodic sync (every 60 seconds during survey)
    syncInterval = setInterval(() => {
        syncMetrics(false);
    }, 60000);
    
    // 3. Open personal channel for commands
    const docRef = doc(db, 'game_metrics', ctx.S.playerId);
    unsubscribePersonal = onSnapshot(docRef, (docSnap) => {
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
                syncMetrics(true); // Force sync and clear commands
            }
        }
    }, (error) => {});
}

function goToSleep() {
    isAwake = false;
    
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    
    if (unsubscribePersonal) {
        unsubscribePersonal();
        unsubscribePersonal = null;
    }
}

function syncMetrics(clearCommands = false) {
    if (!ctx.S || !ctx.S.playerId || !isAwake) return;
    const now = Date.now();
    if (!clearCommands && now - lastSyncTime < 10000) return; // Rate limit
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
