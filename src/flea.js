import { ctx } from './store.js';
import * as All from './all.js';
import { db } from './firebase.js';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { CROPS, FERTS } from './data.js';

let currentFleaItems = {};

export async function openFleaMarket() {
    if (!db) {
        All.toast("Tính năng Chợ Trời yêu cầu cấu hình Firebase. Vui lòng thêm config vào .env");
        return;
    }
    renderFleaMarket();
}

// Kiểm tra xem có đơn hàng nào của mình đã được bán không
async function checkSoldItemsNotif() {
    if (!db || !ctx.S.playerId) return;
    try {
        const q = query(collection(db, "flea_market"), where("sellerId", "==", ctx.S.playerId), where("status", "==", "sold"));
        const snapshot = await getDocs(q);
        
        const histBtn = All.$id('flea-history-btn');
        if (histBtn) {
            if (!snapshot.empty) {
                histBtn.style.position = 'relative';
                histBtn.innerHTML = `Lịch sử <span style="position: absolute; top: -6px; right: -6px; background: #e53935; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.5); font-weight: bold;">${snapshot.size}</span>`;
            } else {
                histBtn.style.position = '';
                histBtn.innerHTML = `Lịch sử`;
            }
        }
    } catch (e) {
        console.error("Lỗi khi kiểm tra hàng đã bán:", e);
    }
}

export async function renderFleaMarket() {
    if (!ctx.S.username) {
        All.$id('trade-body').innerHTML = `
            <div style="display:flex; flex-direction:column; gap: 15px; padding: 20px; text-align: center;">
                <div style="font-size: 14px; color: #7a5c38; font-weight: bold;">Tạo Tên Người Chơi</div>
                <div style="font-size: 12px; color: #555;">Vui lòng nhập tên để hiển thị khi giao dịch trên Chợ Trời.</div>
                <input type="text" id="inp-flea-username" class="inp" placeholder="Nhập tên của bạn...">
                <div class="buy" id="btn-flea-save-username" style="padding: 10px;">Lưu tên</div>
            </div>
        `;
        All.$id('btn-flea-save-username').onclick = () => {
            const val = All.$id('inp-flea-username').value.trim();
            if (val) {
                ctx.S.username = val;
                All.save();
                renderFleaMarket();
            } else {
                All.toast('Tên không được để trống!');
            }
        };
        return;
    }

    if (All.$id('trade-win-title')) All.$id('trade-win-title').innerText = 'Chợ Trời Khởi Nguyên';
    
    All.$id('trade-body').innerHTML = `
        <div class="flea-header" style="justify-content: flex-end;">
            <div style="display: flex; gap: 5px;">
                <button id="flea-history-btn" class="btn">Lịch sử</button>
                <button id="flea-refresh" class="btn">Làm mới</button>
                <button id="flea-post" class="btn">Đăng Bán</button>
            </div>
        </div>
        
        <div class="flea-filters" style="display:flex; flex-wrap:wrap; gap:5px; margin:10px 0; padding:10px; border:2px inset #c9a273; background:rgba(0,0,0,0.05); border-radius:8px;">
            <input type="text" id="inp-flea-search" class="inp" placeholder="Tìm tên đồ, người bán..." style="flex:1; min-width:140px; padding:6px; box-sizing:border-box;">
            <select id="sel-flea-type" class="inp" style="max-width:120px; padding:6px;">
                <option value="all">Tất cả</option>
                <option value="uniques">Bảo vật (Gacha)</option>
                <option value="mutants">Đột biến</option>
                <option value="crops">Nông sản</option>
                <option value="seeds">Hạt giống</option>
                <option value="ferts">Vật phẩm</option>
                <option value="tickets">Vé / Mảnh</option>
            </select>
            <select id="sel-flea-sort" class="inp" style="max-width:130px; padding:6px;">
                <option value="default">Mặc định</option>
                <option value="rarity-desc">Độ hiếm ⬇</option>
                <option value="rarity-asc">Độ hiếm ⬆</option>
            </select>
        </div>
        
        <div id="flea-list" class="flea-list">Đang tải danh sách...</div>
          
          <div id="flea-detail-act" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:99; border-radius: 8px;">
              <div style="background:#fffaf0; padding:20px; border:3px solid #c9a273; border-radius:12px; width:85%; max-width:320px; display:flex; flex-direction:column; gap:12px; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                  <button onclick="FarmAll.$id('flea-detail-act').style.display='none'" style="position:absolute; top:8px; right:10px; background:none; border:none; font-weight:bold; cursor:pointer; color:#7a5c38; font-size:16px;">✕</button>
                  
                  <div style="display:flex; gap:15px; align-items:center;">
                      <div id="lbl-flea-dtl-icon" style="font-size:32px; background:#f0e6d2; padding:10px; border-radius:8px; border:1px solid #d4b895; display:flex; justify-content:center; align-items:center; width:64px; height:64px;"></div>
                      <div style="flex:1;">
                          <div id="lbl-flea-dtl-name" style="font-size:15px; font-weight:bold; color:#d32f2f; margin-bottom:5px;"></div>
                          <div id="lbl-flea-dtl-extra"></div>
                      </div>
                  </div>
                  <div id="lbl-flea-dtl-desc" style="font-size:13px; color:#555; line-height:1.4; padding:5px 0;"></div>
              </div>
          </div>
          
          <div id="flea-confirm-act" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:100; border-radius: 8px;">
              <div style="background:#fffaf0; padding:20px; border:3px solid #c9a273; border-radius:12px; width:85%; max-width:280px; display:flex; flex-direction:column; gap:12px; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); text-align:center;">
                  <div style="font-weight:bold; color:#d32f2f; font-size:16px;">Xác nhận mua</div>
                  <div id="lbl-flea-cfm-msg" style="font-size:14px; color:#555; line-height:1.5;"></div>
                  <div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">
                      <button id="btn-flea-cfm-yes" class="buy" style="padding:8px 20px;">Đồng ý</button>
                      <button onclick="FarmAll.$id('flea-confirm-act').style.display='none'" class="btn" style="padding:8px 20px;">Hủy</button>
                  </div>
              </div>
          </div>
    `;
    
    All.$id('flea-history-btn').addEventListener('click', renderHistory);
    All.$id('flea-refresh').addEventListener('click', loadFleaList);
    All.$id('flea-post').addEventListener('click', renderPostItem);
    
    All.$id('inp-flea-search').addEventListener('input', renderFleaItems);
    All.$id('sel-flea-type').addEventListener('change', renderFleaItems);
    All.$id('sel-flea-sort').addEventListener('change', renderFleaItems);
    
    loadFleaList();
    checkSoldItemsNotif();
}

