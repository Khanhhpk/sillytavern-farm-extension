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

function renderPostItem() {
    let options = '';
    
    // Nông sản
    Object.keys(ctx.S.bag).forEach(id => {
        if (ctx.S.bag[id] > 0) {
            const baseId = id.includes('@') ? id.split('@')[1] : id;
            const c = CROPS[baseId];
            const prefix = id.includes('@') ? `[Đột biến ${id.split('@')[0]}] ` : '';
            options += `<option value="bag|${id}">Nông sản: ${prefix}${c ? c.name : id} (Còn: ${ctx.S.bag[id]})</option>`;
        }
    });
    // Hạt giống
    Object.keys(ctx.S.seeds).forEach(id => {
        if (ctx.S.seeds[id] > 0) {
            const c = CROPS[id];
            options += `<option value="seeds|${id}">Hạt giống: ${c ? c.name : id} (Còn: ${ctx.S.seeds[id]})</option>`;
        }
    });
    // Phân bón
    Object.keys(ctx.S.ferts).forEach(id => {
        if (ctx.S.ferts[id] > 0) {
            const f = FERTS[id];
            options += `<option value="ferts|${id}">Phân bón: ${f ? f.name : id} (Còn: ${ctx.S.ferts[id]})</option>`;
        }
    });
    // Mảnh
    if (ctx.S.shards) {
        Object.keys(ctx.S.shards).forEach(id => {
            if (ctx.S.shards[id] > 0) {
                const shardNames = { prism: 'lăng quang', star: 'ngôi sao', legend: 'huyền thoại' };
                options += `<option value="shards|${id}">Mảnh ${shardNames[id] || id} (Còn: ${ctx.S.shards[id]})</option>`;
            }
        });
    }
    // Bảo vật
    if (ctx.S.uniques) {
        Object.keys(ctx.S.uniques).forEach(id => {
            const u = ctx.S.uniques[id];
            options += `<option value="uniques|${id}">Bảo vật: ${u.name}</option>`;
        });
    }

    All.$id('trade-body').innerHTML = `
        <div class="flea-header">
            <h3>Đăng Bán</h3>
            <button id="flea-back" class="btn">Quay lại Chợ</button>
        </div>
        <div class="flea-post-form">
            <label>Chọn món đồ:</label>
            <select id="flea-post-item">${options}</select>
            
            <label>Số lượng muốn bán:</label>
            <input type="number" id="flea-post-amount" min="1" value="1">
            
            <label>Giá bán tổng cộng (Vàng):</label>
            <input type="number" id="flea-post-price" min="1" value="10">
            
            <button id="flea-post-submit" class="btn" style="margin-top: 10px; width: 100%;">Đăng Lên Chợ</button>
        </div>
    `;
    
    All.$id('flea-back').addEventListener('click', renderFleaMarket);
    
    All.$id('flea-post-submit').addEventListener('click', async () => {
        const val = All.$id('flea-post-item').value;
        if (!val) return All.toast("Chưa chọn món đồ nào");
        const parts = val.split('|');
        const itemType = parts[0];
        const itemId = parts[1];
        
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
            } else {
                ctx.S[itemType][itemId] = (ctx.S[itemType][itemId] || 0) + amount;
            }
            All.save();
            All.toast("Lỗi khi đăng bán: " + e.message);
        }
    });
}
