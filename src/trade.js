import { ctx } from './store.js';
import * as All from './all.js';
import { CROPS } from './data.js';
import { Peer } from 'peerjs';
import { buildPeerConfigAsync } from './net.js';

let peer = null;
let conn = null;
let myItems = {}; 
let theirItems = {};
let myLock = false;
let theirLock = false;
let myConfirm = false;
let theirConfirm = false;
let isConnected = false;
let tradeCompleted = false;
let cheatDetected = false;
let theirUniques = {};
let theirMutDescs = {};
let partnerName = 'Đối tác';

function getItemName(id) {
    if (id === 'coins') return 'Tiền xu';
    if (id === 'norm') return 'Vé Thường';
    if (id === 'spec') return 'Vé Đặc Biệt';
    if (id === 'super') return 'Vé Siêu Cường';
    if (id === 'prism') return 'Mảnh lăng quang';
    if (id === 'star') return 'Mảnh ngôi sao';
    if (id === 'legend') return 'Mảnh Huyền Thoại';
    if (id === 'compost') return 'Phân Hữu Cơ';
    if (id === 'shiny') return 'Phân Bón Bạc';
    if (id.startsWith('unique@')) {
        const item = ctx.S.uniques?.[id] || theirUniques[id];
        return item?.name || 'Vật phẩm Gacha';
    }
    if (id.includes('@') && !id.startsWith('unique@')) {
        const parts = id.split('@');
        return (parts[1] ? parts[1] + '·' : '') + (CROPS[parts[0]] || { name: '?' }).name;
    }
    if (CROPS && CROPS[id]) return CROPS[id].name;
    return id;
}

function getItemDesc(id) {
    if (id === 'coins') return 'Dùng để mua đồ trong cửa hàng';
    if (id === 'norm') return 'Vé quay Gacha thường';
    if (id === 'spec') return 'Vé quay Gacha đặc biệt';
    if (id === 'super') return 'Vé quay Gacha siêu cấp';
    if (id === 'prism') return 'Dùng để nâng cấp';
    if (id === 'star') return 'Mảnh sao quý hiếm';
    if (id === 'legend') return 'Mảnh huyền thoại quý hiếm';
    if (id === 'compost') return 'Giảm 25% thời gian trồng cây';
    if (id === 'shiny') return 'Nhận thêm 25% tiền xu khi thu hoạch';
    if (id.startsWith('unique@')) {
        const item = ctx.S.uniques?.[id] || theirUniques[id];
        return item?.desc ? item.desc.replace(/"/g, '&quot;') : 'Vật phẩm bí ẩn';
    }
    if (id.includes('@') && !id.startsWith('unique@')) {
        return All.mutDescOf(id) || theirMutDescs[id] || 'Nông sản đột biến kỳ lạ';
    }
    if (CROPS && CROPS[id]) return CROPS[id].desc || '';
    return '';
}

function getItemIcon(id) {
    if (id === 'coins') return All.spriteSVG('coin', 20);
    if (id === 'norm' || id === 'spec' || id === 'super') {
        const tId = id.charAt(0).toUpperCase() + id.slice(1);
        return All.spriteSVG('ticket' + tId, 20);
    }
    if (id === 'prism' || id === 'star' || id === 'legend') {
        const sId = id.charAt(0).toUpperCase() + id.slice(1);
        return id === 'legend' ? All.spriteSVG('legendShard', 20) : All.spriteSVG('shard' + sId, 20);
    }
    if (id === 'compost' || id === 'shiny') return All.spriteSVG('fert_' + id, 20);
    if (id.startsWith('unique@')) {
        const item = ctx.S.uniques?.[id] || theirUniques[id] || { sp: 'strawhat', color: '#4a90e2' };
        return `<span style="color:${item.color}">${All.spriteSVG(item.sp, 20)}</span>`;
    }
    if (id.includes('@') && !id.startsWith('unique@')) {
        const parts = id.split('@');
        return All.spriteSVG(CROPS[parts[0]]?.sp || 'sprout', 20);
    }
    if (CROPS && CROPS[id]) return All.spriteSVG(CROPS[id].sp || id, 20);
    return '';
}

export function openTradeModal() {
    All.$id('trade-win').classList.add('open');
    resetTradeState();
    renderTradeMenu();
}

export function closeTradeModal() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    conn = null;
    All.$id('trade-win').classList.remove('open');
    uiCloseAddItem();
    resetTradeState();
}

