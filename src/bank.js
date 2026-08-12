import { ctx } from './store.js';
import * as All from './all.js';

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const DEPOSIT_RATE = 0.005; // 0.5% per 4h simple interest
const INVEST_RATE = 0.015; // 1.5% per 4h compound interest

export function calculateInterest() {
    const now = Date.now();
    
    // Deposit (Simple Interest)
    if (ctx.S.bankDeposit) {
        if (!ctx.S.bankDepositTime) ctx.S.bankDepositTime = now;
        const depositElapsed = now - ctx.S.bankDepositTime;
        if (depositElapsed >= FOUR_HOURS) {
            const cycles = Math.floor(depositElapsed / FOUR_HOURS);
            ctx.S.bankDepositInterest = (ctx.S.bankDepositInterest || 0) + Math.floor(ctx.S.bankDeposit * DEPOSIT_RATE * cycles);
            ctx.S.bankDepositTime = now - (depositElapsed % FOUR_HOURS);
            All.save();
        }
    }

    // Invest (Compound Interest)
    if (ctx.S.bankInvestBalance) {
        if (!ctx.S.bankInvestTime) ctx.S.bankInvestTime = now;
        const investElapsed = now - ctx.S.bankInvestTime;
        if (investElapsed >= FOUR_HOURS) {
            const cycles = Math.floor(investElapsed / FOUR_HOURS);
            let balance = ctx.S.bankInvestBalance;
            for (let i = 0; i < cycles; i++) {
                balance += Math.floor(balance * INVEST_RATE);
            }
            ctx.S.bankInvestBalance = balance;
            ctx.S.bankInvestTime = now - (investElapsed % FOUR_HOURS);
            All.save();
        }
    }
}

let currentBankTab = 'deposit';

export function renderBankUI() {
    calculateInterest();
    
    const title = `${All.spriteSVG('coin', 16)} Ngân Hàng Trung Ương`;
    
    let html = `<div class="tabs" style="margin-bottom:12px; display:flex; gap:8px;">
        <div class="tab ${currentBankTab === 'deposit' ? 'active' : ''}" data-banktab="deposit">Tiết Kiệm</div>
        <div class="tab ${currentBankTab === 'invest' ? 'active' : ''}" data-banktab="invest">Đầu Tư</div>
    </div>`;

    if (currentBankTab === 'deposit') {
        const principal = ctx.S.bankDeposit || 0;
        const interest = ctx.S.bankDepositInterest || 0;
        html += `
        <div class="note" style="margin-bottom:12px;">Tiết kiệm an toàn: Lãi đơn 0.5% mỗi 4h đời thực. Lãi tách riêng, không cộng dồn vào gốc.</div>
        <div style="font-size:14px; margin-bottom:4px; color:#5c4033;">Số dư gốc: <b>${principal.toLocaleString()}</b> G</div>
        <div style="font-size:14px; margin-bottom:12px; color:#10b981;">Tiền lãi nhận được: <b>${interest.toLocaleString()}</b> G</div>
        <div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>
        <div style="display:flex; gap:8px;">
            <input type="number" id="bank-deposit-amt" class="inp" placeholder="Số lượng" min="1" max="${ctx.S.coins}" style="flex:1;">
            <div class="buy" onclick="FarmAll.uiBankAction('deposit')">Gửi Tiền</div>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
            <input type="number" id="bank-withdraw-amt" class="inp" placeholder="Số lượng" min="1" max="${principal + interest}" style="flex:1;">
            <div class="buy" onclick="FarmAll.uiBankAction('withdrawDeposit')">Rút Tiền</div>
        </div>`;
    } else if (currentBankTab === 'invest') {
        const principal = ctx.S.bankInvestPrincipal || 0;
        const balance = ctx.S.bankInvestBalance || 0;
        const interest = balance - principal;
        const isUnlocked = interest >= principal * 0.3;
        
        html += `
        <div class="note" style="margin-bottom:12px;">Đầu tư siêu tốc: Lãi kép 1.5% mỗi 4h. Rủi ro giam vốn: <b>Chỉ rút được tiền gốc khi Tiền Lãi &gt;= 30% Tiền Gốc.</b></div>
        <div style="font-size:14px; margin-bottom:4px; color:#5c4033;">Vốn đầu tư: <b>${principal.toLocaleString()}</b> G</div>
        <div style="font-size:14px; margin-bottom:12px; color:#10b981;">Tiền lãi (lãi kép): <b>${interest.toLocaleString()}</b> G</div>
        <div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>
        <div style="display:flex; gap:8px;">
            <input type="number" id="bank-invest-amt" class="inp" placeholder="Số lượng" min="1" max="${ctx.S.coins}" style="flex:1;">
            <div class="buy" onclick="FarmAll.uiBankAction('invest')">Đầu Tư</div>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px; align-items:center;">
            <input type="number" id="bank-withdraw-invest-amt" class="inp" placeholder="Số lượng" min="1" max="${isUnlocked ? balance : interest}" style="flex:1;">
            <div class="buy" onclick="FarmAll.uiBankAction('withdrawInvest')">Rút Tiền ${isUnlocked ? '(Gốc + Lãi)' : '(Chỉ Lãi)'}</div>
        </div>`;
    }
    
    All.openModal(title, html);
    
    // Bind tab clicks
    setTimeout(() => {
        const modalBody = All.$id('mbody');
        if (!modalBody) return;
        modalBody.querySelectorAll('[data-banktab]').forEach(el => {
            el.addEventListener('click', () => {
                currentBankTab = el.dataset.banktab;
                renderBankUI();
            });
        });
    }, 0);
}

