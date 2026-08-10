import { ctx } from './store.js';
import * as All from './all.js';
import { db } from './firebase.js';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { CROPS, FERTS } from './data.js';

export async function openFleaMarket() {
    if (!db) {
        All.toast("Tính năng Chợ Trời yêu cầu cấu hình Firebase. Vui lòng thêm config vào .env");
        return;
    }
    checkSoldItems(); // Check if any of our items were sold
    renderFleaMarket();
}

// Kiểm tra xem có đơn hàng nào của mình đã được bán không
async function checkSoldItems() {
    if (!db || !ctx.S.playerId) return;
    try {
        const q = query(collection(db, "flea_market"), where("sellerId", "==", ctx.S.playerId), where("status", "==", "sold"));
        const snapshot = await getDocs(q);
        let goldGained = 0;
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            goldGained += data.price;
            deleteDoc(docSnap.ref); // Xóa khỏi DB sau khi đã nhận tiền
        });

        if (goldGained > 0) {
            ctx.S.coins += goldGained;
            All.save();
            All.toast(`Bạn vừa nhận được ${goldGained} Vàng từ đồ bán trong Chợ Trời!`);
            All.renderStatus();
        }
    } catch (e) {
        console.error("Lỗi khi kiểm tra hàng đã bán:", e);
    }
}

function renderFleaMarket() {
    All.$id('trade-body').innerHTML = `
        <div class="flea-header">
            <h3>Chợ Trời Khởi Nguyên</h3>
            <button id="flea-refresh" class="btn">Làm mới</button>
            <button id="flea-post" class="btn">Đăng Bán</button>
        </div>
        <div id="flea-list" class="flea-list">Đang tải danh sách...</div>
    `;
    
    All.$id('flea-refresh').addEventListener('click', loadFleaList);
    All.$id('flea-post').addEventListener('click', renderPostItem);
    
    loadFleaList();
}

async function loadFleaList() {
    const listEl = All.$id('flea-list');
    if (!listEl) return;
    listEl.innerHTML = 'Đang tải danh sách...';
    
    try {
        const q = query(collection(db, "flea_market"), where("status", "==", "active"));
        const snapshot = await getDocs(q);
        
        let html = '';
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const isMine = data.sellerId === ctx.S.playerId;
            
            let itemName = data.itemId;
            let icon = '';
            if (data.itemType === 'bag') {
                const baseId = data.itemId.includes('@') ? data.itemId.split('@')[1] : data.itemId;
                const c = CROPS[baseId];
                const prefix = data.itemId.includes('@') ? `[Đột biến ${data.itemId.split('@')[0]}] ` : '';
                itemName = c ? prefix + c.name : data.itemId;
                icon = c ? c.icon || '📦' : '📦';
            } else if (data.itemType === 'seeds') {
                const c = CROPS[data.itemId];
                itemName = c ? `Hạt ${c.name}` : data.itemId;
                icon = '🌱';
            } else if (data.itemType === 'ferts') {
                const f = FERTS[data.itemId];
                itemName = f ? f.name : data.itemId;
                icon = '🧪';
            } else if (data.itemType === 'uniques') {
                itemName = data.itemData ? data.itemData.name : 'Bảo vật';
                icon = '✨';
            } else if (data.itemType === 'shards') {
                const shardNames = { prism: 'Mảnh lăng quang', star: 'Mảnh ngôi sao', legend: 'Mảnh huyền thoại' };
                itemName = shardNames[data.itemId] || 'Mảnh';
                icon = '💎';
            }

            html += `
                <div class="flea-item ${isMine ? 'mine' : ''}">
                    <div class="flea-item-icon">${icon}</div>
                    <div class="flea-item-info">
                        <div class="flea-item-name">${itemName} x${data.amount}</div>
                        <div class="flea-item-seller">Người bán: ${data.sellerId.substring(0, 6)}</div>
                    </div>
                    <div class="flea-item-action">
                        <div class="flea-item-price">${data.price} G</div>
                        ${isMine ? 
                            `<button class="btn flea-cancel" data-id="${docSnap.id}">Gỡ Xuống</button>` :
                            `<button class="btn flea-buy" data-id="${docSnap.id}" data-price="${data.price}">Mua</button>`
                        }
                    </div>
                </div>
            `;
        });
        
        if (html === '') html = '<div class="empty-market">Chợ hiện đang trống. Hãy đăng bán gì đó nhé!</div>';
        listEl.innerHTML = html;
        
        // Gắn sự kiện
        listEl.querySelectorAll('.flea-buy').forEach(btn => {
            btn.addEventListener('click', (e) => buyItem(e.target.dataset.id, parseInt(e.target.dataset.price)));
        });
        listEl.querySelectorAll('.flea-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => cancelItem(e.target.dataset.id));
        });
        
    } catch (e) {
        listEl.innerHTML = `<div class="error">Lỗi khi tải chợ: ${e.message}</div>`;
    }
}

