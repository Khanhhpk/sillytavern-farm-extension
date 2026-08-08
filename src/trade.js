import { ctx } from './store.js';
import * as All from './all.js';
import { CROPS } from './data.js';
import { Peer } from 'peerjs';

let peer = null;
let conn = null;
let myItems = {}; 
let theirItems = {};
let myLock = false;
let theirLock = false;
let isConnected = false;

function getItemName(id) {
    if (id === 'coins') return 'Tiền xu';
    if (CROPS && CROPS[id]) return CROPS[id].name;
    if (id === 'norm') return 'Vé Thường';
    if (id === 'spec') return 'Vé Đặc Biệt';
    if (id === 'super') return 'Vé Siêu Cấp';
    if (id === 'prism') return 'Mảnh Lăng Kính';
    if (id === 'star') return 'Mảnh Sao';
    if (id === 'compost') return 'Phân Hữu Cơ';
    if (id === 'shiny') return 'Phân Bón Bạc';
    return id;
}

function getItemIcon(id) {
    if (id === 'coins') return All.spriteSVG('coin', 20);
    if (CROPS && CROPS[id]) return All.spriteSVG(id, 20);
    if (id === 'norm' || id === 'spec' || id === 'super') return All.spriteSVG('tk_' + id, 20);
    if (id === 'prism' || id === 'star') return All.spriteSVG('shard_' + id, 20);
    if (id === 'compost' || id === 'shiny') return All.spriteSVG('fert_' + id, 20);
    return '';
}

export function openTradeModal() {
    document.getElementById('trade-win').classList.add('open');
    resetTradeState();
    renderTradeMenu();
}

export function closeTradeModal() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    conn = null;
    document.getElementById('trade-win').classList.remove('open');
    uiCloseAddItem();
    resetTradeState();
}

function resetTradeState() {
    myItems = {};
    theirItems = {};
    myLock = false;
    theirLock = false;
    isConnected = false;
}

function renderTradeMenu() {
    const body = document.getElementById('trade-body');
    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">Kết nối WebRTC P2P</div>
            <div class="buy" id="btn-trade-host" style="padding: 10px; text-align:center;">Tạo phòng (Host)</div>
            <div style="display:flex; gap: 8px;">
                <input type="text" id="inp-trade-code" class="inp" placeholder="Nhập mã phòng..." style="flex:1;">
                <div class="buy" id="btn-trade-join" style="padding: 10px;">Tham gia</div>
            </div>
            <div id="trade-status" style="font-size: 12px; color: #d32f2f; font-weight: bold; margin-top: 10px;"></div>
        </div>
    `;

    document.getElementById('btn-trade-host').onclick = hostRoom;
    document.getElementById('btn-trade-join').onclick = joinRoom;
}

function updateStatus(msg, color = '#7a5c38') {
    const el = document.getElementById('trade-status');
    if (el) {
        el.innerText = msg;
        el.style.color = color;
    }
}

function hostRoom() {
    updateStatus('Đang tạo phòng...', '#7a5c38');
    const roomId = 'farm-' + Math.random().toString(36).substr(2, 6);
    
    peer = new Peer(roomId);
    peer.on('open', (id) => {
        updateStatus(`Phòng đã tạo! Mã của bạn: ${id}. Hãy gửi mã này cho đối tác.`, '#388e3c');
        const body = document.getElementById('trade-body');
        body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
                <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">Đang chờ đối tác kết nối...</div>
                <div style="font-size: 20px; font-weight: bold; color: #e91e63; user-select: all; background: #fce4ec; padding: 10px; border-radius: 8px; border: 2px dashed #f06292;">${id}</div>
                <div class="buy plain" onclick="All.closeTradeModal()" style="padding: 8px; margin-top: 20px; text-align:center;">Huỷ</div>
            </div>
        `;
    });

    peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
    });

    peer.on('error', (err) => {
        updateStatus('Lỗi: ' + err.type, '#d32f2f');
    });
}