async function loadFleaList() {
    const listEl = All.$id('flea-list');
    if (!listEl) return;
    listEl.innerHTML = 'Đang tải danh sách...';
    
    try {
        const q = query(collection(db, "flea_market"), where("status", "==", "active"));
        const snapshot = await getDocs(q);
        
        currentFleaItems = {};
        snapshot.forEach((docSnap) => {
            currentFleaItems[docSnap.id] = docSnap.data();
        });
        
        renderFleaItems();
        
    } catch (e) {
        listEl.innerHTML = `<div class="error">Lỗi khi tải chợ: ${e.message}</div>`;
    }
}

export function renderFleaItems() {
    const listEl = All.$id('flea-list');
    if (!listEl) return;
    
    const searchStr = All.$id('inp-flea-search') ? All.$id('inp-flea-search').value.toLowerCase().trim() : '';
    const typeFilter = All.$id('sel-flea-type') ? All.$id('sel-flea-type').value : 'all';
    const sortVal = All.$id('sel-flea-sort') ? All.$id('sel-flea-sort').value : 'default';
    
    const rarityMap = { 'Thần thoại': 6, 'Huyền thoại': 5, 'Sử thi': 4, 'Hiếm': 3, 'Thường': 2, 'Rác': 1 };
    
    let itemsArr = Object.entries(currentFleaItems).map(([id, data]) => {
        const itemName = getFleaItemName(data.itemId, data.itemData);
        const sellerName = data.sellerName || data.sellerId.substring(0, 6);
        let effType = 'other';
        if (data.itemId.startsWith('unique@')) effType = 'uniques';
        else if (data.itemId.includes('@')) effType = 'mutants';
        else if (data.itemType === 'bag') effType = 'crops';
        else if (data.itemType === 'seeds') effType = 'seeds';
        else if (data.itemType === 'ferts') effType = 'ferts';
        else if (data.itemType === 'tickets' || data.itemType === 'shards') effType = 'tickets';
        
        let rVal = 0;
        if (data.itemData && data.itemData.rarity) rVal = rarityMap[data.itemData.rarity] || 0;
        
        return { id, data, itemName, sellerName, effType, rVal };
    });
    
    // Lọc
    itemsArr = itemsArr.filter(item => {
        if (typeFilter !== 'all' && item.effType !== typeFilter) return false;
        if (searchStr) {
            const matchName = item.itemName.toLowerCase().includes(searchStr);
            const matchSeller = item.sellerName.toLowerCase().includes(searchStr);
            if (!matchName && !matchSeller) return false;
        }
        return true;
    });
    
    // Sort
    if (sortVal === 'rarity-desc') {
        itemsArr.sort((a, b) => b.rVal - a.rVal);
    } else if (sortVal === 'rarity-asc') {
        itemsArr.sort((a, b) => a.rVal - b.rVal);
    }
    
    // Render
    let html = '';
    itemsArr.forEach(item => {
        const docSnapId = item.id;
        const data = item.data;
        const itemName = item.itemName;
        const isMine = data.sellerId === ctx.S.playerId;
        
        let icon = getFleaItemIcon(data.itemId, data.itemData);
        icon = icon.replace(/width="20"/g, 'width="32"').replace(/height="20"/g, 'height="32"');
        
        const desc = getFleaItemDesc(data.itemId, data.itemData);
        let shortDesc = '';
        if (desc && data.itemId.includes('@')) {
            const words = desc.split(' ');
            shortDesc = words.slice(0, 30).join(' ') + (words.length > 30 ? '...' : '');
        }
        
        let rarityBadge = '';
        if (data.itemId.startsWith('unique@') && data.itemData && data.itemData.rarity) {
            rarityBadge = `<span style="display:inline-block; white-space:nowrap; font-size:10px; padding:2px 6px; border-radius:4px; background:${data.itemData.color || '#ff8000'}; color:#fff; margin-left:8px; vertical-align:middle; text-transform:uppercase;">${data.itemData.rarity}</span>`;
        }

        html += `
            <div class="flea-item ${isMine ? 'mine' : ''}">
                <div style="display:flex; flex:1; align-items:center; cursor:pointer;" onclick="FarmAll.showFleaItemDetail('${docSnapId}')">
                    <div class="flea-item-icon" style="margin-right: 12px; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">${icon}</div>
                    <div class="flea-item-info">
                        <div class="flea-item-name">${itemName} x${data.amount}${rarityBadge}</div>
                        <div class="flea-item-seller" style="font-size: 11px; color: #777; margin-top: 2px;">Người bán: ${item.sellerName}</div>
                        ${shortDesc ? `<div style="font-size: 10px; color: #555; margin-top: 2px; font-style: italic;">${shortDesc}</div>` : ''}
                    </div>
                </div>
                <div class="flea-item-action" style="min-width: 80px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end;">
                    <div class="flea-item-price">${data.price} G</div>
                    ${isMine ? 
                        `<button class="btn flea-cancel" data-id="${docSnapId}">Gỡ Xuống</button>` :
                        `<button class="btn flea-buy" data-id="${docSnapId}" data-price="${data.price}" data-name="${itemName}">Mua</button>`
                    }
                </div>
            </div>
        `;
    });
    
    if (html === '') html = '<div class="empty-market">Không tìm thấy món đồ nào.</div>';
    listEl.innerHTML = html;
    
    // Gắn sự kiện
    listEl.querySelectorAll('.flea-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemName = e.target.dataset.name;
            const price = parseInt(e.target.dataset.price);
            const docId = e.target.dataset.id;
            
            const cfmUi = All.$id('flea-confirm-act');
            if (cfmUi) {
                All.$id('lbl-flea-cfm-msg').innerHTML = `Bạn có chắc chắn muốn mua <b>${itemName}</b> với giá <b style="color:#d32f2f;">${price} G</b> không?`;
                cfmUi.style.display = 'flex';
                All.$id('btn-flea-cfm-yes').onclick = () => {
                    cfmUi.style.display = 'none';
                    buyItem(docId, price);
                };
            } else {
                // Fallback to browser confirm
                if (confirm(`Bạn có chắc chắn muốn mua "${itemName}" với giá ${price} G không?`)) {
                    buyItem(docId, price);
                }
            }
        });
    });
    listEl.querySelectorAll('.flea-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => cancelItem(e.target.dataset.id));
    });
}