async function buyItem(docId, price) {
    if (ctx.S.coins < price) {
        All.toast("Không đủ vàng!");
        return;
    }
    
    try {
        const docRef = doc(db, "flea_market", docId);
        // Trừ tiền ngay lập tức để tránh double click
        ctx.S.coins -= price;
        All.save();
        All.renderStatus();
        
        // Đọc lại doc xem còn active không (tránh race condition cơ bản)
        const { getDoc } = await import('firebase/firestore');
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists() || docSnap.data().status !== 'active') {
            // Hoàn tiền
            ctx.S.coins += price;
            All.save();
            All.renderStatus();
            All.toast("Món hàng này đã bị người khác mua mất hoặc bị gỡ!");
            loadFleaList();
            return;
        }
        
        const data = docSnap.data();
        
        // Đổi trạng thái sang sold
        await updateDoc(docRef, { status: 'sold' });
        
        // Thêm vào kho
        if (data.itemType === 'bag') {
            ctx.S.bag[data.itemId] = (ctx.S.bag[data.itemId] || 0) + data.amount;
        } else if (data.itemType === 'seeds') {
            ctx.S.seeds[data.itemId] = (ctx.S.seeds[data.itemId] || 0) + data.amount;
        } else if (data.itemType === 'ferts') {
            ctx.S.ferts[data.itemId] = (ctx.S.ferts[data.itemId] || 0) + data.amount;
        } else if (data.itemType === 'tickets') {
            if (!ctx.S.tickets) ctx.S.tickets = {};
            ctx.S.tickets[data.itemId] = (ctx.S.tickets[data.itemId] || 0) + data.amount;
        } else if (data.itemType === 'shards') {
            if (!ctx.S.shards) ctx.S.shards = {};
            ctx.S.shards[data.itemId] = (ctx.S.shards[data.itemId] || 0) + data.amount;
        } else if (data.itemType === 'uniques') {
            if (!ctx.S.uniques) ctx.S.uniques = {};
            ctx.S.uniques[data.itemId] = data.itemData;
            ctx.S.bag[data.itemId] = (ctx.S.bag[data.itemId] || 0) + data.amount;
        }
        All.save();
        All.toast("Mua thành công!");
        loadFleaList();
        
    } catch (e) {
        All.toast("Lỗi khi mua: " + e.message);
    }
}

async function cancelItem(docId) {
    try {
        const { getDoc } = await import('firebase/firestore');
        const docRef = doc(db, "flea_market", docId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        
        // Hoàn trả đồ
        if (data.itemType === 'uniques') {
            if (!ctx.S.uniques) ctx.S.uniques = {};
            ctx.S.uniques[data.itemId] = data.itemData;
            ctx.S.bag[data.itemId] = (ctx.S.bag[data.itemId] || 0) + data.amount;
        } else {
            if (!ctx.S[data.itemType]) ctx.S[data.itemType] = {};
            ctx.S[data.itemType][data.itemId] = (ctx.S[data.itemType][data.itemId] || 0) + data.amount;
        }
        
        All.save();
        await deleteDoc(docRef);
        All.toast("Đã gỡ món hàng xuống");
        loadFleaList();
    } catch (e) {
        All.toast("Lỗi khi gỡ hàng: " + e.message);
    }
}

function getFleaItemName(id) {
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
        return ctx.S.uniques?.[id]?.name || 'Bảo vật bí ẩn';
    }
    if (id.includes('@')) {
        const parts = id.split('@');
        return `[Đột biến ${parts[0]}] ${CROPS[parts[1]]?.name || id}`;
    }
    return CROPS[id]?.name || id;
}

