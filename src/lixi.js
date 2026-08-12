import { ctx } from './store.js';
import * as All from './all.js';
import { db } from './firebase.js';
import { collection, addDoc, getDocs, doc, query, orderBy, runTransaction, deleteDoc, limit } from 'firebase/firestore';

export async function openLixiModal() {
    if (!db) {
        All.toast("Hệ thống Lì Xì yêu cầu cấu hình Firebase. Vui lòng thêm config vào .env");
        return;
    }
    renderLixiUI();
}

function renderLixiUI() {
    let win = All.$id('lixi-win');
    if (!win) {
        win = document.createElement('div');
        win.id = 'lixi-win';
        win.className = 'modal';
        win.style.zIndex = '9999';
        All.$id('win').appendChild(win);
    }
    
    win.innerHTML = `
      <div class="mpanel" style="width: min(400px, 96%);">
        <div class="mtitle"><span id="lixi-win-title" style="display:flex; align-items:center; gap:8px;">${All.spriteSVG('lixiIcon', 18)} Chợ Lì Xì</span><span class="grow"></span><div class="close-x" id="lixi-close">×</div></div>
        <div class="mbody" style="min-height: 200px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
            <div class="pager open" style="margin:0 auto; display:flex; position:static;">
                <div class="ptab active" id="lixi-tab-list" style="cursor:pointer; flex:1; text-align:center; display:flex; align-items:center; justify-content:center; white-space:nowrap;">Nhận Lì Xì</div>
                <div class="ptab" id="lixi-tab-send" style="cursor:pointer; flex:1; text-align:center; display:flex; align-items:center; justify-content:center; white-space:nowrap;">Phát Lì Xì</div>
            </div>
            <div id="lixi-body" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                <!-- Nội dung tab -->
            </div>
        </div>
      </div>
    `;
    
    win.classList.add('open');
    
    All.$id('lixi-close').addEventListener('click', () => {
        win.classList.remove('open');
    });
    
    All.$id('lixi-tab-list').addEventListener('click', () => switchLixiTab('list'));
    All.$id('lixi-tab-send').addEventListener('click', () => switchLixiTab('send'));
    
    switchLixiTab('list');
}

let currentLixiTab = 'list';

function switchLixiTab(tab) {
    currentLixiTab = tab;
    const listTab = All.$id('lixi-tab-list');
    const sendTab = All.$id('lixi-tab-send');
    if (tab === 'list') {
        listTab.classList.add('active');
        sendTab.classList.remove('active');
        renderLixiList();
    } else {
        sendTab.classList.add('active');
        listTab.classList.remove('active');
        renderLixiSend();
    }
}