async function buyItem(docId, price) {
    if (ctx.S.coins < price) {
        All.toast("Không đủ vàng!");
        return;
    }
    
    try {
        const { getDoc } = await import('firebase/firestore');
        const docRef = doc(db, "flea_market", docId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists() || docSnap.data().status !== 'active') {
            All.toast("Món hàng này đã bị người khác mua mất hoặc bị gỡ!");
            loadFleaList();
            return;
        }
        
        const data = docSnap.data();
        
        // Đổi trạng thái sang sold trên server trước để chốt giao dịch
        await updateDoc(docRef, { 
            status: 'sold',
            buyerName: ctx.S.username || "Người mua ẩn danh"
        });
        
        // Giao dịch server thành công mới trừ tiền và nhận đồ ở local
        ctx.S.coins -= price;
        
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
        All.renderStatus();
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
        
        if (!docSnap.exists() || docSnap.data().status !== 'active') {
            All.toast("Không thể gỡ! Món hàng này có thể đã được người khác mua.");
            loadFleaList();
            return;
        }
        
        const data = docSnap.data();
        
        // Xóa trên server TRƯỚC để tránh clone đồ nếu rớt mạng
        await deleteDoc(docRef);
        
        // Hoàn trả đồ về kho
        if (data.itemType === 'uniques') {
            if (!ctx.S.uniques) ctx.S.uniques = {};
            ctx.S.uniques[data.itemId] = data.itemData;
            ctx.S.bag[data.itemId] = (ctx.S.bag[data.itemId] || 0) + data.amount;
        } else {
            if (!ctx.S[data.itemType]) ctx.S[data.itemType] = {};
            ctx.S[data.itemType][data.itemId] = (ctx.S[data.itemType][data.itemId] || 0) + data.amount;
        }
        
        All.save();
        All.toast("Đã gỡ món hàng xuống");
        loadFleaList();
    } catch (e) {
        All.toast("Lỗi khi gỡ hàng: " + e.message);
    }
}