function joinRoom() {
    // @ts-ignore
    const code = document.getElementById('inp-trade-code').value.trim();
    if (!code) return updateStatus('Vui lòng nhập mã phòng!', '#d32f2f');
    
    updateStatus('Đang kết nối...', '#7a5c38');
    peer = new Peer();
    
    peer.on('open', () => {
        conn = peer.connect(code, { reliable: true });
        conn.on('open', () => {
            setupConnection();
        });
        conn.on('error', (err) => {
            updateStatus('Lỗi kết nối!', '#d32f2f');
        });
    });
    
    peer.on('error', (err) => {
        updateStatus('Lỗi: ' + err.type, '#d32f2f');
    });
}

function setupConnection() {
    isConnected = true;
    conn.on('data', (data) => {
        handleNetData(data);
    });
    conn.on('close', () => {
        All.toast('Đối tác đã ngắt kết nối!');
        closeTradeModal();
    });
    renderTradeRoom();
}

function handleNetData(data) {
    if (data.type === 'UPDATE_ITEMS') {
        theirItems = data.items;
        renderTradeRoom();
    } else if (data.type === 'LOCK') {
        theirLock = data.lock;
        renderTradeRoom();
    } else if (data.type === 'CONFIRM') {
        if (myLock && theirLock) {
            executeTrade();
        }
    }
}

function sendData(data) {
    if (conn && conn.open) {
        conn.send(data);
    }
}

function getInventoryCount(id) {
    if (id === 'coins') return ctx.S.coins || 0;
    if (id === 'norm') return ctx.S.tickets?.norm || 0;
    if (id === 'spec') return ctx.S.tickets?.spec || 0;
    if (id === 'super') return ctx.S.tickets?.super || 0;
    if (id === 'prism') return ctx.S.shards?.prism || 0;
    if (id === 'star') return ctx.S.shards?.star || 0;
    if (id === 'compost') return ctx.S.ferts?.compost || 0;
    if (id === 'shiny') return ctx.S.ferts?.shiny || 0;
    
    if (ctx.S.bag && ctx.S.bag[id]) return ctx.S.bag[id];
    if (ctx.S.seeds && ctx.S.seeds[id]) return ctx.S.seeds[id];
    
    return 0;
}

function deductInventory(id, amount) {
    if (id === 'coins') ctx.S.coins -= amount;
    else if (id === 'norm') ctx.S.tickets.norm -= amount;
    else if (id === 'spec') ctx.S.tickets.spec -= amount;
    else if (id === 'super') ctx.S.tickets.super -= amount;
    else if (id === 'prism') ctx.S.shards.prism -= amount;
    else if (id === 'star') ctx.S.shards.star -= amount;
    else if (id === 'compost') ctx.S.ferts.compost -= amount;
    else if (id === 'shiny') ctx.S.ferts.shiny -= amount;
    else if (ctx.S.bag && ctx.S.bag[id]) {
        ctx.S.bag[id] -= amount;
        if (ctx.S.bag[id] <= 0) delete ctx.S.bag[id];
    } else if (ctx.S.seeds && ctx.S.seeds[id]) {
        ctx.S.seeds[id] -= amount;
        if (ctx.S.seeds[id] <= 0) delete ctx.S.seeds[id];
    }
}

function addInventory(id, amount) {
    if (id === 'coins') ctx.S.coins += amount;
    else if (id === 'norm') ctx.S.tickets.norm += amount;
    else if (id === 'spec') ctx.S.tickets.spec += amount;
    else if (id === 'super') ctx.S.tickets.super += amount;
    else if (id === 'prism') ctx.S.shards.prism += amount;
    else if (id === 'star') ctx.S.shards.star += amount;
    else if (id === 'compost') { if(!ctx.S.ferts) ctx.S.ferts={}; ctx.S.ferts.compost = (ctx.S.ferts.compost || 0) + amount; }
    else if (id === 'shiny') { if(!ctx.S.ferts) ctx.S.ferts={}; ctx.S.ferts.shiny = (ctx.S.ferts.shiny || 0) + amount; }
    else if (CROPS && CROPS[id]) {
        if (CROPS[id].type === 'seed') {
            if (!ctx.S.seeds) ctx.S.seeds = {};
            ctx.S.seeds[id] = (ctx.S.seeds[id] || 0) + amount;
        } else {
            if (!ctx.S.bag) ctx.S.bag = {};
            ctx.S.bag[id] = (ctx.S.bag[id] || 0) + amount;
        }
    }
}