function resetTradeState() {
    myItems = {};
    theirItems = {};
    myLock = false;
    theirLock = false;
    myConfirm = false;
    theirConfirm = false;
    theirUniques = {};
    theirMutDescs = {};
    isConnected = false;
    tradeCompleted = false;
    cheatDetected = false;
    partnerName = 'Đối tác';
}

function renderTradeMenu() {
    const body = All.$id('trade-body');
    if (!ctx.S.username) {
        body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
                <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">Tạo Tên Người Chơi</div>
                <div style="font-size: 12px; color: #555;">Vui lòng nhập tên để hiển thị khi giao dịch.</div>
                <input type="text" id="inp-trade-username" class="inp" placeholder="Nhập tên của bạn...">
                <div class="buy" id="btn-trade-save-username" style="padding: 10px;">Lưu tên</div>
            </div>
        `;
        All.$id('btn-trade-save-username').onclick = () => {
            const val = All.$id('inp-trade-username').value.trim();
            if (val) {
                ctx.S.username = val;
                import('./state.js').then(m => m.save());
                renderTradeMenu();
            } else {
                All.toast('Tên không được để trống!');
            }
        };
        return;
    }

    body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">Mở Phòng Trade</div>
            <div class="buy" id="btn-trade-host" style="padding: 10px; text-align:center;">Tạo phòng (Host)</div>
            <div style="display:flex; gap: 8px;">
                <input type="text" id="inp-trade-code" class="inp" placeholder="Nhập mã phòng..." style="flex:1;">
                <div class="buy" id="btn-trade-join" style="padding: 10px;">Tham gia</div>
            </div>
            <div id="trade-status" style="font-size: 12px; color: #d32f2f; font-weight: bold; margin-top: 10px;"></div>
        </div>
    `;

    All.$id('btn-trade-host').onclick = hostRoom;
    All.$id('btn-trade-join').onclick = joinRoom;
}

function updateStatus(msg, color = '#7a5c38') {
    const el = All.$id('trade-status');
    if (el) {
        el.innerText = msg;
        el.style.color = color;
    }
}

async function hostRoom() {
    updateStatus('Đang tạo phòng...', '#7a5c38');
    const roomId = 'farm-' + Math.random().toString(36).substr(2, 6);
    
    const peerOptions = await buildPeerConfigAsync();
    peer = new Peer(roomId, peerOptions);
    peer.on('open', (id) => {
        updateStatus(`Phòng đã tạo! Mã của bạn: ${id}. Hãy gửi mã này cho đối tác.`, '#388e3c');
        const body = All.$id('trade-body');
        body.innerHTML = `
            <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
                <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">Đang chờ đối tác kết nối...</div>
                <div style="font-size: 20px; font-weight: bold; color: #e91e63; user-select: all; background: #fce4ec; padding: 10px; border-radius: 8px; border: 2px dashed #f06292;">${id}</div>
                <div class="buy plain" onclick="FarmAll.closeTradeModal()" style="padding: 8px; margin-top: 20px; text-align:center;">Huỷ</div>
            </div>
        `;
    });

    peer.on('connection', (connection) => {
        if (conn || isConnected) {
            connection.on('open', () => {
                connection.send({ type: 'ROOM_FULL' });
                setTimeout(() => connection.close(), 500);
            });
            return;
        }
        conn = connection;
        updateStatus('Đang thiết lập đường truyền dữ liệu...', '#7a5c38');
        
        if (conn.open) {
            setupConnection();
        } else {
            conn.on('open', () => {
                setupConnection();
            });
        }
    });

    peer.on('error', (err) => {
        updateStatus('Lỗi: ' + err.type, '#d32f2f');
    });
}

async function joinRoom() {
    const codeEl = All.$id('inp-trade-code');
    const code = codeEl ? codeEl.value.trim() : '';
    if (!code) {
        updateStatus('Vui lòng nhập mã phòng!', '#d32f2f');
        return;
    }
    updateStatus('Đang kết nối...', '#7a5c38');
    
    const peerOptions = await buildPeerConfigAsync();
    peer = new Peer(undefined, peerOptions);
    
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
        if (!tradeCompleted && !cheatDetected) {
            All.toast('Đối tác đã ngắt kết nối!');
        }
        closeTradeModal();
    });
    
    // Anti-cheat check: send our playerId
    setTimeout(() => {
        sendData({ type: 'HELLO', playerId: ctx.S.playerId, username: ctx.S.username });
    }, 500);
    
    renderTradeRoom();
}