async function renderLixiList() {
    const body = All.$id('lixi-body');
    body.innerHTML = '<div style="text-align:center; padding:20px;">Đang tải danh sách Lì xì...</div>';
    
    try {
        const q = query(collection(db, "red_envelopes"), orderBy("createdAt", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        let html = '';
        let now = Date.now();
        
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Xoá lì xì đã cạn sau 1 tiếng
            if (data.remainingAmount <= 0) {
                if (data.emptyAt && (now - data.emptyAt > 3600000)) {
                    // Dọn rác
                    deleteDoc(doc(db, "red_envelopes", id)).catch(e => console.error(e));
                    continue; // Không hiển thị nữa
                }
            }
            
            const isMine = data.senderId === ctx.S.playerId;
            const hasClaimed = data.claimedBy && data.claimedBy.includes(ctx.S.playerId);
            const isEmpty = data.remainingAmount <= 0;
            
            let statusHTML = '';
            if (isEmpty) {
                statusHTML = '<span style="color:#6b7280; font-weight:bold;">Đã cạn</span>';
            } else if (hasClaimed) {
                statusHTML = '<span style="color:#10b981; font-weight:bold;">Đã nhận</span>';
            } else if (isMine) {
                statusHTML = `<div class="buy plain">Của bạn</div>`;
            } else {
                statusHTML = `<div class="buy" style="border-color:#dd5548; box-shadow:0 3px 0 #a33528;" onclick="window['grabLixi']('${id}')">Giật</div>`;
            }
            
            html += `
                <div class="field" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-radius:8px;">
                    <div>
                        <div style="font-weight:bold; font-size:14px; color:#ffb0bc; text-shadow: 0 1px 1px #000;">${data.senderName}</div>
                        <div style="font-size:12px; opacity:0.8;">Còn lại: ${data.remainingAmount.toLocaleString()}G</div>
                    </div>
                    <div>
                        ${statusHTML}
                    </div>
                </div>
            `;
        }
        
        if (!html) html = '<div style="text-align:center; padding:20px; color:#6b7280;">Hiện chưa có bao Lì xì nào!</div>';
        body.innerHTML = html;
        
    } catch (e) {
        console.error(e);
        body.innerHTML = '<div style="text-align:center; padding:20px; color:#dc2626;">Lỗi tải dữ liệu.</div>';
    }
}

function renderLixiSend() {
    const body = All.$id('lixi-body');
    const myCoins = ctx.S.coins || 0;
    
    body.innerHTML = `
        <div class="field" style="padding:10px; display:flex; flex-direction:column; gap:8px; color:#3a2c22;">
            <div style="font-size:12px; opacity:0.8;">Ví của bạn: <b>${myCoins.toLocaleString()}G</b></div>
            
            <label style="font-weight:bold; font-size:14px;">Tổng Vàng Lì xì:</label>
            <input type="number" id="lixi-inp-total" class="inp" style="width:100%; margin-bottom:12px;" placeholder="Ví dụ: 100000" min="1000">
            
            <div class="buy" id="lixi-btn-send" style="text-align:center; border-color:#dd5548; box-shadow:0 3px 0 #a33528; color:#fffdf4;">Phát Lì Xì Toàn Server</div>
        </div>
    `;
    
    All.$id('lixi-btn-send').addEventListener('click', async () => {
        const total = parseInt(All.$id('lixi-inp-total').value);
        
        if (isNaN(total) || total <= 0) return All.toast('Số tiền không hợp lệ!');
        if (total < 100) return All.toast('Tối thiểu phải phát 100G!');
        if (total > ctx.S.coins) return All.toast('Bạn không đủ tiền!');
        
        // Trừ tiền
        ctx.S.coins -= total;
        All.save();
        All.renderStatus();
        
        All.toast('Đang tạo Lì xì...');
        try {
            await addDoc(collection(db, "red_envelopes"), {
                senderId: ctx.S.playerId,
                senderName: ctx.S.username || 'Người ẩn danh',
                totalAmount: total,
                remainingAmount: total,
                claimedBy: [],
                createdAt: Date.now(),
                emptyAt: null
            });
            All.toast('Đã phát Lì xì thành công!');
            switchLixiTab('list');
        } catch (e) {
            console.error(e);
            All.toast('Lỗi tạo lì xì!');
            // Trả lại tiền
            ctx.S.coins += total;
            All.save();
            All.renderStatus();
        }
    });
}

window['grabLixi'] = async function(lixiId) {
    if (!db || !ctx.S.playerId) return;
    
    const docRef = doc(db, "red_envelopes", lixiId);
    All.toast('Đang giật...');
    
    try {
        const result = await runTransaction(db, async (transaction) => {
            const lixiDoc = await transaction.get(docRef);
            if (!lixiDoc.exists()) {
                throw "Lì xì không tồn tại!";
            }
            
            const data = lixiDoc.data();
            
            if (data.remainingAmount <= 0) {
                throw "Lì xì đã cạn tiền!";
            }
            
            if (data.claimedBy && data.claimedBy.includes(ctx.S.playerId)) {
                throw "Bạn đã nhận lì xì này rồi!";
            }
            
            if (data.senderId === ctx.S.playerId) {
                throw "Không thể tự giật lì xì của mình!";
            }
            
            // Lấy ngẫu nhiên từ 3% đến 14% tổng số TIỀN GỐC
            let grabAmount = 0;
            const min = Math.max(1, Math.floor(data.totalAmount * 0.03));
            const max = Math.max(min, Math.floor(data.totalAmount * 0.14));
            grabAmount = Math.floor(Math.random() * (max - min + 1)) + min;
            
            // Không thể lấy nhiều hơn số tiền còn lại trong bao
            if (grabAmount > data.remainingAmount) {
                grabAmount = data.remainingAmount;
            }
            
            grabAmount = Math.min(grabAmount, data.remainingAmount);
            
            const newRemaining = data.remainingAmount - grabAmount;
            const newClaimedBy = data.claimedBy || [];
            newClaimedBy.push(ctx.S.playerId);
            
            let updateData = {
                remainingAmount: newRemaining,
                claimedBy: newClaimedBy
            };
            
            if (newRemaining <= 0 && !data.emptyAt) {
                updateData.emptyAt = Date.now();
            }
            
            transaction.update(docRef, updateData);
            
            return grabAmount;
        });
        
        ctx.S.coins = (ctx.S.coins || 0) + result;
        All.save();
        All.renderStatus();
        
        All.toast(`Giật thành công ${result.toLocaleString()}G!`);
        renderLixiList(); // Refresh
        
    } catch (e) {
        console.error("Lixi Error:", e);
        All.toast(typeof e === 'string' ? e : "Giật Lì xì thất bại!");
        renderLixiList(); // Refresh
    }
};