function getFleaItemIcon(id) {
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
        const item = ctx.S.uniques?.[id] || { sp: 'strawhat', color: '#4a90e2' };
        return `<span style="color:${item.color}">${All.spriteSVG(item.sp, 20)}</span>`;
    }
    if (id.includes('@')) {
        const parts = id.split('@');
        return All.spriteSVG(CROPS[parts[1]]?.sp || 'sprout', 20);
    }
    if (CROPS && CROPS[id]) return All.spriteSVG(CROPS[id].sp || id, 20);
    return '';
}

let selectedFleaType = null;
let selectedFleaId = null;
let selectedFleaMax = 0;

export function uiSelectFleaAdd(type, id, max) {
    selectedFleaType = type;
    selectedFleaId = id;
    selectedFleaMax = max;
    All.$id('flea-post-act').style.display = 'flex';
    All.$id('lbl-flea-sel').innerHTML = `Đã chọn: <span style="color:#d32f2f;">${getFleaItemName(id)}</span>`;
    All.$id('flea-post-amount').value = 1;
    All.$id('flea-post-amount').max = max;
}

function renderPostItem() {
    let catBag = '';
    let catGacha = '';
    if (ctx.S.bag) {
        Object.entries(ctx.S.bag).forEach(([k, v]) => {
            if (v > 0) {
                if (k.startsWith('unique@')) catGacha += `<div class="trade-pick" onclick="FarmAll.flea.uiSelectFleaAdd('uniques', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
                else catBag += `<div class="trade-pick" onclick="FarmAll.flea.uiSelectFleaAdd('bag', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
            }
        });
    }
    
    let catSeeds = '';
    if (ctx.S.seeds) {
        Object.entries(ctx.S.seeds).forEach(([k, v]) => {
            if (v > 0) catSeeds += `<div class="trade-pick" onclick="FarmAll.flea.uiSelectFleaAdd('seeds', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
        });
    }

    let catFerts = '';
    if (ctx.S.ferts) {
        Object.entries(ctx.S.ferts).forEach(([k, v]) => {
            if (v > 0) catFerts += `<div class="trade-pick" onclick="FarmAll.flea.uiSelectFleaAdd('ferts', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
        });
    }

    let catTickets = '';
    ['norm', 'spec', 'super'].forEach(k => { if (ctx.S.tickets && ctx.S.tickets[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.flea.uiSelectFleaAdd('tickets', '${k}', ${ctx.S.tickets[k]})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${ctx.S.tickets[k]})</div>`; });
    ['prism', 'star', 'legend'].forEach(k => { if (ctx.S.shards && ctx.S.shards[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.flea.uiSelectFleaAdd('shards', '${k}', ${ctx.S.shards[k]})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${ctx.S.shards[k]})</div>`; });

    let html = '';
    if (catBag) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">NÔNG SẢN</div>` + catBag;
    if (catSeeds) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">HẠT GIỐNG</div>` + catSeeds;
    if (catFerts) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">PHÂN BÓN</div>` + catFerts;
    if (catTickets) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">VÉ & MẢNH</div>` + catTickets;
    if (catGacha) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">ĐỒ GACHA</div>` + catGacha;

    All.$id('trade-body').innerHTML = `
        <div class="flea-header">
            <h3>Đăng Bán</h3>
            <button id="flea-back" class="btn">Quay lại Chợ</button>
        </div>
        <div class="flea-post-form" style="margin-top:10px;">
            <div id="flea-post-list" style="display:flex; flex-wrap:wrap; gap:6px; max-height:200px; overflow-y:auto; padding:10px; border:2px inset #c9a273; background:rgba(0,0,0,0.05); border-radius:8px;">
                ${html || '<div style="width:100%; text-align:center; color:#a3763d; font-style:italic;">Không có đồ để đăng bán</div>'}
            </div>
            
            <div id="flea-post-act" style="display:none; flex-direction:column; gap:8px; margin-top:12px; padding:10px; border:2px dashed #b08a5c; border-radius:8px; background: #fffaf0;">
                <div id="lbl-flea-sel" style="font-size:12px; font-weight:bold; color:#7a5c38; text-align:center;"></div>
                
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label style="font-size:12px; font-weight:bold; color:#6b4f2e;">Số lượng:</label>
                    <input type="number" id="flea-post-amount" class="inp" min="1" value="1" style="width:100px;">
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label style="font-size:12px; font-weight:bold; color:#6b4f2e;">Giá tổng cộng (Vàng):</label>
                    <input type="number" id="flea-post-price" class="inp" min="1" value="10" style="width:100px;">
                </div>
                
                <button id="flea-post-submit" class="buy" style="margin-top: 5px; width: 100%; text-align:center;">Đăng Lên Chợ</button>
            </div>
        </div>
    `;
    
    All.$id('flea-back').addEventListener('click', renderFleaMarket);
    
    All.$id('flea-post-submit').addEventListener('click', async () => {
        if (!selectedFleaType || !selectedFleaId) return All.toast("Chưa chọn món đồ nào");
        const itemType = selectedFleaType;
        const itemId = selectedFleaId;
        
        const amount = parseInt(All.$id('flea-post-amount').value);
        const price = parseInt(All.$id('flea-post-price').value);
        
        if (isNaN(amount) || amount <= 0) return All.toast("Số lượng không hợp lệ");
        if (isNaN(price) || price < 0) return All.toast("Giá không hợp lệ");
        
        // Kiểm tra số lượng có đủ không
        let currentAmount = 0;
        if (itemType === 'uniques') currentAmount = (ctx.S.uniques && ctx.S.uniques[itemId]) ? 1 : 0;
        else currentAmount = (ctx.S[itemType] && ctx.S[itemType][itemId]) ? ctx.S[itemType][itemId] : 0;
        
        if (amount > currentAmount) {
            return All.toast("Bạn không có đủ số lượng này!");
        }
        
        if (itemType === 'uniques' && amount > 1) {
            return All.toast("Chỉ được bán 1 Bảo vật một lúc!");
        }
        
        let itemData = null;
        // Trừ đồ trong kho
        if (itemType === 'uniques') {
            itemData = ctx.S.uniques[itemId];
            delete ctx.S.uniques[itemId];
            ctx.S.bag[itemId] -= amount;
            if (ctx.S.bag[itemId] <= 0) delete ctx.S.bag[itemId];
        } else {
            ctx.S[itemType][itemId] -= amount;
            if (ctx.S[itemType][itemId] <= 0) delete ctx.S[itemType][itemId];
        }
        All.save();
        
        // Gửi lên Firebase
        try {
            const docData = {
                sellerId: ctx.S.playerId,
                sellerName: ctx.S.username || "Vô Danh",
                itemType: itemType,
                itemId: itemId,
                amount: amount,
                price: price,
                status: 'active',
                createdAt: Date.now()
            };
            if (itemData) docData.itemData = itemData;
            await addDoc(collection(db, "flea_market"), docData);
            All.toast("Đã đăng bán thành công!");
            renderFleaMarket();
        } catch (e) {
            // Hoàn lại kho nếu lỗi
            if (itemType === 'uniques') {
                if (!ctx.S.uniques) ctx.S.uniques = {};
                ctx.S.uniques[itemId] = itemData;
                ctx.S.bag[itemId] = (ctx.S.bag[itemId] || 0) + amount;
            } else {
                ctx.S[itemType][itemId] = (ctx.S[itemType][itemId] || 0) + amount;
            }
            All.save();
            All.toast("Lỗi khi đăng bán: " + e.message);
        }
    });
}