async function renderHistory() {
    if (All.$id('trade-win-title')) All.$id('trade-win-title').innerText = 'Lịch Sử Giao Dịch';
    const body = All.$id('trade-body');
    body.innerHTML = `
        <div class="flea-header" style="justify-content: flex-end;">
            <button id="flea-back-hist" class="btn">Quay lại Chợ</button>
        </div>
        <div id="flea-hist-list" style="margin-top: 10px; max-height: 400px; overflow-y: auto;">Đang tải...</div>
    `;
    
    All.$id('flea-back-hist').addEventListener('click', renderFleaMarket);
    
    const listEl = All.$id('flea-hist-list');
    
    try {
        const q = query(collection(db, "flea_market"), where("sellerId", "==", ctx.S.playerId), where("status", "==", "sold"));
        const snapshot = await getDocs(q);
        
        let html = '';
        let totalGold = 0;
        let soldDocs = [];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            soldDocs.push({ id: docSnap.id, ...data });
            totalGold += data.price;
            
            const itemName = getFleaItemName(data.itemId, data.itemData);
            let icon = getFleaItemIcon(data.itemId, data.itemData);
            icon = icon.replace(/width="20"/g, 'width="32"').replace(/height="20"/g, 'height="32"');

            html += `
                <div class="flea-item" style="border-color: #4caf50; background: #e8f5e9;">
                    <div class="flea-item-icon" style="margin-right: 12px; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">${icon}</div>
                    <div class="flea-item-info">
                        <div class="flea-item-name">${itemName} x${data.amount}</div>
                        <div class="flea-item-seller" style="font-size: 11px; color: #2e7d32; margin-top: 2px;">Người mua: ${data.buyerName || "Người mua ẩn danh"}</div>
                    </div>
                    <div class="flea-item-action">
                        <div class="flea-item-price" style="color: #2e7d32;">+${data.price} G</div>
                        <button class="btn flea-claim-one" data-id="${docSnap.id}" data-price="${data.price}">Nhận</button>
                    </div>
                </div>
            `;
        });

        if (html === '') {
            html = '<div class="empty-market">Không có giao dịch nào chưa nhận tiền.</div>';
        } else {
            html += `
                <div style="margin-top: 15px; text-align: center;">
                    <button class="buy" id="flea-claim-all" style="width: 100%; padding: 10px; font-size: 14px;">Nhận tất cả (+${totalGold} G)</button>
                </div>
            `;
        }
        
        listEl.innerHTML = html;

        listEl.querySelectorAll('.flea-claim-one').forEach(btn => {
            btn.onclick = async (e) => {
                const btnEl = e.target;
                btnEl.disabled = true;
                btnEl.innerText = 'Đang nhận...';
                const docId = btnEl.dataset.id;
                const price = parseInt(btnEl.dataset.price);
                
                try {
                    await deleteDoc(doc(db, "flea_market", docId));
                    ctx.S.coins += price;
                    All.save();
                    All.renderStatus();
                    All.toast(`Đã nhận ${price} Vàng!`);
                    renderHistory(); // Reload
                } catch(err) {
                    All.toast("Lỗi nhận tiền!");
                    btnEl.disabled = false;
                }
            };
        });

        const claimAllBtn = All.$id('flea-claim-all');
        if (claimAllBtn) {
            claimAllBtn.onclick = async () => {
                claimAllBtn.disabled = true;
                claimAllBtn.innerText = 'Đang xử lý...';
                let claimed = 0;
                for (let d of soldDocs) {
                    try {
                        await deleteDoc(doc(db, "flea_market", d.id));
                        claimed += d.price;
                    } catch(err) {
                        console.error("Lỗi xóa doc", err);
                    }
                }
                if (claimed > 0) {
                    ctx.S.coins += claimed;
                    All.save();
                    All.renderStatus();
                    All.toast(`Đã nhận tổng cộng ${claimed} Vàng!`);
                }
                renderHistory();
            };
        }
        
    } catch (e) {
        console.error("Lỗi tải lịch sử:", e);
        listEl.innerHTML = '<div class="empty-market">Lỗi kết nối.</div>';
    }
}

