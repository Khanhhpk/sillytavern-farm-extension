import { ctx } from './store.js';
import * as All from './all.js';

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const INTEREST_RATE = 0.01; // 1% per 4 hours for deposit
const LOAN_INTEREST_RATE = 0.02; // 2% per 4 hours for normal loan over limit? Wait, spec didn't specify loan interest rate, I will set 2% per 4 hours
const EMERGENCY_LOAN_INTEREST = 0.1; // 10% for emergency
const LOAN_DURATION = FOUR_HOURS; // 4 hours limit

export function calculateInterest() {
    if (!ctx.S.bankDeposit) return;
    const now = Date.now();
    const elapsed = now - ctx.S.bankDepositTime;
    
    if (elapsed >= FOUR_HOURS) {
        const cycles = Math.floor(elapsed / FOUR_HOURS);
        let currentDeposit = ctx.S.bankDeposit;
        for(let i = 0; i < cycles; i++) {
            currentDeposit += Math.floor(currentDeposit * INTEREST_RATE);
        }
        ctx.S.bankDeposit = currentDeposit;
        // update time to remaining elapsed
        ctx.S.bankDepositTime = now - (elapsed % FOUR_HOURS);
        All.save();
    }
}

export function checkLoanStatus() {
    const now = Date.now();
    
    // Check Emergency Loan interest
    if (ctx.S.bankEmergencyLoan > 0) {
        // Just accumulate 10% per 4 hours? Let's just track it simply
        const elapsed = now - (ctx.S.bankEmergencyLoanTime || now);
        if (elapsed >= FOUR_HOURS) {
            const cycles = Math.floor(elapsed / FOUR_HOURS);
            let currentE = ctx.S.bankEmergencyLoan;
            for(let i = 0; i < cycles; i++) {
                currentE += Math.floor(currentE * EMERGENCY_LOAN_INTEREST);
            }
            ctx.S.bankEmergencyLoan = currentE;
            ctx.S.bankEmergencyLoanTime = now - (elapsed % FOUR_HOURS);
        }
    }

    // Process normal loan overdue
    if (ctx.S.bankLoan > 0) {
        const loanElapsed = now - ctx.S.bankLoanTime;
        if (loanElapsed >= LOAN_DURATION) {
            // Overdue!
            // Calculate penalty interest (e.g. 5% penalty)
            const penalty = Math.floor(ctx.S.bankLoan * 0.05);
            let debt = ctx.S.bankLoan + penalty;
            ctx.S.bankLoan = 0; // Move to locked debt processing
            ctx.S.bankLoanTime = 0;
            
            // Try deduct from deposit
            if (ctx.S.bankDeposit >= debt) {
                ctx.S.bankDeposit -= debt;
                debt = 0;
            } else if (ctx.S.bankDeposit > 0) {
                debt -= ctx.S.bankDeposit;
                ctx.S.bankDeposit = 0;
            }
            
            // Try deduct from coins
            if (debt > 0) {
                if (ctx.S.coins >= debt) {
                    ctx.S.coins -= debt;
                    debt = 0;
                } else {
                    debt -= ctx.S.coins;
                    ctx.S.coins = 0;
                }
            }
            
            if (debt > 0) {
                ctx.S.bankLockedDebt += debt;
            }
            
            All.save();
        }
    }
    
    // Process periodic debt collection if locked
    if (ctx.S.bankLockedDebt > 0) {
        if (now - ctx.S.bankLastCollectionTime >= ONE_HOUR) {
            ctx.S.bankLastCollectionTime = now;
            if (ctx.S.coins > 0) {
                if (ctx.S.coins >= ctx.S.bankLockedDebt) {
                    ctx.S.coins -= ctx.S.bankLockedDebt;
                    ctx.S.bankLockedDebt = 0;
                } else {
                    ctx.S.bankLockedDebt -= ctx.S.coins;
                    ctx.S.coins = 0;
                }
                All.save();
            }
        }
    }
}

export function deposit(amount) {
    if (amount <= 0 || ctx.S.coins < amount) return false;
    calculateInterest();
    ctx.S.coins -= amount;
    ctx.S.bankDeposit += amount;
    ctx.S.bankDepositTime = Date.now();
    All.save();
    return true;
}

let currentBankTab = 'deposit';