function checkValidTrade() {
    for (const [id, amount] of Object.entries(myItems)) {
        if (getInventoryCount(id) < amount) return false;
    }
    return true;
}

function executeTrade() {
    if (!checkValidTrade()) {
        All.toast('Không đủ vật phẩm trong kho để giao dịch!');
        closeTradeModal();
        return;
    }
    
    for (const [id, amount] of Object.entries(myItems)) {
        deductInventory(id, amount);
    }
    
    for (const [id, amount] of Object.entries(theirItems)) {
        addInventory(id, amount);
    }
    
    All.save(true);
    All.toast('Giao dịch thành công!');
    closeTradeModal();
    All.renderBanner();
}

export function uiConfirmTrade() {
    sendData({ type: 'CONFIRM' });
    if (myLock && theirLock) executeTrade();
}

export function uiToggleLock() {
    if (!checkValidTrade()) {
        All.toast('Bạn không đủ đồ trong kho!');
        return;
    }
    myLock = !myLock;
    sendData({ type: 'LOCK', lock: myLock });
    renderTradeRoom();
}

function renderTradeRoom() {
    const body = document.getElementById('trade-body');
    
    const myHTML = Object.entries(myItems).map(([id, amt]) => 
        `<div class="trade-item">${getItemIcon(id)} <span style="font-size:12px; font-weight:bold; color:#6b4f2e;">${getItemName(id)}</span> <b style="margin-left:auto; color:#a3763d;">x${amt}</b> ${!myLock ? `<div class="close-x" style="width:18px;height:18px;line-height:12px;font-size:14px;" onclick="All.uiRemoveTradeItem('${id}')">×</div>` : ''}</div>`
    ).join('');
    
    const theirHTML = Object.entries(theirItems).map(([id, amt]) => 
        `<div class="trade-item">${getItemIcon(id)} <span style="font-size:12px; font-weight:bold; color:#6b4f2e;">${getItemName(id)}</span> <b style="margin-left:auto; color:#a3763d;">x${amt}</b></div>`
    ).join('');

    body.innerHTML = `
        <div class="trade-split">
            <div class="trade-col">
                <div class="trade-header">Bạn ${myLock ? '<span style="color:#388e3c">✓</span>' : ''}</div>
                <div class="trade-items">${myHTML || '<div style="opacity:0.5;text-align:center;margin-top:20px;">Trống</div>'}</div>
                <div class="trade-actions">
                    <button class="buy ${myLock ? 'plain' : ''}" onclick="All.uiToggleLock()" style="width:100%; text-align:center;">${myLock ? 'Mở khoá' : 'Sẵn sàng'}</button>
                    ${!myLock ? `<button class="buy plain" onclick="All.uiOpenAddItem()" style="width:100%; margin-top:6px; text-align:center;">+ Thêm đồ</button>` : ''}
                </div>
            </div>
            <div class="trade-col">
                <div class="trade-header">Đối tác ${theirLock ? '<span style="color:#388e3c">✓</span>' : ''}</div>
                <div class="trade-items">${theirHTML || '<div style="opacity:0.5;text-align:center;margin-top:20px;">Trống</div>'}</div>
            </div>
        </div>
        ${myLock && theirLock ? `<div style="padding: 10px; margin-top: -10px;"><button class="buy" onclick="All.uiConfirmTrade()" style="width:100%; background: linear-gradient(to bottom, #4caf50, #388e3c); color:white; border-color: #2e7d32; text-align:center;">Xác nhận Giao dịch</button></div>` : ''}
    `;
}