function handleNetData(data) {
    if (data.type === 'UPDATE_ITEMS') {
        if (data.items) {
            theirItems = {};
            for (const [k, v] of Object.entries(data.items)) {
                const amt = parseInt(v);
                if (Number.isFinite(amt) && amt > 0) {
                    theirItems[k] = amt;
                }
            }
        }
        if (data.uniques) {
            theirUniques = data.uniques;
            for (const key in theirUniques) {
                const u = theirUniques[key];
                if (u && u.sp && u.spriteMap) {
                    All.registerDynamicSprite(u.sp, u.spriteMap);
                }
            }
        }
        theirMutDescs = data.mutDescs || {};
        renderTradeRoom();
    } else if (data.type === 'LOCK') {
        theirLock = data.lock;
        if (!theirLock) theirConfirm = false;
        renderTradeRoom();
    } else if (data.type === 'CONFIRM') {
        theirConfirm = true;
        renderTradeRoom();
        if (myConfirm && theirConfirm) {
            executeTrade();
        }
    } else if (data.type === 'HELLO') {
        if (data.playerId === ctx.S.playerId) {
            cheatDetected = true;
            All.toast('Phát hiện gian lận: Không thể giao dịch với chính mình (Trùng ID Người Chơi)!');
            sendData({ type: 'CHEAT_DETECTED' });
            if (conn) conn.close();
            closeTradeModal();
        } else {
            if (data.username) partnerName = data.username;
            renderTradeRoom();
        }
    } else if (data.type === 'CHEAT_DETECTED') {
        cheatDetected = true;
        All.toast('Phát hiện gian lận: Không thể giao dịch với chính mình (Trùng ID Người Chơi)!');
        if (conn) conn.close();
        closeTradeModal();
    } else if (data.type === 'ROOM_FULL') {
        All.toast('Phòng giao dịch này đã đầy (đang có người khác giao dịch)!');
        if (conn) conn.close();
        closeTradeModal();
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
    if (id === 'legend') return ctx.S.shards?.legend || 0;
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
    else if (id === 'legend') ctx.S.shards.legend -= amount;
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
    else if (id === 'legend') ctx.S.shards.legend += amount;
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
    } else if (id.startsWith('unique@') || id.includes('@')) {
        if (!ctx.S.bag) ctx.S.bag = {};
        ctx.S.bag[id] = (ctx.S.bag[id] || 0) + amount;
    }
}

function checkValidTrade() {
    for (const [id, amount] of Object.entries(myItems)) {
        if (!Number.isFinite(amount) || amount <= 0) return false;
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
        if (id.startsWith('unique@') && theirUniques[id]) {
            if (!ctx.S.uniques) ctx.S.uniques = {};
            ctx.S.uniques[id] = theirUniques[id];
        } else if (id.includes('@') && !id.startsWith('unique@') && theirMutDescs[id]) {
            if (!ctx.S.mutDesc) ctx.S.mutDesc = {};
            const parts = id.split('@');
            const mutCode = parts.slice(1).join('@');
            ctx.S.mutDesc[mutCode + '@' + (CROPS[parts[0]] || { name: '' }).name] = theirMutDescs[id];
        }
    }
    
    tradeCompleted = true;
    All.save(true);
    All.toast('Hoàn tất giao dịch! Chúc vui vẻ!');
    closeTradeModal();
    All.renderBanner();
}

export function uiConfirmTrade() {
    if (myConfirm) return;
    myConfirm = true;
    sendData({ type: 'CONFIRM' });
    renderTradeRoom();
    if (myConfirm && theirConfirm) {
        executeTrade();
    }
}

export function uiToggleLock() {
    if (!checkValidTrade()) {
        All.toast('Bạn không đủ đồ trong kho!');
        return;
    }
    myLock = !myLock;
    if (!myLock) myConfirm = false;
    sendData({ type: 'LOCK', lock: myLock });
    renderTradeRoom();
}