export function renderBankUI() {
    checkLoanStatus(); // Ensure state is fresh
    calculateInterest();
    
    All.$id('mtitle-text').innerHTML = `${All.spriteSVG('coin', 16)} Ngân Hàng Trung Ương`;
    
    let html = `
    <div class="tabs" style="margin-bottom:12px; display:flex; gap:8px;">
        <div class="tab ${currentBankTab === 'deposit' ? 'active' : ''}" data-banktab="deposit">Tiết Kiệm</div>
        <div class="tab ${currentBankTab === 'loan' ? 'active' : ''}" data-banktab="loan">Vay Nợ</div>
    </div>`;

    if (currentBankTab === 'deposit') {
        html += `
        <div class="note" style="margin-bottom:12px;">Lãi suất 1% mỗi ngày (4h đời thực). Tiền lãi tự động cộng vào gốc.</div>
        <div style="font-size:14px; margin-bottom:12px;">Số dư đang gửi: <b>${ctx.S.bankDeposit.toLocaleString()}</b> G</div>
        <div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>
        <div style="display:flex; gap:8px;">
            <input type="number" id="bank-deposit-amt" class="inp" placeholder="Số lượng" min="1" max="${ctx.S.coins}" style="flex:1;">
            <div class="buy" onclick="FarmAll.uiBankAction('deposit')">Gửi Tiền</div>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
            <input type="number" id="bank-withdraw-amt" class="inp" placeholder="Số lượng" min="1" max="${ctx.S.bankDeposit}" style="flex:1;">
            <div class="buy" onclick="FarmAll.uiBankAction('withdraw')">Rút Tiền</div>
        </div>`;
    } else if (currentBankTab === 'loan') {
        const hasLoan = ctx.S.bankLoan > 0;
        const isLocked = ctx.S.bankLockedDebt > 0;
        const timeElapsed = Date.now() - ctx.S.bankLoanTime;
        const timeRemainingMs = LOAN_DURATION - timeElapsed;
        const timeStr = timeRemainingMs > 0 ? All.fmtDur(timeRemainingMs) : "Quá Hạn!";
        
        html += `
        <div class="note" style="margin-bottom:12px; ${isLocked ? 'color:red;' : ''}">Kỳ hạn trả nợ: 1 ngày (4h đời thực). Nợ xấu tự động trừ vào tiết kiệm & túi vàng.</div>`;
        
        if (isLocked) {
            html += `<div style="color:red; font-weight:bold; margin-bottom:12px;">BẠN ĐANG CÓ NỢ XẤU: ${ctx.S.bankLockedDebt.toLocaleString()} G</div>`;
            html += `<div style="font-size:12px; margin-bottom:12px;">Ngân hàng sẽ tự động siết nợ mỗi khi bạn có vàng.</div>`;
            
            // Sub-prime loan option
            html += `<hr style="margin: 12px 0; border: 1px dashed #ccc;">
            <div style="color:#d35400; font-weight:bold;">Tín dụng đen (Trợ cấp khẩn cấp)</div>
            <div class="note">Lãi suất 10% mỗi 4 giờ. Cực kỳ rủi ro!</div>
            <div style="font-size:14px; margin-bottom:12px;">Đang nợ tín dụng đen: <b>${ctx.S.bankEmergencyLoan.toLocaleString()}</b> G</div>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <input type="number" id="bank-emergency-amt" class="inp" placeholder="Số lượng" min="1" style="flex:1;">
                <div class="buy" style="background:#d35400;" onclick="FarmAll.uiBankAction('borrowEmergency')">Vay Khẩn Cấp</div>
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <input type="number" id="bank-repay-emergency-amt" class="inp" placeholder="Số lượng" min="1" style="flex:1;">
                <div class="buy" onclick="FarmAll.uiBankAction('repayEmergency')">Trả Nợ Khẩn</div>
            </div>
            `;
        } else {
            if (hasLoan) {
                html += `<div style="font-size:14px; margin-bottom:8px;">Nợ gốc: <b>${ctx.S.bankLoan.toLocaleString()}</b> G</div>`;
                html += `<div style="font-size:14px; margin-bottom:12px; color:${timeRemainingMs > 0 ? '#10b981' : 'red'};">Thời gian trả còn lại: <b>${timeStr}</b></div>`;
                html += `<div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>`;
                html += `<div style="display:flex; gap:8px; margin-top:8px;">
                    <input type="number" id="bank-repay-amt" class="inp" placeholder="Số lượng" min="1" max="${ctx.S.bankLoan}" style="flex:1;">
                    <div class="buy" onclick="FarmAll.uiBankAction('repay')">Trả Nợ</div>
                </div>`;
            } else {
                html += `<div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>`;
                html += `<div style="display:flex; gap:8px; margin-top:8px;">
                    <input type="number" id="bank-borrow-amt" class="inp" placeholder="Số lượng" min="1" style="flex:1;">
                    <div class="buy" onclick="FarmAll.uiBankAction('borrow')">Vay Nợ</div>
                </div>`;
            }
        }
    }
    
    All.$id('mbody').innerHTML = html;
    
    // Bind tab clicks
    All.$id('mbody').querySelectorAll('[data-banktab]').forEach(el => {
        el.addEventListener('click', () => {
            currentBankTab = el.dataset.banktab;
            renderBankUI();
        });
    });

    All.$id('modal').style.display = 'flex';
}