export function uiRemoveTradeItem(id) {
    if (myLock) return;
    delete myItems[id];
    sendData({ type: 'UPDATE_ITEMS', items: myItems });
    renderTradeRoom();
}

export function uiOpenAddItem() {
    if (myLock) return;
    
    const pop = document.getElementById('trade-popup');
    pop.classList.add('open');
    
    let html = '';
    if (ctx.S.coins > 0) html += `<div class="trade-pick" onclick="All.uiSelectAdd('coins', ${ctx.S.coins})">${getItemIcon('coins')} Tiền xu (Có: ${ctx.S.coins})</div>`;
    
    ['norm', 'spec', 'super'].forEach(k => { if (ctx.S.tickets && ctx.S.tickets[k] > 0) html += `<div class="trade-pick" onclick="All.uiSelectAdd('${k}', ${ctx.S.tickets[k]})">${getItemIcon(k)} ${getItemName(k)} (Có: ${ctx.S.tickets[k]})</div>`; });
    ['prism', 'star'].forEach(k => { if (ctx.S.shards && ctx.S.shards[k] > 0) html += `<div class="trade-pick" onclick="All.uiSelectAdd('${k}', ${ctx.S.shards[k]})">${getItemIcon(k)} ${getItemName(k)} (Có: ${ctx.S.shards[k]})</div>`; });
    
    ['compost', 'shiny'].forEach(k => { if (ctx.S.ferts && ctx.S.ferts[k] > 0) html += `<div class="trade-pick" onclick="All.uiSelectAdd('${k}', ${ctx.S.ferts[k]})">${getItemIcon(k)} ${getItemName(k)} (Có: ${ctx.S.ferts[k]})</div>`; });
    
    if (ctx.S.bag) {
        Object.entries(ctx.S.bag).forEach(([k, v]) => {
            if (v > 0) html += `<div class="trade-pick" onclick="All.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (Có: ${v})</div>`;
        });
    }
    if (ctx.S.seeds) {
        Object.entries(ctx.S.seeds).forEach(([k, v]) => {
            if (v > 0) html += `<div class="trade-pick" onclick="All.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (Có: ${v})</div>`;
        });
    }
    
    document.getElementById('trade-popup-list').innerHTML = html || '<div style="padding:10px;text-align:center;font-weight:bold;color:#a3763d;">Không có đồ để giao dịch</div>';
    document.getElementById('trade-popup-act').style.display = 'none';
}

export function uiCloseAddItem() {
    document.getElementById('trade-popup').classList.remove('open');
}

let selectedTradeId = null;
let selectedTradeMax = 0;

export function uiSelectAdd(id, max) {
    selectedTradeId = id;
    selectedTradeMax = max;
    document.getElementById('trade-popup-act').style.display = 'flex';
    // @ts-ignore
    document.getElementById('inp-trade-amount').max = max;
    // @ts-ignore
    document.getElementById('inp-trade-amount').value = 1;
    document.getElementById('lbl-trade-sel').innerHTML = `Đã chọn: <b>${getItemName(id)}</b> (Tối đa: ${max})`;
}

export function uiConfirmAdd() {
    // @ts-ignore
    let amt = parseInt(document.getElementById('inp-trade-amount').value) || 0;
    if (amt <= 0 || amt > selectedTradeMax) {
        All.toast('Số lượng không hợp lệ!');
        return;
    }
    myItems[selectedTradeId] = (myItems[selectedTradeId] || 0) + amt;
    if (myItems[selectedTradeId] > getInventoryCount(selectedTradeId)) {
        myItems[selectedTradeId] = getInventoryCount(selectedTradeId);
    }
    sendData({ type: 'UPDATE_ITEMS', items: myItems });
    renderTradeRoom();
    uiCloseAddItem();
}