function renderTradeRoom() {
    const body = All.$id('trade-body');
    
    const myHTML = Object.entries(myItems).map(([id, amt]) => {
        const desc = getItemDesc(id);
        return `<div class="trade-item" style="align-items:flex-start;">
                    <div style="margin-top:2px;">${getItemIcon(id)}</div>
                    <div style="display:flex; flex-direction:column; margin-left:5px; flex:1;">
                        <div style="display:flex; align-items:center;">
                            <span style="font-size:12px; font-weight:bold; color:#6b4f2e;">${getItemName(id)}</span>
                            <b style="margin-left:auto; color:#a3763d;">x${amt}</b>
                        </div>
                        ${desc ? `<div style="font-size:10px; color:#888; font-style:italic; line-height:1.2; margin-top:2px; word-break:break-word;">${desc}</div>` : ''}
                    </div>
                    ${!myLock ? `<div class="close-x" style="width:18px;height:18px;line-height:12px;font-size:14px;margin-left:5px;margin-top:2px;" onclick="FarmAll.uiRemoveTradeItem('${id}')">×</div>` : ''}
                </div>`;
    }).join('');
    
    const theirHTML = Object.entries(theirItems).map(([id, amt]) => {
        const desc = getItemDesc(id);
        return `<div class="trade-item" style="align-items:flex-start;">
                    <div style="margin-top:2px;">${getItemIcon(id)}</div>
                    <div style="display:flex; flex-direction:column; margin-left:5px; flex:1;">
                        <div style="display:flex; align-items:center;">
                            <span style="font-size:12px; font-weight:bold; color:#6b4f2e;">${getItemName(id)}</span>
                            <b style="margin-left:auto; color:#a3763d;">x${amt}</b>
                        </div>
                        ${desc ? `<div style="font-size:10px; color:#888; font-style:italic; line-height:1.2; margin-top:2px; word-break:break-word;">${desc}</div>` : ''}
                    </div>
                </div>`;
    }).join('');

    body.innerHTML = `
        <div class="trade-split">
            <div class="trade-col">
                <div class="trade-header">${ctx.S.username || 'Bạn'} ${myLock ? '<span style="color:#388e3c">✓</span>' : ''} ${myConfirm ? '<span style="color:#2e7d32; font-size:10px;">(Đã XN)</span>' : ''}</div>
                <div class="trade-items">${myHTML || '<div style="opacity:0.5;text-align:center;margin-top:20px;">Trống</div>'}</div>
                <div class="trade-actions">
                    <button class="buy ${myLock ? 'plain' : ''}" onclick="FarmAll.uiToggleLock()" style="width:100%; text-align:center;">${myLock ? 'Mở khoá' : 'Sẵn sàng'}</button>
                    ${!myLock ? `<button class="buy plain" onclick="FarmAll.uiOpenAddItem()" style="width:100%; margin-top:6px; text-align:center;">+ Thêm đồ</button>` : ''}
                </div>
            </div>
            <div class="trade-col">
                <div class="trade-header">${partnerName} ${theirLock ? '<span style="color:#388e3c">✓</span>' : ''} ${theirConfirm ? '<span style="color:#2e7d32; font-size:10px;">(Đã XN)</span>' : ''}</div>
                <div class="trade-items">${theirHTML || '<div style="opacity:0.5;text-align:center;margin-top:20px;">Trống</div>'}</div>
            </div>
        </div>
        ${myLock && theirLock && !myConfirm ? `<div style="padding: 10px; margin-top: -10px;"><button class="buy" onclick="FarmAll.uiConfirmTrade()" style="width:100%; background: linear-gradient(to bottom, #4caf50, #388e3c); color:white; border-color: #2e7d32; text-align:center;">Xác nhận Giao dịch</button></div>` : ''}
        ${myLock && theirLock && myConfirm ? `<div style="padding: 10px; margin-top: -10px; text-align:center; color:#388e3c; font-weight:bold;">Đang chờ đối tác xác nhận...</div>` : ''}
    `;
}

function sendItemsUpdate() {
    const uniques = {};
    const mutDescs = {};
    for (const id in myItems) {
        if (id.startsWith('unique@') && ctx.S.uniques?.[id]) {
            uniques[id] = ctx.S.uniques[id];
        } else if (id.includes('@') && !id.startsWith('unique@')) {
            const desc = All.mutDescOf(id);
            if (desc) mutDescs[id] = desc;
        }
    }
    sendData({ type: 'UPDATE_ITEMS', items: myItems, uniques: uniques, mutDescs: mutDescs });
}