export function uiBankAction(action) {
    let inputId = '';
    let func = null;
    if (action === 'deposit') { inputId = 'bank-deposit-amt'; func = deposit; }
    else if (action === 'withdraw') { inputId = 'bank-withdraw-amt'; func = withdraw; }
    else if (action === 'borrow') { inputId = 'bank-borrow-amt'; func = borrow; }
    else if (action === 'repay') { inputId = 'bank-repay-amt'; func = repay; }
    else if (action === 'borrowEmergency') { inputId = 'bank-emergency-amt'; func = borrowEmergency; }
    else if (action === 'repayEmergency') { inputId = 'bank-repay-emergency-amt'; func = repayEmergency; }
    
    const amt = parseInt(All.$id(inputId)?.value || "0", 10);
    if (!amt || isNaN(amt) || amt <= 0) {
        return All.toast('Số lượng không hợp lệ');
    }
    
    const success = func(amt);
    if (success) {
        All.toast('Thành công!');
        All.renderStatus();
        renderBankUI(); // re-render
    } else {
        All.toast('Giao dịch thất bại (Không đủ vàng hoặc lỗi)');
    }
}


export function withdraw(amount) {
    if (amount <= 0 || ctx.S.bankDeposit < amount) return false;
    calculateInterest();
    ctx.S.bankDeposit -= amount;
    ctx.S.coins += amount;
    ctx.S.bankDepositTime = Date.now(); // reset timer for remainder to prevent exploiting withdrawal before 4 hours
    All.save();
    return true;
}

export function borrow(amount) {
    if (amount <= 0 || ctx.S.bankLockedDebt > 0 || ctx.S.bankLoan > 0) return false; // Max 1 loan at a time
    ctx.S.bankLoan += amount;
    ctx.S.bankLoanTime = Date.now();
    ctx.S.coins += amount;
    All.save();
    return true;
}

export function repay(amount) {
    if (amount <= 0 || ctx.S.coins < amount) return false;
    if (ctx.S.bankLoan > 0) {
        if (amount >= ctx.S.bankLoan) {
            amount = ctx.S.bankLoan;
        }
        ctx.S.coins -= amount;
        ctx.S.bankLoan -= amount;
        if (ctx.S.bankLoan === 0) ctx.S.bankLoanTime = 0;
        All.save();
        return true;
    }
    return false;
}

export function borrowEmergency(amount) {
    if (amount <= 0) return false;
    ctx.S.bankEmergencyLoan += amount;
    ctx.S.bankEmergencyLoanTime = Date.now();
    ctx.S.coins += amount;
    All.save();
    return true;
}

export function repayEmergency(amount) {
    if (amount <= 0 || ctx.S.coins < amount || ctx.S.bankEmergencyLoan <= 0) return false;
    if (amount >= ctx.S.bankEmergencyLoan) {
        amount = ctx.S.bankEmergencyLoan;
    }
    ctx.S.coins -= amount;
    ctx.S.bankEmergencyLoan -= amount;
    if (ctx.S.bankEmergencyLoan === 0) ctx.S.bankEmergencyLoanTime = 0;
    All.save();
    return true;
}
