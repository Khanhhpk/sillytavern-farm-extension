import { ctx, extensionName, NS } from './store.js';
import * as All from './all.js';
import { Peer } from 'peerjs';

let syncPeer = null;
let syncConn = null;

function cleanupSync() {
    if (syncConn) { syncConn.close(); syncConn = null; }
    if (syncPeer) { syncPeer.destroy(); syncPeer = null; }
}

export function openSyncHostModal() {
    cleanupSync();
    
    All.openModal('Cấp Mã (Gửi Save)', `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 10px; text-align: center;">
            <div style="font-size: 14px; color: #d32f2f; font-weight: bold; background: #ffebee; padding: 10px; border-radius: 8px;">
                CẢNH BÁO: Bạn sắp TẠO mã để chuyển bản save này đi. Thiết bị khác khi nhập mã này sẽ BỊ ĐÈ toàn bộ save bằng save hiện tại của bạn. Cẩn thận không để lộ mã!
            </div>
            <div id="sync-host-status" style="font-size: 14px; color: #7a5c38; font-weight: bold; margin-top: 10px;">Đang tạo phòng...</div>
            <div id="sync-host-code" style="font-size: 20px; font-weight: bold; color: #e91e63; user-select: all; background: #fce4ec; padding: 10px; border-radius: 8px; border: 2px dashed #f06292; display: none;"></div>
            <div class="buy plain" onclick="FarmAll.closeModal()" style="padding: 8px; margin-top: 10px; text-align:center;">Đóng</div>
        </div>
    `);

    const roomId = 'fsync-' + Math.random().toString(36).substr(2, 6);
    syncPeer = new Peer(roomId);
    
    syncPeer.on('open', (id) => {
        const codeEl = All.$id('sync-host-code');
        const statusEl = All.$id('sync-host-status');
        if (codeEl) {
            codeEl.textContent = id;
            codeEl.style.display = 'block';
        }
        if (statusEl) {
            statusEl.textContent = 'Phòng đã tạo! Gửi mã này cho máy cần nhận save.';
            statusEl.style.color = '#388e3c';
        }
    });

    syncPeer.on('connection', (connection) => {
        if (syncConn) {
            connection.on('open', () => {
                connection.send({ type: 'ROOM_FULL' });
                setTimeout(() => connection.close(), 500);
            });
            return;
        }
        syncConn = connection;
        const statusEl = All.$id('sync-host-status');
        if (statusEl) {
            statusEl.textContent = 'Máy khác đã kết nối! Đang gửi dữ liệu...';
            statusEl.style.color = '#1976d2';
        }
        
        syncConn.on('open', () => {
            syncConn.send({ type: 'FULL_SAVE', data: ctx.S });
            if (statusEl) {
                statusEl.textContent = 'Đã gửi save thành công!';
                statusEl.style.color = '#4caf50';
            }
            All.toast('Gửi save thành công!');
            setTimeout(() => {
                cleanupSync();
                All.closeModal();
            }, 3000);
        });
    });

    syncPeer.on('error', (err) => {
        const statusEl = All.$id('sync-host-status');
        if (statusEl) {
            statusEl.textContent = 'Lỗi: ' + err.type;
            statusEl.style.color = '#d32f2f';
        }
    });
}

export function openSyncJoinModal() {
    cleanupSync();
    
    All.openModal('Nhập Mã (Nhận Save)', `
        <div style="display:flex; flex-direction:column; gap: 15px; padding: 10px; text-align: center;">
            <div style="font-size: 14px; color: #d32f2f; font-weight: bold; background: #ffebee; padding: 10px; border-radius: 8px;">
                CẢNH BÁO ĐỎ: Nhập mã sẽ GHI ĐÈ XÓA SẠCH toàn bộ dữ liệu hiện tại trên máy này (kể cả ID) bằng dữ liệu mới. Hãy chắc chắn trước khi bấm Nhận!
            </div>
            <input type="text" id="sync-join-code" placeholder="Nhập mã (VD: fsync-abcdef)" class="inp" style="text-align:center; font-size: 16px; font-weight:bold; letter-spacing: 1px;">
            <div id="sync-join-status" style="font-size: 14px; color: #7a5c38; font-weight: bold;"></div>
            <div style="display:flex; gap:10px; margin-top: 10px;">
                <div class="buy" onclick="FarmAll.executeSyncJoin()" style="flex:1; text-align:center;">Nhận Save</div>
                <div class="buy plain" onclick="FarmAll.closeModal()" style="flex:1; text-align:center;">Huỷ</div>
            </div>
        </div>
    `);
}

export function executeSyncJoin() {
    // @ts-ignore
    const codeEl = All.$id('sync-join-code');
    const code = codeEl ? codeEl.value.trim() : '';
    const statusEl = All.$id('sync-join-status');
    
    if (!code) {
        if (statusEl) { statusEl.textContent = 'Vui lòng nhập mã phòng!'; statusEl.style.color = '#d32f2f'; }
        return;
    }
    if (statusEl) { statusEl.textContent = 'Đang kết nối...'; statusEl.style.color = '#7a5c38'; }
    
    cleanupSync();
    syncPeer = new Peer();
    
    syncPeer.on('open', () => {
        syncConn = syncPeer.connect(code, { reliable: true });
        syncConn.on('open', () => {
            if (statusEl) { statusEl.textContent = 'Đã kết nối! Đang tải save về...'; statusEl.style.color = '#1976d2'; }
        });
        
        syncConn.on('data', (data) => {
            if (data && data.type === 'ROOM_FULL') {
                if (statusEl) { statusEl.textContent = 'Mã này đang bận (có người khác đang đồng bộ)!'; statusEl.style.color = '#d32f2f'; }
                syncConn.close();
                return;
            }
            if (data && data.type === 'FULL_SAVE' && data.data) {
                if (statusEl) { statusEl.textContent = 'Đã nhận save! Đang áp dụng...'; statusEl.style.color = '#4caf50'; }
                
                if (!ctx.extension_settings[extensionName]) ctx.extension_settings[extensionName] = {};
                ctx.extension_settings[extensionName][NS] = data.data;
                
                All.loadState();
                All.save(true);
                All.closeModal();
                All.renderAll();
                All.toast('Đồng bộ save thành công rực rỡ!');
                cleanupSync();
            }
        });
        
        syncConn.on('error', (err) => {
            if (statusEl) { statusEl.textContent = 'Lỗi kết nối!'; statusEl.style.color = '#d32f2f'; }
        });
    });
    
    syncPeer.on('error', (err) => {
        if (statusEl) { statusEl.textContent = 'Lỗi: ' + err.type; statusEl.style.color = '#d32f2f'; }
    });
}