export function uiBankAction(action) {
    let inputId = '';
    if (action === 'deposit') inputId = 'bank-deposit-amt';
    else if (action === 'withdrawDeposit') inputId = 'bank-withdraw-amt';
    else if (action === 'invest') inputId = 'bank-invest-amt';
    else if (action === 'withdrawInvest') inputId = 'bank-withdraw-invest-amt';
    
    const amt = parseInt(All.$id(inputId)?.value || "0", 10);
    if (!amt || isNaN(amt) || amt <= 0) {
        return All.toast('Số lượng không hợp lệ');
    }
    
    let success = false;
    if (action === 'deposit') success = deposit(amt);
    else if (action === 'withdrawDeposit') success = withdrawDeposit(amt);
    else if (action === 'invest') success = invest(amt);
    else if (action === 'withdrawInvest') success = withdrawInvest(amt);

    if (success) {
        All.toast('Thành công!');
        All.renderStatus();
        renderBankUI(); // re-render
    } else {
        All.toast('Giao dịch thất bại (Số dư không đủ)');
    }
}

function deposit(amount) {
    if (ctx.S.coins < amount) return false;
    calculateInterest();
    ctx.S.coins -= amount;
    ctx.S.bankDeposit = (ctx.S.bankDeposit || 0) + amount;
    ctx.S.bankDepositTime = Date.now();
    All.save();
    return true;
}

function withdrawDeposit(amount) {
    const total = (ctx.S.bankDeposit || 0) + (ctx.S.bankDepositInterest || 0);
    if (amount > total) return false;
    calculateInterest();
    ctx.S.coins += amount;
    if (amount <= (ctx.S.bankDepositInterest || 0)) {
        ctx.S.bankDepositInterest -= amount;
    } else {
        const remainder = amount - (ctx.S.bankDepositInterest || 0);
        ctx.S.bankDepositInterest = 0;
        ctx.S.bankDeposit -= remainder;
    }
    ctx.S.bankDepositTime = Date.now();
    All.save();
    return true;
}

function invest(amount) {
    if (ctx.S.coins < amount) return false;
    calculateInterest();
    ctx.S.coins -= amount;
    ctx.S.bankInvestPrincipal = (ctx.S.bankInvestPrincipal || 0) + amount;
    ctx.S.bankInvestBalance = (ctx.S.bankInvestBalance || 0) + amount;
    ctx.S.bankInvestTime = Date.now();
    All.save();
    return true;
}

function withdrawInvest(amount) {
    const principal = ctx.S.bankInvestPrincipal || 0;
    const balance = ctx.S.bankInvestBalance || 0;
    const interest = balance - principal;
    const isUnlocked = interest >= principal * 0.3;
    const maxWithdraw = isUnlocked ? balance : interest;
    
    if (amount > maxWithdraw) return false;
    calculateInterest();
    ctx.S.coins += amount;
    ctx.S.bankInvestBalance -= amount;
    if (isUnlocked && amount > interest) {
        ctx.S.bankInvestPrincipal -= (amount - interest);
        if (ctx.S.bankInvestPrincipal < 0) ctx.S.bankInvestPrincipal = 0;
    }
    ctx.S.bankInvestTime = Date.now();
    All.save();
    return true;
}