function getFleaItemName(id, itemData = null) {
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
        return itemData?.name || ctx.S.uniques?.[id]?.name || 'Bảo vật bí ẩn';
    }
    if (id.includes('@')) {
        const parts = id.split('@');
        return `[Đột biến ${parts[0]}] ${CROPS[parts[1]]?.name || id}`;
    }
    return CROPS[id]?.name || id;
}

function getFleaItemIcon(id, itemData = null) {
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
        const item = itemData || ctx.S.uniques?.[id] || { sp: 'strawhat', color: '#4a90e2' };
        if (item.spriteMap && item.sp) {
            All.registerDynamicSprite(item.sp, item.spriteMap);
        }
        return `<span style="color:${item.color}">${All.spriteSVG(item.sp, 20)}</span>`;
    }
    if (id.includes('@')) {
        const parts = id.split('@');
        return All.spriteSVG(CROPS[parts[1]]?.sp || 'sprout', 20);
    }
    if (CROPS && CROPS[id]) return All.spriteSVG(CROPS[id].sp || id, 20);
    return '';
}

function getFleaItemDesc(id, itemData = null) {
    if (id === 'coins') return 'Tiền tệ chung của Nông trại.';
    if (id === 'norm') return 'Vé quay gacha thường.';
    if (id === 'spec') return 'Vé quay gacha đặc biệt.';
    if (id === 'super') return 'Vé quay gacha siêu cấp.';
    if (id === 'prism') return 'Mảnh ghép quý hiếm dùng để đổi phần thưởng lớn.';
    if (id === 'star') return 'Mảnh ghép nâng cấp đặc biệt.';
    if (id === 'legend') return 'Mảnh ghép huyền thoại cực hiếm.';
    if (id === 'compost') return 'Giảm 25% thời gian phát triển của cây trồng.';
    if (id === 'shiny') return 'Tăng 50% tốc độ lớn và tăng 25% tỷ lệ đột biến.';
    if (id.startsWith('unique@')) {
        return itemData?.desc || ctx.S.uniques?.[id]?.desc || 'Một bảo vật bí ẩn không rõ nguồn gốc.';
    }
    if (id.includes('@')) {
        const parts = id.split('@');
        return CROPS[parts[1]]?.desc || 'Cây trồng đột biến đặc biệt.';
    }
    return CROPS[id]?.desc || 'Vật phẩm nông trại.';
}

