import { ctx } from './store.js';
import * as All from './all.js';
import { db } from './firebase.js';
import { collection, addDoc, getDocs, doc, query, orderBy, runTransaction, deleteDoc } from 'firebase/firestore';

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
        win.className = 'modal-window';
        win.style.display = 'none';
        win.style.zIndex = '9999';
        All.sh.appendChild(win);
    }
    
    win.innerHTML = `
        <div class="modal-content" style="max-width:400px; padding:0; background:#fffdf4; border: 2px solid #dc2626; border-radius:12px; overflow:hidden;">
            <div style="background:#dc2626; color:#fff; padding:12px 16px; font-size:18px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                <span>🧧 Chợ Lì Xì</span>
                <span id="lixi-close" style="cursor:pointer; font-size:20px;">&times;</span>
            </div>
            <div style="padding:16px;">
                <div class="tabs" style="display:flex; gap:8px; margin-bottom:16px;">
                    <div class="tab active" id="lixi-tab-list" style="flex:1; text-align:center; padding:8px; background:#dc2626; color:#fff; cursor:pointer; border-radius:4px;">Nhận Lì Xì</div>
                    <div class="tab" id="lixi-tab-send" style="flex:1; text-align:center; padding:8px; background:#e5e7eb; color:#374151; cursor:pointer; border-radius:4px;">Phát Lì Xì</div>
                </div>
                <div id="lixi-body" style="min-height:200px; max-height:400px; overflow-y:auto;">
                    <!-- Nội dung tab -->
                </div>
            </div>
        </div>
    `;
    
    win.style.display = 'flex';
    
    All.$id('lixi-close').addEventListener('click', () => {
        win.style.display = 'none';
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
        listTab.style.background = '#dc2626'; listTab.style.color = '#fff';
        sendTab.style.background = '#e5e7eb'; sendTab.style.color = '#374151';
        renderLixiList();
    } else {
        sendTab.style.background = '#dc2626'; sendTab.style.color = '#fff';
        listTab.style.background = '#e5e7eb'; listTab.style.color = '#374151';
        renderLixiSend();
    }
}

async function renderLixiList() {
    const body = All.$id('lixi-body');
    body.innerHTML = '<div style="text-align:center; padding:20px;">Đang tải danh sách Lì xì...</div>';
    
    try {
        const q = query(collection(db, "red_envelopes"), orderBy("createdAt", "desc"));
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
                statusHTML = `<button class="buy plain" disabled>Của bạn</button>`;
            } else {
                statusHTML = `<button class="buy" style="background:#dc2626; color:#fff;" onclick="window.grabLixi('${id}')">Giật</button>`;
            }
            
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#fee2e2; padding:12px; margin-bottom:8px; border-radius:8px; border:1px solid #fca5a5;">
                    <div>
                        <div style="font-weight:bold; color:#991b1b; font-size:16px;">${data.senderName}</div>
                        <div style="font-size:12px; color:#b91c1c;">Còn lại: ${data.remainingAmount.toLocaleString()}G</div>
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
        <div style="padding:10px;">
            <div style="margin-bottom:12px;">Ví của bạn: <b>${myCoins.toLocaleString()}G</b></div>
            
            <label style="display:block; margin-bottom:4px; font-weight:bold;">Tổng Vàng Lì xì:</label>
            <input type="number" id="lixi-inp-total" class="num-input" style="width:100%; margin-bottom:12px;" placeholder="Ví dụ: 100000" min="1000">
            
            <button class="buy" id="lixi-btn-send" style="width:100%; background:#dc2626; color:#fff; font-size:16px; padding:10px;">Phát Lì Xì Toàn Server</button>
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
                senderName: ctx.S.name || 'Người ẩn danh',
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
            
            // Lấy ngẫu nhiên từ 10% đến 50% số tiền còn lại, hoặc lấy hết nếu còn ít
            let grabAmount = 0;
            if (data.remainingAmount <= 50) {
                grabAmount = data.remainingAmount;
            } else {
                const min = Math.max(1, Math.floor(data.remainingAmount * 0.1));
                const max = Math.floor(data.remainingAmount * 0.5);
                grabAmount = Math.floor(Math.random() * (max - min + 1)) + min;
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
