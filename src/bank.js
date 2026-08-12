import { ctx } from './store.js';
import * as All from './all.js';

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const DEPOSIT_RATE = 0.005; // 0.5% per 4h simple interest
const INVEST_RATE = 0.015; // 1.5% per 4h compound interest
const EMERGENCY_LOAN_INTEREST = 0.1; // 10% per 4h

function getMaxLoan() {
    const assets = (ctx.S.coins || 0) + (ctx.S.bankDeposit || 0) + (ctx.S.bankInvestPrincipal || 0);
    const limit = Math.floor(assets * 0.5);
    return Math.min(Math.max(limit, 10000), 1000000); // Minimum 10,000, max 1,000,000
}

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

export function checkLoanStatus() {
    const now = Date.now();
    
    // Emergency Loan interest
    if (ctx.S.bankEmergencyLoan > 0) {
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

    // Normal loan overdue
    if (ctx.S.bankLoan > 0) {
        const loanElapsed = now - ctx.S.bankLoanTime;
        const duration = ctx.S.bankLoanDuration || FOUR_HOURS;
        if (loanElapsed >= duration) {
            // Overdue! 10% penalty
            const penalty = Math.floor(ctx.S.bankLoan * 0.1);
            let debt = ctx.S.bankLoan + penalty;
            ctx.S.bankLoan = 0;
            ctx.S.bankLoanTime = 0;
            ctx.S.bankLoanDuration = 0;
            
            // Try deduct from deposit
            const totalDeposit = (ctx.S.bankDeposit || 0) + (ctx.S.bankDepositInterest || 0);
            if (totalDeposit >= debt) {
                if (ctx.S.bankDepositInterest >= debt) {
                    ctx.S.bankDepositInterest -= debt;
                } else {
                    debt -= ctx.S.bankDepositInterest;
                    ctx.S.bankDepositInterest = 0;
                    ctx.S.bankDeposit -= debt;
                }
                debt = 0;
            } else if (totalDeposit > 0) {
                debt -= totalDeposit;
                ctx.S.bankDeposit = 0;
                ctx.S.bankDepositInterest = 0;
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
                ctx.S.bankLockedDebt = (ctx.S.bankLockedDebt || 0) + debt;
            }
            
            All.save();
        }
    }
    
    // Periodic debt collection
    if (ctx.S.bankLockedDebt > 0 || ctx.S.bankEmergencyLoan > 0) {
        if (now - (ctx.S.bankLastCollectionTime || 0) >= ONE_HOUR) {
            ctx.S.bankLastCollectionTime = now;
            if (ctx.S.coins > 0) {
                // Collect locked debt first
                if (ctx.S.bankLockedDebt > 0) {
                    if (ctx.S.coins >= ctx.S.bankLockedDebt) {
                        ctx.S.coins -= ctx.S.bankLockedDebt;
                        ctx.S.bankLockedDebt = 0;
                    } else {
                        ctx.S.bankLockedDebt -= ctx.S.coins;
                        ctx.S.coins = 0;
                    }
                }
                // Collect emergency loan next
                if (ctx.S.coins > 0 && ctx.S.bankEmergencyLoan > 0) {
                    if (ctx.S.coins >= ctx.S.bankEmergencyLoan) {
                        ctx.S.coins -= ctx.S.bankEmergencyLoan;
                        ctx.S.bankEmergencyLoan = 0;
                        ctx.S.bankEmergencyLoanTime = 0;
                    } else {
                        ctx.S.bankEmergencyLoan -= ctx.S.coins;
                        ctx.S.coins = 0;
                    }
                }
                All.save();
            }
        }
    }
}

let currentBankTab = 'deposit';

export function renderBankUI() {
    checkLoanStatus();
    calculateInterest();
    
    const title = `${All.spriteSVG('coin', 16)} Ngân Hàng Trung Ương`;
    
    let html = `<div class="tabs" style="margin-bottom:12px; display:flex; gap:8px;">
        <div class="tab ${currentBankTab === 'deposit' ? 'active' : ''}" data-banktab="deposit">Tiết Kiệm</div>
        <div class="tab ${currentBankTab === 'invest' ? 'active' : ''}" data-banktab="invest">Đầu Tư</div>
        <div class="tab ${currentBankTab === 'loan' ? 'active' : ''}" data-banktab="loan">Vay Nợ</div>
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
    } else if (currentBankTab === 'loan') {
        const hasLoan = ctx.S.bankLoan > 0;
        const isLocked = ctx.S.bankLockedDebt > 0;
        const timeElapsed = Date.now() - (ctx.S.bankLoanTime || 0);
        const timeRemainingMs = (ctx.S.bankLoanDuration || FOUR_HOURS) - timeElapsed;
        const timeStr = timeRemainingMs > 0 ? All.fmtDur(timeRemainingMs) : "Quá Hạn!";
        
        html += `<div class="note" style="margin-bottom:12px; ${isLocked ? 'color:red;' : ''}">Khoản vay được tính lãi một lần ngay lúc duyệt. Nợ quá hạn phạt 10% và bị khóa siết nợ.</div>`;
        
        if (isLocked) {
            html += `<div style="color:red; font-weight:bold; margin-bottom:12px;">BẠN ĐANG CÓ NỢ XẤU: ${ctx.S.bankLockedDebt.toLocaleString()} G</div>
            <div style="font-size:12px; margin-bottom:12px; color:#5c4033;">Ngân hàng sẽ tự động siết nợ mỗi khi bạn có vàng.</div>
            <hr style="margin: 12px 0; border: 1px dashed #ccc;">
            <div style="color:#d35400; font-weight:bold;">Tín dụng đen (Trợ cấp khẩn cấp)</div>
            <div class="note">Lãi suất 10% mỗi 4 giờ. Cực kỳ rủi ro!</div>
            <div style="font-size:14px; margin-bottom:12px; color:#5c4033;">Đang nợ tín dụng đen: <b>${(ctx.S.bankEmergencyLoan || 0).toLocaleString()}</b> G</div>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <input type="number" id="bank-emergency-amt" class="inp" placeholder="Tối đa 50,000" min="1" max="50000" style="flex:1;">
                <div class="buy" style="background:#d35400;" onclick="FarmAll.uiBankAction('borrowEmergency')">Vay Khẩn Cấp</div>
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <input type="number" id="bank-repay-emergency-amt" class="inp" placeholder="Số lượng" min="1" style="flex:1;">
                <div class="buy" onclick="FarmAll.uiBankAction('repayEmergency')">Trả Nợ Khẩn</div>
            </div>`;
        } else {
            if (hasLoan) {
                html += `<div style="font-size:14px; margin-bottom:8px; color:#5c4033;">Nợ cần trả: <b>${ctx.S.bankLoan.toLocaleString()}</b> G</div>
                <div style="font-size:14px; margin-bottom:12px; color:${timeRemainingMs > 0 ? '#10b981' : 'red'}">Thời gian trả còn lại: <b>${timeStr}</b></div>
                <div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <input type="number" id="bank-repay-amt" class="inp" placeholder="Số lượng" min="1" max="${ctx.S.bankLoan}" style="flex:1;">
                    <div class="buy" onclick="FarmAll.uiBankAction('repay')">Trả Nợ</div>
                </div>`;
            } else {
                const maxLoan = getMaxLoan();
                html += `<div style="font-size:14px; margin-bottom:12px; color:#7a5c38;">Ví vàng hiện tại: <b>${ctx.S.coins.toLocaleString()}</b> G</div>
                <div style="font-size:14px; margin-bottom:8px; color:#5c4033;">Hạn mức vay tối đa: <b>${maxLoan.toLocaleString()}</b> G</div>
                <div style="margin-bottom:8px;">
                    <select id="bank-loan-tier" class="inp" style="width:100%; padding:6px; background:#faf0dc; border:2px solid #bd923b; color:#5c4033; font-weight:bold; border-radius:6px; outline:none;">
                        <option value="1">Vay 1 Ngày (Lãi 5%)</option>
                        <option value="2">Vay 3 Ngày (Lãi 20%)</option>
                        <option value="3">Vay 7 Ngày (Lãi 50%)</option>
                    </select>
                </div>
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <input type="number" id="bank-borrow-amt" class="inp" placeholder="Vàng muốn nhận" min="1" max="${maxLoan}" style="flex:1;">
                    <div class="buy" onclick="FarmAll.uiBankAction('borrow')">Vay Nợ</div>
                </div>`;
            }
        }
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
    else if (action === 'borrow') inputId = 'bank-borrow-amt';
    else if (action === 'repay') inputId = 'bank-repay-amt';
    else if (action === 'borrowEmergency') inputId = 'bank-emergency-amt';
    else if (action === 'repayEmergency') inputId = 'bank-repay-emergency-amt';
    
    const amt = parseInt(All.$id(inputId)?.value || "0", 10);
    if (!amt || isNaN(amt) || amt <= 0) {
        return All.toast('Số lượng không hợp lệ');
    }
    
    let success = false;
    if (action === 'deposit') success = deposit(amt);
    else if (action === 'withdrawDeposit') success = withdrawDeposit(amt);
    else if (action === 'invest') success = invest(amt);
    else if (action === 'withdrawInvest') success = withdrawInvest(amt);
    else if (action === 'borrow') {
        const tier = parseInt(All.$id('bank-loan-tier')?.value || "1", 10);
        success = borrow(amt, tier);
    }
    else if (action === 'repay') success = repay(amt);
    else if (action === 'borrowEmergency') success = borrowEmergency(amt);
    else if (action === 'repayEmergency') success = repayEmergency(amt);

    if (success) {
        All.toast('Thành công!');
        All.renderStatus();
        renderBankUI(); // re-render
    } else {
        All.toast('Giao dịch thất bại (Số dư không đủ hoặc bị khóa)');
    }
}

function deposit(amount) {
    if (ctx.S.bankLockedDebt > 0 || ctx.S.bankEmergencyLoan > 0) return false;
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
    if (ctx.S.bankLockedDebt > 0 || ctx.S.bankEmergencyLoan > 0) return false;
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

function borrow(amount, tier) {
    if (ctx.S.bankLockedDebt > 0 || ctx.S.bankLoan > 0) return false;
    
    const maxLoan = getMaxLoan();
    if (amount > maxLoan) return false;
    
    let durationMultiplier = 1; // 1 day = 6 * 4h
    let interestRate = 0.05;
    if (tier === 2) { durationMultiplier = 3; interestRate = 0.20; }
    else if (tier === 3) { durationMultiplier = 7; interestRate = 0.50; }
    
    const debt = Math.floor(amount * (1 + interestRate));
    
    ctx.S.bankLoan = debt;
    ctx.S.bankLoanDuration = durationMultiplier * 6 * FOUR_HOURS; // 1 day = 24h
    ctx.S.bankLoanTime = Date.now();
    ctx.S.coins += amount;
    All.save();
    return true;
}

function repay(amount) {
    if (ctx.S.coins < amount) return false;
    if (ctx.S.bankLoan > 0) {
        if (amount >= ctx.S.bankLoan) amount = ctx.S.bankLoan;
        ctx.S.coins -= amount;
        ctx.S.bankLoan -= amount;
        if (ctx.S.bankLoan === 0) {
            ctx.S.bankLoanTime = 0;
            ctx.S.bankLoanDuration = 0;
        }
        All.save();
        return true;
    }
    return false;
}

function borrowEmergency(amount) {
    if (ctx.S.bankEmergencyLoan > 0 || amount > 50000) return false;
    ctx.S.bankEmergencyLoan = amount;
    ctx.S.bankEmergencyLoanTime = Date.now();
    ctx.S.coins += amount;
    All.save();
    return true;
}

function repayEmergency(amount) {
    if (ctx.S.coins < amount || (ctx.S.bankEmergencyLoan || 0) <= 0) return false;
    if (amount >= ctx.S.bankEmergencyLoan) amount = ctx.S.bankEmergencyLoan;
    ctx.S.coins -= amount;
    ctx.S.bankEmergencyLoan -= amount;
    if (ctx.S.bankEmergencyLoan === 0) ctx.S.bankEmergencyLoanTime = 0;
    All.save();
    return true;
}