let selectedFleaType = null;
let selectedFleaId = null;
let selectedFleaMax = 0;

export function uiSelectFleaAdd(type, id, max) {
    selectedFleaType = type;
    selectedFleaId = id;
    selectedFleaMax = max;
    All.$id('flea-post-act').style.display = 'flex';
    let iconStr = getFleaItemIcon(id);
    iconStr = iconStr.replace(/width="20"/g, 'width="48"').replace(/height="20"/g, 'height="48"');
    All.$id('lbl-flea-sel-icon').innerHTML = iconStr;
    All.$id('lbl-flea-sel-name').innerText = getFleaItemName(id);
    All.$id('lbl-flea-sel-desc').innerText = getFleaItemDesc(id);
    All.$id('flea-post-amount').value = 1;
    All.$id('flea-post-amount').max = max;
}

function renderPostItem() {
    let catBag = '';
    let catGacha = '';
    if (ctx.S.bag) {
        Object.entries(ctx.S.bag).forEach(([k, v]) => {
            if (v > 0) {
                if (k.startsWith('unique@')) catGacha += `<div class="trade-pick" onclick="FarmAll.uiSelectFleaAdd('uniques', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
                else catBag += `<div class="trade-pick" onclick="FarmAll.uiSelectFleaAdd('bag', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
            }
        });
    }
    
    let catSeeds = '';
    if (ctx.S.seeds) {
        Object.entries(ctx.S.seeds).forEach(([k, v]) => {
            if (v > 0) catSeeds += `<div class="trade-pick" onclick="FarmAll.uiSelectFleaAdd('seeds', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
        });
    }

    let catFerts = '';
    if (ctx.S.ferts) {
        Object.entries(ctx.S.ferts).forEach(([k, v]) => {
            if (v > 0) catFerts += `<div class="trade-pick" onclick="FarmAll.uiSelectFleaAdd('ferts', '${k}', ${v})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${v})</div>`;
        });
    }

    let catTickets = '';
    ['norm', 'spec', 'super'].forEach(k => { if (ctx.S.tickets && ctx.S.tickets[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.uiSelectFleaAdd('tickets', '${k}', ${ctx.S.tickets[k]})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${ctx.S.tickets[k]})</div>`; });
    ['prism', 'star', 'legend'].forEach(k => { if (ctx.S.shards && ctx.S.shards[k] > 0) catTickets += `<div class="trade-pick" onclick="FarmAll.uiSelectFleaAdd('shards', '${k}', ${ctx.S.shards[k]})">${getFleaItemIcon(k)} ${getFleaItemName(k)} (Có: ${ctx.S.shards[k]})</div>`; });

    if (All.$id('trade-win-title')) All.$id('trade-win-title').innerText = 'Đăng Bán Sản Phẩm';

    let html = '';
    if (catBag) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">NÔNG SẢN</div>` + catBag;
    if (catSeeds) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">HẠT GIỐNG</div>` + catSeeds;
    if (catFerts) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">PHÂN BÓN</div>` + catFerts;
    if (catTickets) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">VÉ & MẢNH</div>` + catTickets;
    if (catGacha) html += `<div style="font-size:11px; font-weight:bold; color:#7a5c38; margin-top:4px; width:100%;">ĐỒ GACHA</div>` + catGacha;

    All.$id('trade-body').innerHTML = `
        <div class="flea-header" style="justify-content: flex-end;">
            <button id="flea-back" class="btn">Quay lại Chợ</button>
        </div>
        <div class="flea-post-form" style="margin-top:10px; position:relative;">
            <input type="text" id="flea-search" placeholder="Tìm kiếm món đồ..." style="width:100%; padding:6px; margin-bottom:8px; border:2px inset #c9a273; border-radius:4px; box-sizing:border-box;">
            <div id="flea-post-list" style="display:flex; flex-wrap:wrap; gap:6px; max-height:350px; overflow-y:auto; padding:10px; border:2px inset #c9a273; background:rgba(0,0,0,0.05); border-radius:8px;">
                ${html || '<div style="width:100%; text-align:center; color:#a3763d; font-style:italic;">Không có đồ để đăng bán</div>'}
            </div>
            
            <div id="flea-post-act" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:99; border-radius: 8px;">
                <div style="background:#fffaf0; padding:20px; border:3px solid #c9a273; border-radius:12px; width:85%; max-width:320px; display:flex; flex-direction:column; gap:12px; position:relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                    <button onclick="FarmAll.$id('flea-post-act').style.display='none'" style="position:absolute; top:8px; right:10px; background:none; border:none; font-weight:bold; cursor:pointer; color:#7a5c38; font-size:16px;">✕</button>
                    
                    <div style="display:flex; gap:15px; align-items:center;">
                        <div id="lbl-flea-sel-icon" style="font-size:32px; background:#f0e6d2; padding:10px; border-radius:8px; border:1px solid #d4b895; display:flex; justify-content:center; align-items:center; width:64px; height:64px;"></div>
                        <div style="flex:1;">
                            <div id="lbl-flea-sel-name" style="font-size:15px; font-weight:bold; color:#d32f2f; margin-bottom:5px;"></div>
                            <div id="lbl-flea-sel-desc" style="font-size:11px; color:#555; line-height:1.3;"></div>
                        </div>
                    </div>
                    
                    <hr style="border:0; border-top:1px dashed #d4b895; margin:5px 0;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label style="font-size:13px; font-weight:bold; color:#6b4f2e;">Số lượng bán:</label>
                        <input type="number" id="flea-post-amount" class="inp" min="1" value="1" style="width:100px;">
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label style="font-size:13px; font-weight:bold; color:#6b4f2e;">Giá tổng (Vàng):</label>
                        <input type="number" id="flea-post-price" class="inp" min="1" value="10" style="width:100px;">
                    </div>
                    
                    <button id="flea-post-submit" class="buy" style="margin-top: 5px; width: 100%; text-align:center; padding: 10px; font-size: 14px;">Xác nhận Đăng Bán</button>
                </div>
            </div>
        </div>
    `;
    
    All.$id('flea-search')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const list = All.$id('flea-post-list');
        const picks = list.querySelectorAll('.trade-pick');
        picks.forEach(p => {
            if (p.textContent.toLowerCase().includes(query)) p.style.display = 'block';
            else p.style.display = 'none';
        });
        // Ẩn tiêu đề nếu không có món đồ nào hiển thị dưới nó
        Array.from(list.children).forEach(el => {
            if (!el.classList.contains('trade-pick')) {
                // el is a header
                let next = el.nextElementSibling;
                let hasVisible = false;
                while (next && next.classList.contains('trade-pick')) {
                    if (next.style.display !== 'none') {
                        hasVisible = true;
                        break;
                    }
                    next = next.nextElementSibling;
                }
                el.style.display = hasVisible ? 'block' : 'none';
            }
        });
    });

    All.$id('flea-back').addEventListener('click', renderFleaMarket);
    
    All.$id('flea-post-submit').addEventListener('click', async (e) => {
        const btnEl = e.currentTarget;
        if (btnEl.disabled) return;
        
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
        
        btnEl.disabled = true;
        btnEl.innerText = 'Đang xử lý...';
        
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
            btnEl.disabled = false;
            btnEl.innerText = 'Xác nhận Đăng Bán';
        }
    });
}