export function uiRemoveTradeItem(id) {
    if (myLock) return;
    delete myItems[id];
    sendItemsUpdate();
    renderTradeRoom();
}

export function uiOpenAddItem() {
    if (myLock) return;
    
    const pop = All.$id('trade-popup');
    pop.classList.add('open');
    
    let catCoins = '';
    if (ctx.S.coins > 0) catCoins += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('coins', ${ctx.S.coins})">${getItemIcon('coins')} Tiền xu (Có: ${ctx.S.coins})</div>`;
    
    let catTickets = '';
    ['norm', 'spec', 'super'].forEach(k => { if (ctx.S.tickets && ctx.S.tickets[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${ctx.S.tickets[k]})">${getItemIcon(k)} ${getItemName(k)} (Có: ${ctx.S.tickets[k]})</div>`; });
    ['prism', 'star', 'legend'].forEach(k => { if (ctx.S.shards && ctx.S.shards[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${ctx.S.shards[k]})">${getItemIcon(k)} ${getItemName(k)} (Có: ${ctx.S.shards[k]})</div>`; });
    
    let catFerts = '';
    ['compost', 'shiny'].forEach(k => { if (ctx.S.ferts && ctx.S.ferts[k] > 0) catFerts += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${ctx.S.ferts[k]})">${getItemIcon(k)} ${getItemName(k)} (Có: ${ctx.S.ferts[k]})</div>`; });
    
    let catBag = '';
    let catGacha = '';
    if (ctx.S.bag) {
        Object.entries(ctx.S.bag).forEach(([k, v]) => {
            if (v > 0) {
                if (k.startsWith('unique@')) catGacha += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (Có: ${v})</div>`;
                else catBag += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (Có: ${v})</div>`;
            }
        });
    }
    
    let catSeeds = '';
    if (ctx.S.seeds) {
        Object.entries(ctx.S.seeds).forEach(([k, v]) => {
            if (v > 0) catSeeds += `<div class="trade-pick" onclick="FarmAll.uiSelectAdd('${k}', ${v})">${getItemIcon(k)} ${getItemName(k)} (Có: ${v})</div>`;
        });
    }
    
    let html = '';
    if (catCoins) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">TIỀN TỆ</div>` + catCoins;
    if (catBag) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">NÔNG SẢN</div>` + catBag;
    if (catSeeds) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">HẠT GIỐNG</div>` + catSeeds;
    if (catFerts) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">PHÂN BÓN</div>` + catFerts;
    if (catTickets) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">VÉ & MẢNH</div>` + catTickets;
    if (catGacha) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px;">ĐỒ GACHA</div>` + catGacha;
    
    All.$id('trade-popup-list').innerHTML = html || '<div style="padding:10px;text-align:center;font-weight:bold;color:#a3763d;">Không có đồ để giao dịch</div>';
    All.$id('trade-popup-act').style.display = 'none';
}

export function uiCloseAddItem() {
    All.$id('trade-popup').classList.remove('open');
}

let selectedTradeId = null;
let selectedTradeMax = 0;

export function uiSelectAdd(id, max) {
    selectedTradeId = id;
    selectedTradeMax = max;
    All.$id('trade-popup-act').style.display = 'flex';
    // @ts-ignore
    All.$id('inp-trade-amount').max = max;
    // @ts-ignore
    All.$id('inp-trade-amount').value = 1;
    All.$id('lbl-trade-sel').innerHTML = `Đã chọn: <b>${getItemName(id)}</b> (Tối đa: ${max})`;
}

export function uiConfirmAdd() {
    // @ts-ignore
    let amt = parseInt(All.$id('inp-trade-amount').value) || 0;
    if (amt <= 0 || amt > selectedTradeMax) {
        All.toast('Số lượng không hợp lệ!');
        return;
    }
    myItems[selectedTradeId] = (myItems[selectedTradeId] || 0) + amt;
    if (myItems[selectedTradeId] > getInventoryCount(selectedTradeId)) {
        myItems[selectedTradeId] = getInventoryCount(selectedTradeId);
    }
    sendItemsUpdate();
    renderTradeRoom();
    uiCloseAddItem();
}