export function showFleaItemDetail(docId) {
    const data = currentFleaItems[docId];
    if (!data) return;
    
    const name = getFleaItemName(data.itemId, data.itemData);
    let desc = getFleaItemDesc(data.itemId, data.itemData);
    let iconStr = getFleaItemIcon(data.itemId, data.itemData);
    iconStr = iconStr.replace(/width="20"/g, 'width="48"').replace(/height="20"/g, 'height="48"');
    
    const ui = All.$id('flea-detail-act');
    if (!ui) return;
    
    let extraHtml = '';
    if (data.itemId.startsWith('unique@') && data.itemData && data.itemData.rarity) {
        extraHtml = `<div style="font-size:12px; font-weight:bold; color:${data.itemData.color || '#ff8000'}; margin-bottom:5px;">Độ hiếm: ${data.itemData.rarity}</div>`;
    }
    
    All.$id('lbl-flea-dtl-icon').innerHTML = iconStr;
    All.$id('lbl-flea-dtl-name').innerText = name;
    
    const extraEl = All.$id('lbl-flea-dtl-extra');
    if (extraEl) extraEl.innerHTML = extraHtml;
    
    All.$id('lbl-flea-dtl-desc').innerText = desc || "Không có thông tin chi tiết.";
    
    ui.style.display = 'flex';
}
