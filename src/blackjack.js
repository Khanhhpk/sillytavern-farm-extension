import { openModal } from './shop.js';
import { ctx } from './store.js';
import { save } from './state.js';
import { toast } from './witch.js';
import { renderStatus } from './render.js';
import { buildPeerConfigAsync } from './net.js';
import { Peer } from 'peerjs';
import * as All from './all.js';

// ─────────────────────────────────────────────────────────────────────────────
export function bjToast(msg) {
    let t = All.$id('bj-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'bj-toast';
        t.style.cssText = 'position:absolute;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:10px 20px;border-radius:8px;font-size:14px;pointer-events:none;opacity:0;transition:opacity 0.3s;z-index:100000;box-shadow:0 4px 12px rgba(0,0,0,0.5);text-align:center;font-weight:bold;min-width:200px;';
        const win = All.$id('bj-win');
        if (win) win.appendChild(t);
        else document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    if (t._timer) clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

function bjSystemChat(msg) {
    bjChatLog.push({ name: 'Hệ thống', msg, ts: Date.now(), isSystem: true });
    if (bjChatLog.length > 50) bjChatLog.shift();
    const wrap = All.$id('bj-chat-wrap');
    if (!wrap || !wrap.classList.contains('open')) { bjUnreadChat++; bjRenderRoom(); }
    bjRenderChat();
}

function bjEscapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
//  CARD ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function cardValue(rank) {
    if (rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
}

function handTotal(hand) {
    let total = 0, aces = 0;
    for (const card of hand) {
        if (card.hidden) continue;
        total += cardValue(card.rank);
        if (card.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

function isSoft(hand) {
    let total = 0, aces = 0;
    for (const card of hand) {
        if (card.hidden) continue;
        total += cardValue(card.rank);
        if (card.rank === 'A') aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return aces > 0 && total <= 21;
}

function buildShoe(numDecks, seed) {
    const cards = [];
    for (let d = 0; d < numDecks; d++) {
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                cards.push({ suit, rank });
            }
        }
    }
    let s = seed >>> 0;
    const rng = () => {
        s |= 0; s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

function isBlackjack(hand) {
    if (hand.length !== 2) return false;
    return handTotal(hand) === 21;
}

function is10Value(rank) {
    return ['10', 'J', 'Q', 'K'].includes(rank);
}

function cardHTML(card, small) {
    let animCls = '';
    if (card.isNew) { animCls = ' bj-anim-deal'; delete card.isNew; }
    else if (card.justRevealed) { animCls = ' bj-anim-flip'; delete card.justRevealed; }
    
    if (card.hidden) {
        return `<div class="bj-card back${small ? ' small' : ''}${animCls}"><div class="bj-card-back-inner"></div></div>`;
    }
    const isRed = card.suit === '♥' || card.suit === '♦';
    const col = isRed ? '#c0392b' : '#1a1a2e';
    return `<div class="bj-card${small ? ' small' : ''}${animCls}" style="color:${col}">
        <div class="bj-card-corner tl">${card.rank}<br><span>${card.suit}</span></div>
        <div class="bj-card-center">${card.suit}</div>
        <div class="bj-card-corner br">${card.rank}<br><span>${card.suit}</span></div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SOLO MODE
// ─────────────────────────────────────────────────────────────────────────────
let soloState = null;

export function openBlackjackSolo() {
    soloState = {
        phase: 'bet',
        shoe: [],
        shoeIdx: 0,
        playerHands: [[]],
        activeHandIdx: 0,
        dealerHand: [],
        bets: [0],
        insuranceBet: 0,
        splitAceIdxs: new Set(),
        settings: { minBet: 10, maxBet: 0, numDecks: 6 },
    };
    soloState.shoe = buildShoe(soloState.settings.numDecks, Date.now() & 0xffffffff);
    const win = All.$id('bj-win');
    const body = All.$id('bj-body');
    if (win && body) {
        win.style.display = 'flex';
        All.placeBjWin();
        body.innerHTML = buildSoloUI();
        soloRender();
    }
}

function soloDrawCard(hidden) {
    const s = soloState;
    if (!s.shoe || s.shoe.length - s.shoeIdx < (s.playerHands.length * 15 + 15)) {
        s.shoe = buildShoe(s.settings.numDecks, Date.now() & 0xffffffff);
        s.shoeIdx = 0;
    }
    return { ...s.shoe[s.shoeIdx++], hidden: !!hidden, isNew: true };
}

function buildSoloUI() {
    return `<div id="bj-solo-wrap">
        <div class="bj-table">
            <div class="bj-dealer-area">
                <div class="bj-area-label">Nhà cái</div>
                <div class="bj-hand-row" id="bj-dealer-hand"></div>
                <div class="bj-score" id="bj-dealer-score"></div>
            </div>
            <div class="bj-player-area">
                <div class="bj-area-label">Bạn — <span id="bj-coins-display"></span></div>
                <div id="bj-player-hands"></div>
            </div>
        </div>
        <div id="bj-message" class="bj-message"></div>
        <div id="bj-actions" class="bj-actions"></div>
    </div>`;
}

function soloRender() {
    const s = soloState;
    if (!All.$id('bj-solo-wrap')) return;
    const coinsEl = All.$id('bj-coins-display');
    if (coinsEl) coinsEl.textContent = `${(ctx.S.coins || 0).toLocaleString()} G`;
    const dealerEl = All.$id('bj-dealer-hand');
    const dealerScoreEl = All.$id('bj-dealer-score');
    if (dealerEl) {
        dealerEl.innerHTML = s.dealerHand.map(c => cardHTML(c)).join('');
        const vis = s.dealerHand.filter(c => !c.hidden);
        if (dealerScoreEl) dealerScoreEl.textContent = vis.length ? `Điểm: ${handTotal(vis)}` : '';
    }
    const handsEl = All.$id('bj-player-hands');
    if (handsEl) {
        handsEl.innerHTML = s.playerHands.map((hand, i) => {
            const isActive = i === s.activeHandIdx && s.phase === 'player';
            const total = handTotal(hand);
            const bet = s.bets[i] || 0;
            return `<div class="bj-player-hand${isActive ? ' active-hand' : ''}">
                <div class="bj-hand-row">${hand.map(c => cardHTML(c)).join('')}</div>
                <div class="bj-score">Điểm: ${total}${total > 21 ? ' 💀 Bust!' : ''} — Cược: ${bet.toLocaleString()}G</div>
            </div>`;
        }).join('');
    }
    const msgEl = All.$id('bj-message');
    if (msgEl && s.phase !== 'done') msgEl.textContent = '';
    renderSoloActions();
}

function renderSoloActions() {
    const s = soloState;
    const actEl = All.$id('bj-actions');
    if (!actEl) return;
    const coins = ctx.S.coins || 0;

    if (s.phase === 'bet') {
        const min = s.settings.minBet;
        actEl.innerHTML = `
            <div class="bj-bet-row">
                <input class="inp" id="bj-bet-inp" type="number" min="${min}" value="${Math.max(min, Math.min(100, coins))}" style="width:110px">
                <span class="buy plain bj-quick" data-q="4">¼</span>
                <span class="buy plain bj-quick" data-q="2">½</span>
                <span class="buy plain bj-quick" data-q="1">Max</span>
            </div>
            <div class="bj-btn-row" style="margin-top:8px;">
                <div class="buy" id="bj-deal">🃏 Phát Bài</div>
            </div>`;
        actEl.querySelectorAll('.bj-quick').forEach(b => b.addEventListener('click', () => {
            const inp = All.$id('bj-bet-inp');
            if (inp) inp.value = String(Math.max(min, Math.floor(coins / Number(b.getAttribute('data-q')))));
        }));
        All.$id('bj-deal').addEventListener('click', soloStartRound);
        return;
    }

    if (s.phase === 'insurance') {
        const hand = s.playerHands[0];
        const bet = s.bets[0];
        const hasBJ = isBlackjack(hand);
        if (hasBJ) {
            actEl.innerHTML = `
                <div class="bj-msg-sm">Bạn có Blackjack! Dealer upcard là Ace.</div>
                <div class="bj-btn-row">
                    <div class="buy" id="bj-even-money">Lấy ngay 1:1 (Even Money)</div>
                    <div class="buy plain" id="bj-no-insurance">Bỏ qua, chờ kết quả</div>
                </div>`;
            All.$id('bj-even-money').addEventListener('click', soloEvenMoney);
            All.$id('bj-no-insurance').addEventListener('click', () => soloAfterInsurance(false));
        } else {
            const maxIns = Math.floor(bet / 2);
            actEl.innerHTML = `
                <div class="bj-msg-sm">Dealer upcard là Ace — Mua bảo hiểm? (tối đa ${maxIns}G)</div>
                <div class="bj-btn-row">
                    <div class="buy" id="bj-buy-ins">Mua ${maxIns}G</div>
                    <div class="buy plain" id="bj-skip-ins">Bỏ qua</div>
                </div>`;
            All.$id('bj-buy-ins').addEventListener('click', () => soloBuyInsurance(maxIns));
            All.$id('bj-skip-ins').addEventListener('click', () => soloAfterInsurance(false));
        }
        return;
    }

    if (s.phase === 'player') {
        const hand = s.playerHands[s.activeHandIdx];
        const total = handTotal(hand);
        const bet = s.bets[s.activeHandIdx];
        const isSplitAce = s.splitAceIdxs.has(s.activeHandIdx);
        const canDouble = hand.length === 2 && coins >= bet && !isSplitAce;
        const canSplit = hand.length === 2 && hand[0].rank === hand[1].rank && coins >= bet && s.playerHands.length < 4;
        const canSurrender = hand.length === 2 && s.activeHandIdx === 0 && s.playerHands.length === 1;

        if (total > 21) {
            setTimeout(() => soloNextHand(), 700);
            actEl.innerHTML = `<div class="bj-msg-sm">💀 Bust! Tự động chuyển tay...</div>`;
            return;
        }
        if (isSplitAce) {
            setTimeout(() => soloNextHand(), 400);
            actEl.innerHTML = `<div class="bj-msg-sm">Split Ace — Chỉ nhận 1 lá, tự Stand.</div>`;
            return;
        }

        let html = `<div class="bj-btn-row">
            <div class="buy" id="bj-hit">Hit</div>
            <div class="buy plain" id="bj-stand">Stand</div>`;
        if (canDouble) html += `<div class="buy bj-double-btn" id="bj-double">Double</div>`;
        if (canSplit) html += `<div class="buy bj-split-btn" id="bj-split">Split</div>`;
        if (canSurrender) html += `<div class="buy plain bj-surr-btn" id="bj-surrender">Surrender</div>`;
        html += `</div>`;
        actEl.innerHTML = html;
        All.$id('bj-hit').addEventListener('click', soloHit);
        All.$id('bj-stand').addEventListener('click', soloStand);
        if (canDouble) All.$id('bj-double').addEventListener('click', soloDouble);
        if (canSplit) All.$id('bj-split').addEventListener('click', soloSplit);
        if (canSurrender) All.$id('bj-surrender').addEventListener('click', soloSurrender);
        return;
    }

    if (s.phase === 'done') {
        actEl.innerHTML = `<div class="bj-btn-row"><div class="buy" id="bj-next-round">Ván Mới</div></div>`;
        All.$id('bj-next-round').addEventListener('click', soloNewRound);
    }
}

function soloStartRound() {
    const s = soloState;
    const coins = ctx.S.coins || 0;
    const inp = All.$id('bj-bet-inp');
    const want = Math.max(0, parseInt(inp ? inp.value : '0') || 0);
    if (want < s.settings.minBet) return bjToast(`Cược tối thiểu ${s.settings.minBet}G`);

    if (s.settings.maxBet > 0 && want > s.settings.maxBet) return bjToast(`Cược tối đa ${s.settings.maxBet}G`);
    if (want > coins) return bjToast(`Không đủ vàng (${coins.toLocaleString()}G)`);

    ctx.S.coins = (ctx.S.coins || 0) - want;
    save();
    s.bets = [want]; s.insuranceBet = 0; s.playerHands = [[]]; s.activeHandIdx = 0; s.dealerHand = []; s.splitAceIdxs = new Set();

    s.playerHands[0].push(soloDrawCard());
    s.dealerHand.push(soloDrawCard());
    s.playerHands[0].push(soloDrawCard());
    s.dealerHand.push(soloDrawCard(true));

    const dealerUp = s.dealerHand[0];
    if (dealerUp.rank === 'A') {
        s.phase = 'insurance';
    } else if (is10Value(dealerUp.rank)) {
        const dealerBJ = isBlackjack([s.dealerHand[0], { ...s.dealerHand[1], hidden: false }]);
        if (dealerBJ) {
            s.dealerHand[1].hidden = false; s.phase = 'done';
            soloResolveAll(); soloRender(); return;
        }
        s.phase = 'player';
        if (isBlackjack(s.playerHands[0])) {
            s.dealerHand[1].hidden = false; s.phase = 'done';
            soloResolveAll(); soloRender(); return;
        }
    } else {
        s.phase = 'player';
        if (isBlackjack(s.playerHands[0])) {
            s.dealerHand[1].hidden = false; s.phase = 'done';
            soloResolveAll(); soloRender(); return;
        }
    }
    soloRender();
}

function soloEvenMoney() {
    const s = soloState;
    const payout = s.bets[0] * 2;
    ctx.S.coins = (ctx.S.coins || 0) + payout;
    save(); renderStatus();
    s.dealerHand[1].hidden = false; s.phase = 'done';
    showMsg(`♠ Even Money! Nhận lại ${payout.toLocaleString()}G`);
    soloRender();
}

function soloBuyInsurance(amount) {
    const s = soloState;
    if ((ctx.S.coins || 0) < amount) return bjToast('Không đủ vàng mua bảo hiểm');
    ctx.S.coins = (ctx.S.coins || 0) - amount;
    s.insuranceBet = amount;
    save();
    soloAfterInsurance(true);
}

function soloAfterInsurance(boughtIns) {
    const s = soloState;
    const dealerBJ = isBlackjack([s.dealerHand[0], { ...s.dealerHand[1], hidden: false }]);
    if (dealerBJ) {
        s.dealerHand[1].hidden = false;
        if (boughtIns) {
            const insPayout = s.insuranceBet * 3;
            ctx.S.coins = (ctx.S.coins || 0) + insPayout;
            save();
            showMsg(`Dealer Blackjack! Bảo hiểm trả ${insPayout.toLocaleString()}G`);
        }
        s.phase = 'done'; soloResolveAll(); soloRender(); return;
    }
    s.phase = 'player';
    if (isBlackjack(s.playerHands[0])) {
        s.dealerHand[1].hidden = false; s.phase = 'done';
        soloResolveAll(); soloRender(); return;
    }
    soloRender();
}

function soloHit() {
    const s = soloState;
    if (s.phase !== 'player') return;
    const hand = s.playerHands[s.activeHandIdx];
    if (hand.surrendered || hand.stood || handTotal(hand) >= 21) return;
    hand.push(soloDrawCard());
    soloRender();
    if (handTotal(hand) >= 21) {
        hand.stood = true;
        setTimeout(() => soloNextHand(), 700);
    }
}

function soloStand() {
    const s = soloState;
    if (s.phase !== 'player') return;
    const hand = s.playerHands[s.activeHandIdx];
    if (hand.surrendered || hand.stood) return;
    hand.stood = true;
    soloNextHand();
}

function soloDouble() {
    const s = soloState;
    if (s.phase !== 'player') return;
    const idx = s.activeHandIdx;
    const hand = s.playerHands[idx];
    if (hand.surrendered || hand.stood) return;
    if (s.splitAceIdxs.has(idx)) return bjToast('Không thể Double sau khi Split Ace');
    const bet = s.bets[idx];
    if ((ctx.S.coins || 0) < bet) return bjToast('Không đủ vàng Double');
    ctx.S.coins = (ctx.S.coins || 0) - bet;
    s.bets[idx] *= 2;
    save();
    s.playerHands[idx].push(soloDrawCard());
    hand.stood = true;
    soloRender();
    setTimeout(() => soloNextHand(), 500);
}

function soloSplit() {
    const s = soloState;
    if (s.phase !== 'player') return;
    const idx = s.activeHandIdx;
    const hand = s.playerHands[idx];
    if (hand.surrendered || hand.stood) return;
    const bet = s.bets[idx];
    if ((ctx.S.coins || 0) < bet) return bjToast('Không đủ vàng Split');
    ctx.S.coins = (ctx.S.coins || 0) - bet;
    save();
    const isSplitAce = hand[0].rank === 'A';
    const splitCard = hand.splice(1, 1)[0];
    const newHand = [splitCard];
    hand.push(soloDrawCard());
    newHand.push(soloDrawCard());
    s.playerHands.splice(idx + 1, 0, newHand);
    s.bets.splice(idx + 1, 0, bet);
    if (isSplitAce) { s.splitAceIdxs.add(idx); s.splitAceIdxs.add(idx + 1); }
    soloRender();
}

function soloSurrender() {
    const s = soloState;
    if (s.phase !== 'player') return;
    const hand = s.playerHands[s.activeHandIdx];
    if (hand.surrendered || hand.stood) return;
    hand.surrendered = true;
    hand.stood = true;
    const refund = Math.floor(s.bets[0] / 2);
    ctx.S.coins = (ctx.S.coins || 0) + refund;
    save(); renderStatus();
    soloNextHand();
}

function soloNextHand() {
    const s = soloState;
    if (s.phase !== 'player') return;
    const next = s.activeHandIdx + 1;
    if (next < s.playerHands.length) { s.activeHandIdx = next; soloRender(); }
    else {
        s.phase = 'dealer';
        soloRunDealer();
    }
}

function soloRunDealer() {
    const s = soloState;
    s.dealerHand[1].hidden = false;
    s.dealerHand[1].justRevealed = true;
    s.phase = 'dealer';
    soloRender();
    const allBust = s.playerHands.every(h => handTotal(h) > 21);
    if (allBust) { s.phase = 'done'; soloResolveAll(); soloRender(); return; }
    let step = 0;
    const iv = setInterval(() => {
        const total = handTotal(s.dealerHand);
        const soft = isSoft(s.dealerHand);
        if (total < 17 || (soft && total === 17)) {
            s.dealerHand.push(soloDrawCard());
            soloRender();
        } else {
            clearInterval(iv);
            s.phase = 'done'; soloResolveAll(); soloRender();
        }
        if (++step > 12) clearInterval(iv);
    }, 600);
}

function soloResolveAll() {
    const s = soloState;
    const dTotal = handTotal(s.dealerHand);
    const dBJ = isBlackjack(s.dealerHand);
    const dBust = dTotal > 21;
    const results = [];
    for (let i = 0; i < s.playerHands.length; i++) {
        const hand = s.playerHands[i];
        const pTotal = handTotal(hand);
        const isOnly = s.playerHands.length === 1;
        const pBJ = isBlackjack(hand) && isOnly;
        const bet = s.bets[i];
        const lbl = isOnly ? '' : `Tay ${i + 1}: `;
        if (pTotal > 21) { results.push(`${lbl}💀 Bust (mất ${bet.toLocaleString()}G)`); continue; }
        if (pBJ && dBJ) { ctx.S.coins = (ctx.S.coins || 0) + bet; results.push(`${lbl}🤝 Hoà BJ`); continue; }
        if (pBJ) { const p = bet + Math.floor(bet * 1.5); ctx.S.coins = (ctx.S.coins || 0) + p; results.push(`${lbl}♠ BLACKJACK +${Math.floor(bet*1.5).toLocaleString()}G`); continue; }
        if (dBJ) { results.push(`${lbl}💔 Dealer BJ`); continue; }
        if (dBust || pTotal > dTotal) { ctx.S.coins = (ctx.S.coins || 0) + bet * 2; results.push(`${lbl}✅ Thắng +${bet.toLocaleString()}G`); continue; }
        if (pTotal === dTotal) { ctx.S.coins = (ctx.S.coins || 0) + bet; results.push(`${lbl}🤝 Hoà`); continue; }
        results.push(`${lbl}❌ Thua`);
    }
    save(); renderStatus();
    showMsg(results.join('\n'));
}

function showMsg(text) {
    const el = All.$id('bj-message');
    if (el) el.innerHTML = text.replace(/\n/g, '<br>');
}

function soloNewRound() {
    const s = soloState;
    s.phase = 'bet'; s.playerHands = [[]]; s.activeHandIdx = 0;
    s.dealerHand = []; s.bets = [0]; s.insuranceBet = 0; s.splitAceIdxs = new Set();
    const msgEl = All.$id('bj-message');
    if (msgEl) msgEl.innerHTML = '';
    soloRender();
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOM MODE
// ─────────────────────────────────────────────────────────────────────────────
let bjPeer = null;
let bjConns = {};
let bjIsHost = false;
let bjMyId = '';
let bjRoomId = '';
let bjPlayers = {};
let bjGameState = null;
let bjSettings = { minBet: 10, maxBet: 0, numDecks: 6, delay: 10 };
let bjMyStatus = 'idle';
let bjChatLog = [];
let bjUnreadChat = 0;
let bjRoomPhase = 'lobby'; // 'lobby' | 'ingame' | 'summary'
let bjSummaryTimer = null;
let bjSummaryTimeLeft = 0;
let bjSummaryData = null;
const MAX_PLAYERS = 4;

function bjMyName() { return bjEscapeHTML(ctx.S.username || 'Khách'); }

export function openBlackjackRoom() {
    const win = All.$id('bj-win');
    if (win) {
        win.classList.add('open');
        win.style.display = 'flex';
        All.placeBjWin();
    }
    bjResetState();
    bjRenderMenu();
}

export function closeBlackjack() {
    if (bjPeer) { try { bjPeer.destroy(); } catch (e) {} bjPeer = null; }
    bjConns = {};
    bjResetState();
    const win = All.$id('bj-win');
    if (win) {
        win.classList.remove('open');
        win.style.display = 'none';
    }
}

function bjResetState() {
    bjConns = {}; bjIsHost = false; bjMyId = ''; bjRoomId = '';
    bjPlayers = {}; bjGameState = null; bjMyStatus = 'idle'; bjChatLog = []; bjUnreadChat = 0;
    bjRoomPhase = 'lobby';
    if (bjSummaryTimer) clearInterval(bjSummaryTimer);
    bjSummaryTimer = null;
    bjSummaryTimeLeft = 0;
    bjSummaryData = null;
}

function bjBroadcast(data, excludePid) {
    for (const [pid, conn] of Object.entries(bjConns)) {
        if (pid === excludePid) continue;
        if (conn && conn.open) conn.send(data);
    }
}

function bjRenderMenu() {
    const body = All.$id('bj-body');
    if (!body) return;
    if (!ctx.S.username) {
        body.innerHTML = `<div style="padding:20px;text-align:center;display:flex;flex-direction:column;gap:12px;">
            <div class="bj-msg-sm">Bạn cần có tên người chơi trước</div>
            <input class="inp" id="bj-inp-name" placeholder="Nhập tên của bạn...">
            <div class="buy" id="bj-save-name" style="text-align:center">Lưu tên</div>
        </div>`;
        All.$id('bj-save-name').onclick = () => {
            const v = (All.$id('bj-inp-name').value || '').trim();
            if (!v) return bjToast('Tên không được trống!');
            ctx.S.username = v;
            save();
            bjRenderMenu();
        };
        return;
    }
    body.innerHTML = `<div style="padding:20px;display:flex;flex-direction:column;gap:14px;text-align:center;">
        <div style="font-weight:bold;color:#ffd94d;font-size:14px;">🎰 Phòng Blackjack — ${bjMyName()}</div>
        <div class="buy" id="bj-host-btn" style="text-align:center">🎰 Tạo Phòng (Host)</div>
        <div style="display:flex;gap:8px;">
            <input class="inp" id="bj-join-code" placeholder="Nhập mã phòng..." style="flex:1">
            <div class="buy plain" id="bj-join-btn">Tham gia</div>
        </div>
        <div id="bj-room-status" style="font-size:12px;color:#e05;font-weight:bold;min-height:16px;"></div>
    </div>`;
    All.$id('bj-host-btn').onclick = bjHostRoom;
    All.$id('bj-join-btn').onclick = bjJoinRoom;
}

function bjUpdateStatus(msg, color) {
    const el = All.$id('bj-room-status');
    if (el) { el.textContent = msg; el.style.color = color || '#ffd94d'; }
}

async function bjHostRoom() {
    bjUpdateStatus('Đang tạo phòng...', '#ffd94d');
    const roomId = 'bj-' + Math.random().toString(36).substr(2, 6);
    const peerOpts = await buildPeerConfigAsync();
    bjPeer = new Peer(roomId, peerOpts);
    bjIsHost = true;
    bjPeer.on('open', id => {
        bjMyId = id; bjRoomId = id;
        bjPlayers[id] = { name: bjMyName(), status: 'idle' };
        bjRenderRoom();
    });
    bjPeer.on('connection', inConn => {
        const active = Object.keys(bjConns).filter(p => bjConns[p] && bjConns[p].open);
        if (active.length >= MAX_PLAYERS - 1) {
            inConn.on('open', () => { inConn.send({ type: 'ROOM_FULL' }); setTimeout(() => inConn.close(), 500); });
            return;
        }
        inConn.on('open', () => {
            bjConns[inConn.peer] = inConn;
            bjSetupConn(inConn);
        });
    });
    bjPeer.on('error', err => bjUpdateStatus('Lỗi: ' + err.type, '#e05'));
}

async function bjJoinRoom() {
    const code = (All.$id('bj-join-code')?.value || '').trim();
    if (!code) return bjUpdateStatus('Nhập mã phòng!', '#e05');
    bjUpdateStatus('Đang kết nối...', '#ffd94d');
    const peerOpts = await buildPeerConfigAsync();
    const myShortId = 'bj-' + Math.random().toString(36).substr(2, 6);
    bjPeer = new Peer(myShortId, peerOpts);
    bjIsHost = false;
    bjPeer.on('open', () => {
        const conn = bjPeer.connect(code, { reliable: true });
        bjConns[code] = conn;
        conn.on('open', () => {
            bjRoomId = code; bjMyId = bjPeer.id;
            bjSetupConn(conn);
            conn.send({ type: 'HELLO', name: bjMyName(), id: bjMyId });
        });
        conn.on('error', () => bjUpdateStatus('Lỗi kết nối!', '#e05'));
    });
    bjPeer.on('connection', inConn => {
        const active = Object.keys(bjConns).filter(p => bjConns[p] && bjConns[p].open);
        if (active.length >= MAX_PLAYERS - 1) {
            inConn.on('open', () => { inConn.send({ type: 'ROOM_FULL' }); setTimeout(() => inConn.close(), 500); });
            return;
        }
        inConn.on('open', () => {
            bjConns[inConn.peer] = inConn;
            bjSetupConn(inConn);
        });
    });
    bjPeer.on('error', err => bjUpdateStatus('Lỗi: ' + err.type, '#e05'));
}

function bjSetupConn(conn) {
    conn.on('data', data => bjHandleMsg(conn.peer, data));
    conn.on('close', () => bjHandleDisconnect(conn.peer));
    conn.on('error', () => bjHandleDisconnect(conn.peer));
}

function bjBroadcastProfits() {
    if (!bjIsHost) return;
    const profits = {};
    for (const p in bjPlayers) profits[p] = bjPlayers[p].netProfit || 0;
    const msg = { type: 'UPDATE_PROFITS', profits };
    bjBroadcast(msg);
    bjHandleMsg(bjMyId, msg);
}

function bjHandleMsg(fromPid, data) {
    switch (data.type) {
        case 'HELLO': {
            const status = (bjGameState && bjRoomPhase !== 'summary') ? 'spectator' : 'idle';
            const safeName = bjEscapeHTML(data.name || 'Khách');
            bjPlayers[fromPid] = { name: safeName, status, netProfit: 0 };
            if (bjIsHost) {
                bjBroadcast({ type: 'PLAYER_JOIN', pid: fromPid, name: safeName, status }, fromPid);
                bjConns[fromPid].send({ type: 'WELCOME', players: bjPlayers, settings: bjSettings, gameState: bjGameState, roomPhase: bjRoomPhase, summaryData: bjSummaryData, chatLog: bjChatLog });
            }
            bjSystemChat(`${safeName} đã vào phòng`);
            bjRenderRoom();
            break;
        }
        case 'WELCOME':
            bjPlayers = data.players || {}; bjSettings = data.settings || bjSettings;
            bjGameState = data.gameState || null;
            bjRoomPhase = data.roomPhase || (bjGameState ? 'ingame' : 'lobby');
            bjSummaryData = data.summaryData || null;
            if (data.chatLog) bjChatLog = data.chatLog;
            bjMyStatus = (bjGameState && bjRoomPhase !== 'summary') ? 'spectator' : 'idle';
            bjRenderRoom(); break;
        case 'PLAYER_JOIN':
            bjPlayers[data.pid] = { name: bjEscapeHTML(data.name || 'Khách'), status: data.status || 'idle', netProfit: 0 };
            bjSystemChat(`${bjPlayers[data.pid].name} đã vào phòng`);
            bjRenderRoom(); break;
        case 'PLAYER_LEFT':
            delete bjPlayers[data.pid];
            if (bjGameState) bjGameState.turnOrder = bjGameState.turnOrder.filter(p => p !== data.pid);
            bjRenderRoom(); break;
        case 'READY':
            if (bjPlayers[fromPid]) bjPlayers[fromPid].status = data.ready ? 'ready' : 'idle';
            if (bjIsHost) bjBroadcast({ type: 'READY', pid: fromPid, ready: data.ready }, fromPid);
            bjRenderRoom(); break;
        case 'BET_REQUEST':
            if (bjIsHost) {
                if (typeof data.bet !== 'number' || data.bet <= 0 || !Number.isFinite(data.bet)) break;
                if (data.bet < bjSettings.minBet) break;
                if (bjSettings.maxBet > 0 && data.bet > bjSettings.maxBet) break;
                if (!bjGameState || bjGameState.phase !== 'betting' || (bjGameState.betsIn && bjGameState.betsIn[fromPid])) break;
                if (fromPid === bjMyId) {
                    ctx.S.coins -= data.bet; save(); renderStatus();
                } else if (bjConns[fromPid]) {
                    bjConns[fromPid].send({ type: 'DEDUCT_COINS', amount: data.bet });
                }
                bjHandleMsg(fromPid, { type: 'BET_PLACED', pid: fromPid, bet: data.bet });
            }
            break;
        case 'BET_PLACED':
            if (!bjIsHost && fromPid !== bjRoomId) break;
            if (bjGameState) {
                if (!bjGameState.hands[data.pid]) {
                    bjGameState.hands[data.pid] = { cards: [[]], bet: [0], stood: [false], doubled: [false], activeHandIdx: 0, splitAceIdxs: [], insuranceBet: 0, surrendered: false };
                }
                bjGameState.hands[data.pid].bet[0] = data.bet;
                bjGameState.betsIn = bjGameState.betsIn || {};
                bjGameState.betsIn[data.pid] = data.bet;
                if (bjIsHost) {
                    if (bjPlayers[data.pid]) bjPlayers[data.pid].netProfit = (bjPlayers[data.pid].netProfit || 0) - data.bet;
                    bjBroadcastProfits();
                    bjBroadcast({ type: 'BET_PLACED', pid: data.pid, bet: data.bet });
                }
                const allBet = bjGameState.turnOrder.every(p => bjGameState.betsIn?.[p] > 0);
                if (allBet && bjIsHost) {
                    if (bjGameState.betTimer) clearTimeout(bjGameState.betTimer);
                    bjHostRunDealerInitial();
                }
                bjRenderRoom();
            }
            break;
        case 'SETTINGS_UPDATE':
            bjSettings = data.settings;
            bjSystemChat(`Host cập nhật: min ${bjSettings.minBet}G, chờ ${bjSettings.delay}s`);
            bjRenderRoom(); break;
        case 'KICKED':
            bjToast('Bạn đã bị đuổi khỏi phòng.');
            closeBlackjack(); break;
        case 'ROUND_START':
            bjGameState = {
                phase: 'betting', seed: data.seed, shoeIdx: 0,
                shoe: buildShoe(bjSettings.numDecks, data.seed),
                hands: {}, dealerHand: [], currentTurn: null,
                turnOrder: data.turnOrder, betsIn: {}, insuranceAnswers: {},
            };
            bjRoomPhase = 'ingame';
            bjSummaryData = null;
            if (bjSummaryTimer) { clearInterval(bjSummaryTimer); bjSummaryTimer = null; }
            bjMyStatus = (bjPlayers[bjMyId]?.status === 'spectator') ? 'spectator' : 'betting';
            bjRenderRoom();
            break;
        case 'DEAL_CARDS':
            if (bjGameState) {
                bjGameState.hands = data.hands; bjGameState.dealerHand = data.dealerHand;
                bjGameState.phase = data.phase; bjGameState.currentTurn = data.currentTurn;
                if (data.shoeIdx !== undefined) bjGameState.shoeIdx = data.shoeIdx;
            }
            bjMyStatus = bjGameState?.hands[bjMyId] ? 'playing' : 'spectator';
            bjRenderRoom(); break;
        case 'ACTION':
            bjHandleRoomAction(fromPid, data); break;
        case 'SUMMARY_START':
            if (!bjIsHost && fromPid !== bjRoomId) break;
            if (data.payouts) {
                const payout = data.payouts[bjMyId] || 0;
                if (payout > 0) {
                    ctx.S.coins = (ctx.S.coins || 0) + payout;
                    save(); renderStatus();
                    bjToast(`Nhận ${payout.toLocaleString()}G từ bàn!`);
                }
            }
            for (const p of Object.keys(bjPlayers)) {
                if (bjPlayers[p].status === 'spectator') bjPlayers[p].status = 'idle';
            }
            bjSummaryData = data;
            bjRoomPhase = 'summary';
            bjMyStatus = 'idle';
            bjRenderRoom(); break;
        case 'TIMER_TICK':
            bjSummaryTimeLeft = data.left;
            const tEl = All.$id('bj-summary-timer');
            if (tEl) tEl.innerText = `Vòng mới sau: ${data.left}s`;
            break;
        case 'SKIP_TIMER':
            bjSummaryTimeLeft = 0; break;
        case 'BACK_TO_LOBBY':
            bjGameState = null; bjRoomPhase = 'lobby'; bjSummaryData = null;
            bjRenderRoom(); break;
        case 'CHAT': {
            const chatName = bjEscapeHTML(data.senderName) || bjPlayers[fromPid]?.name || '?';
            bjChatLog.push({ name: chatName, msg: data.msg, ts: Date.now() });
            if (bjChatLog.length > 50) bjChatLog.shift();
            if (!All.$id('bj-chat-wrap')?.classList.contains('open')) { bjUnreadChat++; bjRenderRoom(); }
            bjRenderChat();
            if (bjIsHost && fromPid !== bjMyId) {
                if (!data.senderName) data.senderName = chatName;
                bjBroadcast(data, fromPid);
            }
            break;
        }
        case 'CHAT_REQ': {
            const reqName = bjEscapeHTML(data.senderName) || bjPlayers[fromPid]?.name || bjEscapeHTML(fromPid);
            bjChatLog.push({ name: reqName, isReq: true, reqData: data.reqData, ts: Date.now() });
            if (bjChatLog.length > 50) bjChatLog.shift();
            if (!All.$id('bj-chat-wrap')?.classList.contains('open')) { bjUnreadChat++; bjRenderRoom(); }
            bjRenderChat();
            if (bjIsHost && fromPid !== bjMyId) {
                if (!data.senderName) data.senderName = reqName;
                bjBroadcast(data, fromPid);
            }
            break;
        }
        case 'GIVE_MONEY_REQ': {
            if (typeof data.amount !== 'number' || data.amount <= 0 || !Number.isFinite(data.amount)) break;
            const log = bjChatLog.find(e => e.reqData && e.reqData.reqId === data.reqId);
            if (log) {
                if (bjIsHost) {
                    let actualGive = data.amount;
                    if (log.reqData.fulfilled + actualGive > log.reqData.amount) actualGive = log.reqData.amount - log.reqData.fulfilled;
                    if (actualGive <= 0) break;
                    if (bjPlayers[fromPid]) bjPlayers[fromPid].netProfit = (bjPlayers[fromPid].netProfit || 0) - actualGive;
                    if (bjPlayers[log.reqData.pid]) bjPlayers[log.reqData.pid].netProfit = (bjPlayers[log.reqData.pid].netProfit || 0) + actualGive;
                    bjBroadcastProfits();
                    
                    if (fromPid === bjMyId) {
                        ctx.S.coins -= actualGive; save(); renderStatus();
                    } else if (bjConns[fromPid]) {
                        bjConns[fromPid].send({ type: 'DEDUCT_COINS', amount: actualGive });
                    }

                    if (log.reqData.pid === bjMyId) {
                        ctx.S.coins = (ctx.S.coins || 0) + actualGive; save(); renderStatus();
                        bjSystemChat(`${data.from} đã cho bạn ${actualGive.toLocaleString()}G!`);
                    } else if (bjConns[log.reqData.pid]) {
                        bjConns[log.reqData.pid].send({ type: 'ADD_COINS', amount: actualGive, msg: `${data.from} đã cho bạn ${actualGive.toLocaleString()}G!` });
                    }
                    log.reqData.fulfilled += actualGive; bjRenderChat();
                    bjBroadcast({ type: 'SYNC_REQ', reqId: data.reqId, fulfilled: log.reqData.fulfilled });
                }
            }
            break;
        }
        case 'SYNC_REQ':
            if (fromPid === bjRoomId) {
                const log = bjChatLog.find(e => e.reqData && e.reqData.reqId === data.reqId);
                if (log) { log.reqData.fulfilled = data.fulfilled; bjRenderChat(); }
            }
            break;
        case 'ADD_COINS':
            if (fromPid === bjRoomId && typeof data.amount === 'number' && data.amount > 0) {
                ctx.S.coins = (ctx.S.coins || 0) + data.amount; save(); renderStatus();
                if (data.msg) { bjSystemChat(data.msg); bjToast(data.msg); }
            }
            break;
        case 'DEDUCT_COINS':
            if (fromPid === bjRoomId && typeof data.amount === 'number' && data.amount > 0) {
                ctx.S.coins = (ctx.S.coins || 0) - data.amount; save(); renderStatus();
            }
            break;
        case 'UPDATE_PROFITS':
            if (data.profits) {
                for (const p in data.profits) {
                    if (bjPlayers[p]) bjPlayers[p].netProfit = data.profits[p];
                }
                const modal = document.querySelector('.bj-player-list-modal');
                if (modal) bjRenderPlayerListModal();
            }
            break;
        case 'ROOM_FULL':
            bjToast('Phòng đã đầy!'); closeBlackjack(); break;
    }
}

function bjHandleDisconnect(pid) {
    if (!bjConns[pid] && !bjPlayers[pid] && pid !== bjRoomId) return; // Already handled
    
    delete bjConns[pid];
    if (bjPlayers[pid]) {
        const name = bjPlayers[pid].name;
        delete bjPlayers[pid];
        bjSystemChat(`${name} đã rời phòng`);
        if (bjIsHost) {
            if (bjGameState) {
                bjGameState.turnOrder = bjGameState.turnOrder.filter(p => p !== pid);
                if (bjGameState.currentTurn === pid) bjAdvanceTurn();
            }
            bjBroadcast({ type: 'PLAYER_LEFT', pid });
            bjRenderRoom();
        }
    }
    
    if (!bjIsHost) {
        if (pid === bjRoomId) {
            // Host disconnected! Host Migration
            const remainingPids = Object.keys(bjPlayers).sort();
            if (remainingPids.length > 0) {
                const newHostId = remainingPids[0];
                if (newHostId === bjMyId) {
                    bjIsHost = true;
                    bjRoomId = bjMyId;
                    bjSystemChat(`Host cũ thoát. Bạn đã trở thành Host mới!`);
                    if (bjGameState) {
                        bjGameState.turnOrder = bjGameState.turnOrder.filter(p => p !== pid);
                        if (bjGameState.currentTurn === pid) bjAdvanceTurn();
                        
                        if (bjGameState.phase === 'dealer' || bjGameState.phase === 'dealer_bj') {
                            setTimeout(() => bjHostRunDealer(), 1000);
                        } else if (bjGameState.phase === 'betting') {
                            const allBet = bjGameState.turnOrder.every(p => bjGameState.betsIn?.[p] > 0);
                            if (allBet) setTimeout(() => bjHostRunDealerInitial(), 1000);
                        } else if (bjGameState.phase === 'player' && bjGameState.currentTurn == null) {
                            bjAdvanceTurn();
                        }
                    }
                    if (bjRoomPhase === 'summary' && !bjSummaryTimer) {
                        bjSummaryTimer = setInterval(() => {
                            bjSummaryTimeLeft--;
                            if (bjSummaryTimeLeft <= 0) bjHostEndSummary();
                            else {
                                bjBroadcast({ type: 'TIMER_TICK', left: bjSummaryTimeLeft });
                                const tEl = All.$id('bj-summary-timer');
                                if (tEl) tEl.innerText = `Vòng mới sau: ${bjSummaryTimeLeft}s`;
                            }
                        }, 1000);
                    }
                    bjRenderRoom();
                } else {
                    bjRoomId = newHostId;
                    bjSystemChat(`Host cũ thoát. Đang đổi Host tới ${bjPlayers[newHostId]?.name || 'người chơi khác'}...`);
                    const conn = bjPeer.connect(newHostId, { reliable: true });
                    bjConns[newHostId] = conn;
                    conn.on('open', () => {
                        bjSetupConn(conn);
                        conn.send({ type: 'HELLO', name: bjMyName(), id: bjMyId });
                    });
                    conn.on('error', () => { bjToast('Không thể kết nối đến Host mới!'); closeBlackjack(); });
                }
            } else {
                closeBlackjack(); bjToast('Phòng đã đóng.');
            }
        } else {
            bjRenderRoom();
        }
    }
}

function bjHostStartRound() {
    const connPids = Object.keys(bjConns).filter(p => bjConns[p] && bjConns[p].open);
    const pids = [bjMyId, ...connPids];
    const active = pids.filter(p => bjPlayers[p] && bjPlayers[p].status !== 'spectator');
    if (active.length === 0) return bjToast('Cần ít nhất 1 người chơi');
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) & 0xffffffff;
    
    bjGameState = {
        phase: 'betting', seed, shoeIdx: 0,
        shoe: buildShoe(bjSettings.numDecks, seed),
        hands: {}, dealerHand: [], currentTurn: null,
        turnOrder: active, betsIn: {}, insuranceAnswers: {},
    };
    for (const pid of active) {
        bjGameState.hands[pid] = { cards: [[]], bet: [0], stood: [false], doubled: [false], activeHandIdx: 0, splitAceIdxs: [], insuranceBet: 0, surrendered: false };
    }
    bjRoomPhase = 'ingame';
    bjMyStatus = 'betting';
    bjBroadcast({ type: 'ROUND_START', seed, turnOrder: active });
    bjRenderRoom();
}

function bjHostRunDealerInitial() {
    const gs = bjGameState;
    const shoe = gs.shoe;
    let idx = gs.shoeIdx;
    const draw = (hidden) => ({ ...shoe[idx++], hidden: !!hidden, isNew: true });

    for (const pid of gs.turnOrder) {
        gs.hands[pid].cards[0].push(draw());
    }
    gs.dealerHand.push(draw());
    for (const pid of gs.turnOrder) gs.hands[pid].cards[0].push(draw());
    gs.dealerHand.push(draw(true));
    gs.shoeIdx = idx;

    const up = gs.dealerHand[0];
    let phase = 'player';
    if (up.rank === 'A') {
        phase = 'insurance'; gs.insuranceAnswers = {};
    } else if (is10Value(up.rank)) {
        if (isBlackjack([gs.dealerHand[0], { ...gs.dealerHand[1], hidden: false }])) {
            gs.dealerHand[1].hidden = false; phase = 'dealer_bj';
        }
    }
    gs.phase = phase; gs.currentTurn = phase === 'player' ? gs.turnOrder[0] : null;

    const msg = { type: 'DEAL_CARDS', hands: gs.hands, dealerHand: gs.dealerHand, phase, currentTurn: gs.currentTurn, shoeIdx: gs.shoeIdx };
    bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
    if (phase === 'dealer_bj') setTimeout(() => bjHostEndRound(), 1500);
    else if (phase === 'player') bjAutoStandBJs();
}

function bjAutoStandBJs() {
    const gs = bjGameState;
    for (const pid of gs.turnOrder) {
        const h = gs.hands[pid];
        if (h && isBlackjack(h.cards[0])) h.stood[0] = true;
    }
    bjAdvanceTurn();
}

function bjCheckInsuranceAnswers() {
    const gs = bjGameState;
    if (!gs.turnOrder.every(p => (gs.insuranceAnswers || {})[p] !== undefined)) return;
    let profitChanged = false;
    for (const pid of gs.turnOrder) {
        const ans = gs.insuranceAnswers[pid];
        const h = gs.hands[pid];
        if (ans === 'ins' && !h.insuranceBetPaid) {
            h.insuranceBet = Math.floor(h.bet[0] / 2);
            h.insuranceBetPaid = true;
            if (bjPlayers[pid]) bjPlayers[pid].netProfit = (bjPlayers[pid].netProfit || 0) - h.insuranceBet;
            if (pid === bjMyId) {
                ctx.S.coins -= h.insuranceBet; save(); renderStatus();
            } else if (bjConns[pid]) {
                bjConns[pid].send({ type: 'DEDUCT_COINS', amount: h.insuranceBet });
            }
            profitChanged = true;
        }
    }
    if (profitChanged) bjBroadcastProfits();

    if (isBlackjack([gs.dealerHand[0], { ...gs.dealerHand[1], hidden: false }])) {
        gs.dealerHand[1].hidden = false; gs.phase = 'dealer_bj';
        const msg = { type: 'DEAL_CARDS', hands: gs.hands, dealerHand: gs.dealerHand, phase: 'dealer_bj', currentTurn: null, shoeIdx: gs.shoeIdx };
        bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
        setTimeout(() => bjHostEndRound(), 1500);
    } else {
        gs.phase = 'player'; gs.currentTurn = gs.turnOrder[0];
        const msg = { type: 'DEAL_CARDS', hands: gs.hands, dealerHand: gs.dealerHand, phase: 'player', currentTurn: gs.currentTurn, shoeIdx: gs.shoeIdx };
        bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
        bjAutoStandBJs();
    }
}

function bjAdvanceTurn() {
    if (!bjGameState || !bjIsHost) return;
    const gs = bjGameState;
    let next = null;
    for (const pid of gs.turnOrder) {
        const h = gs.hands[pid];
        if (!h) continue;
        const done = h.cards.every((c, i) => h.stood[i] || handTotal(c) >= 21);
        if (!done) { next = pid; break; }
    }
    if (next) {
        gs.currentTurn = next;
        const msg = { type: 'ACTION', actionType: 'TURN_CHANGE', pid: next };
        bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
    } else {
        gs.currentTurn = null;
        bjHostRunDealer();
    }
}

function bjHandleRoomAction(fromPid, data) {
    if (!bjGameState) return;
    const gs = bjGameState;
    if (data.actionType === 'TURN_CHANGE') { gs.currentTurn = data.pid; bjRenderRoom(); return; }
    if (data.actionType === 'DEALER_REVEAL' || data.actionType === 'DEALER_HIT') {
        gs.dealerHand = data.dealerHand; bjRenderRoom(); return;
    }
    
    if (data.actionType === 'INSURANCE_ANSWER') {
        if (bjIsHost && gs.phase === 'insurance') {
            if (data.answer === 'even') {
                const myH = gs.hands[fromPid];
                if (!myH || !isBlackjack(myH.cards[0])) return;
            }
            gs.insuranceAnswers = gs.insuranceAnswers || {};
            gs.insuranceAnswers[fromPid] = data.answer;
            bjCheckInsuranceAnswers();
        }
        return;
    }

    // Non-host clients: apply hand updates from broadcast
    if (!bjIsHost) {
        if (fromPid !== bjRoomId) return;
        if (data.hand && data.pid) {
            gs.hands[data.pid] = data.hand;
            if (data.shoeIdx !== undefined) gs.shoeIdx = data.shoeIdx;
        }
        bjRenderRoom();
        return;
    }

    const h = gs.hands[fromPid];
    if (!h || gs.currentTurn !== fromPid || gs.phase !== 'player') return;
    const idx = h.activeHandIdx || 0;
    if (h.stood[idx] || h.surrendered) return;

    if (data.actionType === 'HIT') {
        h.cards[idx].push({ ...gs.shoe[gs.shoeIdx++], isNew: true });
        if (handTotal(h.cards[idx]) >= 21) {
            h.stood[idx] = true;
            if (idx + 1 < h.cards.length) h.activeHandIdx = idx + 1;
        }
    } else if (data.actionType === 'STAND') {
        h.stood[idx] = true;
        if (idx + 1 < h.cards.length) h.activeHandIdx = idx + 1;
    } else if (data.actionType === 'DOUBLE' && bjIsHost) {
        if (h.cards[idx].length !== 2) return;
        h.cards[idx].push({ ...gs.shoe[gs.shoeIdx++], isNew: true });
        if (bjPlayers[fromPid]) bjPlayers[fromPid].netProfit = (bjPlayers[fromPid].netProfit || 0) - h.bet[idx];
        if (fromPid === bjMyId) {
            ctx.S.coins -= h.bet[idx]; save(); renderStatus();
        } else if (bjConns[fromPid]) {
            bjConns[fromPid].send({ type: 'DEDUCT_COINS', amount: h.bet[idx] });
        }
        h.bet[idx] *= 2; h.stood[idx] = true; h.doubled[idx] = true;
        bjBroadcastProfits();
    } else if (data.actionType === 'SPLIT' && bjIsHost) {
        if (h.cards[idx].length !== 2 || h.cards[idx][0].rank !== h.cards[idx][1].rank) return;
        if (bjPlayers[fromPid]) bjPlayers[fromPid].netProfit = (bjPlayers[fromPid].netProfit || 0) - h.bet[idx];
        if (fromPid === bjMyId) {
            ctx.S.coins -= h.bet[idx]; save(); renderStatus();
        } else if (bjConns[fromPid]) {
            bjConns[fromPid].send({ type: 'DEDUCT_COINS', amount: h.bet[idx] });
        }
        const c2 = h.cards[idx].pop();
        h.cards.splice(idx + 1, 0, [c2]);
        const sc = gs.shoe[gs.shoeIdx++];
        const sc2 = gs.shoe[gs.shoeIdx++];
        h.cards[idx].push({ ...sc, isNew: true });
        const nh = h.cards[idx + 1];
        nh.push({ ...sc2, isNew: true });
        h.bet.splice(idx + 1, 0, h.bet[idx]);
        h.stood.splice(idx + 1, 0, false);
        h.doubled.splice(idx + 1, 0, false);
        if (c2.rank === 'A') {
            h.splitAceIdxs = h.splitAceIdxs || [];
            h.splitAceIdxs.push(idx, idx + 1);
            h.stood[idx] = true; h.stood[idx + 1] = true;
        }
        bjBroadcastProfits();
    } else if (data.actionType === 'SURRENDER') {
        h.surrendered = true; h.stood[idx] = true;
    }

    gs.hands[fromPid] = h;
    bjBroadcast({ type: 'ACTION', actionType: data.actionType, pid: fromPid, hand: h, shoeIdx: gs.shoeIdx });
    const done = h.cards.every((c, i) => h.stood[i] || handTotal(c) >= 21);
    if (done) bjAdvanceTurn(); else bjRenderRoom();
}

function bjHostRunDealer() {
    const gs = bjGameState;
    gs.dealerHand[1].hidden = false;
    gs.dealerHand[1].justRevealed = true;
    gs.phase = 'dealer';
    const allBust = gs.turnOrder.every(p => {
        const h = gs.hands[p];
        return h && h.cards.every(c => handTotal(c) > 21) || h?.surrendered;
    });
    const revMsg = { type: 'ACTION', actionType: 'DEALER_REVEAL', dealerHand: gs.dealerHand };
    bjBroadcast(revMsg); bjHandleMsg(bjMyId, revMsg);
    const step = () => {
        if (allBust) { bjHostEndRound(); return; }
        const tot = handTotal(gs.dealerHand);
        if (tot < 17 || (isSoft(gs.dealerHand) && tot === 17)) {
            gs.dealerHand.push({ ...gs.shoe[gs.shoeIdx++] });
            const hitMsg = { type: 'ACTION', actionType: 'DEALER_HIT', dealerHand: gs.dealerHand };
            bjBroadcast(hitMsg); bjHandleMsg(bjMyId, hitMsg);
            setTimeout(step, 700);
        } else { bjHostEndRound(); }
    };
    setTimeout(step, 700);
}

function bjHostEndRound() {
    const gs = bjGameState;
    const dTotal = handTotal(gs.dealerHand);
    const dBJ = isBlackjack(gs.dealerHand);
    const dBust = dTotal > 21;
    const payouts = {};

    for (const pid of gs.turnOrder) {
        const h = gs.hands[pid];
        if (!h) continue;
        let p = 0;
        const ans = gs.insuranceAnswers?.[pid];
        
        if (ans === 'even') {
            p = h.bet[0] * 2;
        } else {
            if (h.insuranceBet > 0 && dBJ) p += h.insuranceBet * 3;
            for (let i = 0; i < h.cards.length; i++) {
                const cards = h.cards[i]; const bet = h.bet[i];
                const pTotal = handTotal(cards);
                const isOnly = h.cards.length === 1;
                const pBJ = isBlackjack(cards) && isOnly;
                if (h.surrendered && isOnly) { p += Math.floor(bet / 2); continue; }
                if (pTotal > 21) continue;
                if (pBJ && dBJ) { p += bet; continue; }
                if (pBJ) { p += bet + Math.floor(bet * 1.5); continue; }
                if (dBJ) continue;
                if (dBust || pTotal > dTotal) { p += bet * 2; continue; }
                if (pTotal === dTotal) { p += bet; continue; }
            }
        }
        payouts[pid] = p;
    }
    
    for (const pid in payouts) {
        if (bjPlayers[pid]) bjPlayers[pid].netProfit = (bjPlayers[pid].netProfit || 0) + payouts[pid];
    }
    bjBroadcastProfits();

    const msg = { type: 'SUMMARY_START', payouts, dealerHand: gs.dealerHand, gs: JSON.parse(JSON.stringify(gs)) };
    bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
    
    if (bjIsHost) {
        bjSummaryTimeLeft = bjSettings.delay || 10;
        bjSummaryTimer = setInterval(() => {
            bjSummaryTimeLeft--;
            if (bjSummaryTimeLeft <= 0) bjHostEndSummary();
            else {
                bjBroadcast({ type: 'TIMER_TICK', left: bjSummaryTimeLeft });
                const tEl = All.$id('bj-summary-timer');
                if (tEl) tEl.innerText = `Vòng mới sau: ${bjSummaryTimeLeft}s`;
            }
        }, 1000);
    }
}

function bjHostEndSummary() {
    if (bjSummaryTimer) clearInterval(bjSummaryTimer);
    bjSummaryTimer = null;
    const active = Object.keys(bjPlayers).filter(p => bjPlayers[p].status !== 'spectator');
    if (active.length === 0) {
        bjRoomPhase = 'lobby';
        bjGameState = null;
        bjBroadcast({ type: 'BACK_TO_LOBBY' });
        bjRenderRoom();
    } else {
        bjHostStartRound();
    }
}

function bjRoomPlaceBet(amount) {
    const coins = ctx.S.coins || 0;
    if (coins < amount) return bjToast('Không đủ vàng!');
    if (amount < bjSettings.minBet) return bjToast(`Cược tối thiểu ${bjSettings.minBet}G`);

    if (bjSettings.maxBet > 0 && amount > bjSettings.maxBet) return bjToast(`Cược tối đa ${bjSettings.maxBet}G`);
    ctx.S.coins = coins - amount; save(); renderStatus();
    const msg = { type: 'BET_PLACED', pid: bjMyId, bet: amount };
    bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
}

function bjRoomAction(actionType, extra) {
    const msg = { type: 'ACTION', actionType, pid: bjMyId, ...(extra || {}) };
    if (bjIsHost) bjHandleRoomAction(bjMyId, msg);
    else bjBroadcast(msg);
}

function bjApplySettings() {
    const min = parseInt(All.$id('bj-cfg-min')?.value) || 10;
    let max = parseInt(All.$id('bj-cfg-max')?.value) || 0;
    const decks = Math.min(8, Math.max(1, parseInt(All.$id('bj-cfg-decks')?.value) || 6));
    const delay = Math.max(5, parseInt(All.$id('bj-cfg-delay')?.value) || 10);
    bjSettings = { minBet: Math.max(1, min), maxBet: Math.max(0, max), numDecks: decks, delay };
    bjBroadcast({ type: 'SETTINGS_UPDATE', settings: bjSettings });
    bjToast(`Đã cập nhật: min ${bjSettings.minBet}G, chờ ${delay}s`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOM — Render
// ─────────────────────────────────────────────────────────────────────────────
function bjRenderRoom() {
    const body = All.$id('bj-body');
    if (!body) return;

    if (!All.$id('bj-game-layer')) {
        body.innerHTML = `
            <div class="bj-room-layout" style="width:100%; height:100%;">
                <div id="bj-game-layer" style="flex:1; display:flex; flex-direction:column; overflow-y:hidden; overflow-x:hidden;"></div>
                <div class="bj-chat-wrap" id="bj-chat-wrap">
                    <div class="bj-chat-header" id="bj-chat-close">
                        <span>💬 Chat</span>
                        <span class="bj-chat-close">❌</span>
                    </div>
                    <div class="bj-chat-log" id="bj-chat-log"></div>
                    <div class="bj-chat-inp-row">
                        <div class="buy plain" id="bj-chat-req-btn" style="padding:4px 8px;" title="Xin tiền">💰</div>
                        <input class="inp bj-chat-inp" id="bj-chat-inp" placeholder="Chat..." style="flex:1" enterkeyhint="send">
                        <div class="buy plain" id="bj-chat-send" style="white-space:nowrap">Gửi</div>
                    </div>
                </div>
            </div>
        `;
        bjBindChatBase();
        bjRenderChat();
    }

    const gameLayer = All.$id('bj-game-layer');
    const gs = bjGameState;
    const allPids = Object.keys(bjPlayers);

    let html = `
        <div class="bj-room-main" style="flex:1; display:flex; flex-direction:column;">
            <div class="bj-room-topbar">
                <div class="bj-room-code-badge" id="bj-room-code-badge" title="Copy mã phòng">🃋 ${bjRoomId}</div>
                <div style="font-size:11px;color:#ddd;flex:1;text-align:center;">${bjMyName()} — ${(ctx.S.coins||0).toLocaleString()}G${bjMyStatus==='spectator'?' 👁':''}</div>
                <div class="buy plain" id="bj-show-players" style="font-size:11px;margin-right:5px;">👥 Danh Sách</div>
                <div class="buy plain" id="bj-out-room-ingame" style="font-size:11px;">← Thoát</div>
                <div class="bj-chat-toggle" id="bj-chat-toggle">💬 Chat ${bjUnreadChat > 0 ? `<span style="background:#e74c3c;color:white;border-radius:10px;padding:1px 5px;margin-left:5px;font-size:10px;">${bjUnreadChat}</span>` : ''}</div>
            </div>
            <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding-bottom: 10px;">`;

    if (bjRoomPhase === 'lobby') {
        const isAllReady = allPids.filter(p => p !== bjMyId && bjPlayers[p].status !== 'spectator').every(p => bjPlayers[p].status === 'ready');
        html += `<div class="bj-lobby-wrap">
            <div class="bj-lobby-box">
                <div class="bj-lobby-title">Sảnh Chờ</div>
                <div class="bj-player-list">
                    ${allPids.map(p => {
                        const isHost = (p === bjRoomId);
                        const ready = bjPlayers[p].status === 'ready';
                        const meStr = p === bjMyId ? ' (Bạn)' : '';
                        const kickBtn = (bjIsHost && p !== bjMyId) ? `<button class="bj-kick-btn" data-pid="${p}">Kick</button>` : '';
                        return `<div class="bj-player-row ${ready ? 'ready' : ''} ${isHost ? 'host' : ''}">
                            <span>${bjPlayers[p].name}${meStr} ${isHost?'👑':(ready?'✔':'⏳')}</span>
                            ${kickBtn}
                        </div>`;
                    }).join('')}
                </div>
                ${bjIsHost ? `
                <div class="bj-settings-host">
                    <div style="font-size:12px;font-weight:bold;color:#ffd94d;margin-bottom:6px;">⚙️ Cài đặt bàn</div>
                    <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
                        <label style="font-size:11px;color:#ddd;">Min <input class="inp" id="bj-cfg-min" type="number" value="${bjSettings.minBet}" min="1" style="width:50px;padding:4px;font-size:11px"></label>
                        <label style="font-size:11px;color:#ddd;">Max <input class="inp" id="bj-cfg-max" type="number" value="${bjSettings.maxBet}" min="0" style="width:50px;padding:4px;font-size:11px"></label>
                        <label style="font-size:11px;color:#ddd;">Bộ <input class="inp" id="bj-cfg-decks" type="number" value="${bjSettings.numDecks}" min="1" max="8" style="width:40px;padding:4px;font-size:11px"></label>
                        <label style="font-size:11px;color:#ddd;">Chờ(s) <input class="inp" id="bj-cfg-delay" type="number" value="${bjSettings.delay}" min="5" style="width:40px;padding:4px;font-size:11px"></label>
                        <div class="buy plain" id="bj-cfg-apply" style="font-size:11px;padding:4px 8px">Lưu</div>
                    </div>
                </div>
                <div class="bj-btn-row" style="margin-top:15px;">
                    <div class="buy ${!isAllReady && allPids.length > 1 ? 'plain' : ''}" id="bj-start-room-btn" ${!isAllReady && allPids.length > 1 ? 'style="opacity:0.5;pointer-events:none"' : ''}>▶ Bắt đầu</div>
                </div>
                ` : `
                <div class="bj-btn-row" style="margin-top:15px;">
                    <div class="buy bj-btn-ready ${bjPlayers[bjMyId].status === 'ready' ? '' : 'not-ready'}" id="bj-ready-btn">${bjPlayers[bjMyId].status === 'ready' ? 'Hủy Sẵn Sàng' : 'Sẵn Sàng'}</div>
                </div>
                <div class="bj-msg-sm" style="text-align:center;padding:10px;opacity:0.7">Chờ Host bắt đầu...</div>
                `}
            </div>
        </div>`;
    } else {
        // ingame or summary
        html += `<div class="bj-table">
            <div class="bj-dealer-area">
                <div class="bj-area-label">Nhà cái (máy)</div>
                <div class="bj-hand-row">${(gs?.dealerHand||[]).map(c => cardHTML(c, true)).join('')}</div>
                <div class="bj-score">${gs?.dealerHand?.length ? `Điểm: ${handTotal(gs.dealerHand.filter(c=>!c.hidden))}` : ''}</div>
            </div>
            <div class="bj-players-grid">`;
        for (const pid of (gs?.turnOrder || [])) {
            const ph = bjPlayers[pid] || { name: pid };
            const h = gs.hands?.[pid];
            const isMe = pid === bjMyId, isTurn = gs.currentTurn === pid;
            html += `<div class="bj-player-slot${isMe?' me':''}${isTurn?' my-turn':''}">
                <div class="bj-player-name">${ph.name}${isTurn?' ➤':''}${isMe?' (Bạn)':''}</div>`;
            if (h) {
                h.cards.forEach((cards, i) => {
                    const tot = handTotal(cards);
                    html += `<div class="bj-hand-row">${cards.map(c => cardHTML(c,true)).join('')}</div>
                        <div class="bj-score">${tot}${tot>21?' Bust!':''} — ${(h.bet[i]||0).toLocaleString()}G</div>`;
                });
            } else html += `<div class="bj-msg-sm" style="opacity:0.5">Chờ đặt cược...</div>`;
            html += `</div>`;
        }
        for (const pid of allPids) {
            if (!gs?.turnOrder?.includes(pid)) {
                html += `<div class="bj-player-slot spectator"><div class="bj-player-name">👁 ${bjPlayers[pid].name} (xem)</div></div>`;
            }
        }
        html += `</div></div>
        <div id="bj-my-actions" class="bj-actions">${bjBuildMyActions()}</div>
        <div id="bj-room-msg" class="bj-message"></div>`;

        if (bjRoomPhase === 'summary' && bjSummaryData) {
            html += `<div class="bj-summary-overlay">
                <div class="bj-summary-box">
                    <div class="bj-summary-title">TỔNG KẾT VÒNG</div>
                    <table class="bj-summary-table">
                        <tr><th>Người chơi</th><th>Điểm</th><th>Cược</th><th>Kết quả</th><th>Nhận</th></tr>
                        <tr><td><b>Nhà cái</b></td><td>${handTotal(bjSummaryData.dealerHand)}</td><td>-</td><td>-</td><td>-</td></tr>
                        ${(bjSummaryData.gs?.turnOrder || []).map(pid => {
                            const name = bjPlayers[pid]?.name || pid;
                            const h = bjSummaryData.gs.hands[pid];
                            if (!h) return '';
                            let pts = h.cards.map(c => handTotal(c)).join(' / ');
                            let bet = h.bet.reduce((a,b)=>a+b, 0) + (h.insuranceBet||0);
                            let pay = bjSummaryData.payouts[pid] || 0;
                            let resCls = pay > bet ? 'bj-val-win' : (pay === bet ? 'bj-val-push' : 'bj-val-lose');
                            return `<tr class="${pid===bjMyId?'me':''}"><td>${name}</td><td>${pts}</td><td>${bet.toLocaleString()}</td><td class="${resCls}">${pay>bet?'Thắng':(pay===bet?'Hòa':'Thua')}</td><td class="${resCls}">+${pay.toLocaleString()}</td></tr>`;
                        }).join('')}
                    </table>
                    <div class="bj-countdown" id="bj-summary-timer">Vòng mới sau: ${bjSummaryTimeLeft}s</div>
                    ${bjIsHost ? `<div class="bj-btn-row" style="margin-top:15px;"><div class="buy plain" id="bj-skip-btn">Bỏ qua (Skip)</div></div>` : ''}
                </div>
            </div>`;
        }
    }

    html += `</div>`;
    
    gameLayer.innerHTML = html;

    All.$id('bj-chat-toggle')?.addEventListener('click', () => {
        All.$id('bj-chat-wrap')?.classList.add('open');
        if (bjUnreadChat > 0) { bjUnreadChat = 0; bjRenderRoom(); }
    });

    All.$id('bj-out-room-ingame')?.addEventListener('click', closeBlackjack);
    All.$id('bj-show-players')?.addEventListener('click', () => {
        const modalId = 'bj-player-list-modal';
        const exist = All.$id(modalId);
        if (exist) { exist.remove(); return; }
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'bj-player-list-modal';
        modal.style.cssText = 'position:absolute;top:50px;left:50%;transform:translateX(-50%);background:rgba(20,20,20,0.95);border:1px solid #555;border-radius:8px;padding:15px;z-index:9999;width:90%;max-width:400px;box-shadow:0 8px 30px rgba(0,0,0,0.8);max-height:80%;overflow-y:auto;';
        All.$id('bj-win').appendChild(modal);
        bjRenderPlayerListModal();
    });
    All.$id('bj-room-code-badge')?.addEventListener('click', () => {
        navigator.clipboard.writeText(bjRoomId).then(() => bjToast('Copy mã phòng!'));
    });
    All.$id('bj-start-room-btn')?.addEventListener('click', () => { if (bjIsHost) bjHostStartRound(); });
    All.$id('bj-cfg-apply')?.addEventListener('click', bjApplySettings);
    All.$id('bj-ready-btn')?.addEventListener('click', () => {
        const isReady = bjPlayers[bjMyId].status !== 'ready';
        const msg = { type: 'READY', ready: isReady };
        bjHandleMsg(bjMyId, msg);
        if (!bjIsHost) bjBroadcast(msg);
    });
    All.$id('bj-skip-btn')?.addEventListener('click', () => {
        if (bjIsHost) {
            bjSummaryTimeLeft = 0;
            bjBroadcast({ type: 'SKIP_TIMER' });
            bjHostEndSummary();
        }
    });
    All.$id('bj-win').querySelectorAll('.bj-kick-btn').forEach(b => b.addEventListener('click', () => {
        const pid = b.getAttribute('data-pid');
        if (confirm('Bạn muốn đuổi người chơi này?')) {
            if (bjConns[pid]) bjConns[pid].send({ type: 'KICKED' });
            setTimeout(() => {
                if (bjConns[pid]) bjConns[pid].close();
                bjHandleDisconnect(pid);
            }, 500);
        }
    }));
    bjBindMyActions();
}

function bjRenderPlayerListModal() {
    const modal = All.$id('bj-player-list-modal');
    if (!modal) return;
    modal.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid #444;padding-bottom:10px;">
            <div style="font-weight:bold;color:#ffd94d;">DANH SÁCH NGƯỜI CHƠI</div>
            <div class="buy plain" id="bj-player-list-close" style="padding:2px 8px;cursor:pointer;">Đóng</div>
        </div>
        <table class="bj-summary-table" style="width:100%; text-align:left;">
            <tr><th>Tên</th><th>Vai trò</th><th>Lợi nhuận</th></tr>
            ${Object.keys(bjPlayers).map(p => {
                const pl = bjPlayers[p];
                const prof = pl.netProfit || 0;
                const color = prof > 0 ? '#4caf50' : (prof < 0 ? '#f44336' : '#fff');
                const sign = prof > 0 ? '+' : '';
                return `<tr>
                    <td>${pl.name} ${p === bjMyId ? '(Bạn)' : ''}</td>
                    <td>${pl.status === 'spectator' ? '👁️ Đang xem' : (p === bjRoomId ? '👑 Host' : 'Khách')}</td>
                    <td style="color:${color}; font-weight:bold;">${sign}${prof.toLocaleString()}G</td>
                </tr>`;
            }).join('')}
        </table>
    `;
    All.$id('bj-player-list-close')?.addEventListener('click', () => modal.remove());
}

function bjBuildMyActions() {
    const gs = bjGameState;
    if (!gs) return '';
    if (bjMyStatus === 'spectator') return `<div class="bj-msg-sm" style="text-align:center;opacity:0.6">👁 Đang xem — Sẽ vào ở round sau</div>`;
    const coins = ctx.S.coins || 0;

    if (gs.phase === 'betting') {
        if (gs.betsIn?.[bjMyId]) return `<div class="bj-msg-sm" style="text-align:center;color:#7ed;">✓ Đã đặt ${gs.betsIn[bjMyId].toLocaleString()}G — Chờ người khác...</div>`;
        const min = bjSettings.minBet;
        if (coins < min) return `<div class="bj-msg-sm" style="color:#e05;">⚠ Không đủ vàng cược (cần tối thiểu ${min}G)</div>`;
        return `<div class="bj-bet-row">
            <input class="inp" id="bj-room-bet-inp" type="number" min="${min}" max="${bjSettings.maxBet||''}" value="${Math.min(Math.max(min,100),coins)}" style="width:110px">
            <span class="buy plain bj-quick bj-rquick" data-q="4">¼</span>
            <span class="buy plain bj-quick bj-rquick" data-q="2">½</span>
            <span class="buy plain bj-quick bj-rquick" data-q="1">Max</span>
            <div class="buy" id="bj-room-place-bet">Đặt Cược</div>
        </div>`;
    }
    if (gs.phase === 'insurance') {
        const myHand = gs.hands?.[bjMyId];
        if (!myHand) return '';
        const hasBJ = isBlackjack(myHand.cards[0]);
        if (hasBJ) return `<div class="bj-btn-row">
            <div class="buy" id="bj-rm-even">Lấy ngay 1:1 (Even Money)</div>
            <div class="buy plain" id="bj-rm-skip-ins">Bỏ qua</div>
        </div>`;
        const maxIns = Math.floor((myHand.bet[0]||0)/2);
        return `<div class="bj-msg-sm">Dealer Ace — Mua bảo hiểm ${maxIns}G?</div>
        <div class="bj-btn-row">
            <div class="buy" id="bj-rm-buy-ins">Mua ${maxIns}G</div>
            <div class="buy plain" id="bj-rm-skip-ins">Bỏ qua</div>
        </div>`;
    }
    if (gs.phase === 'player') {
        if (gs.currentTurn !== bjMyId) return `<div class="bj-msg-sm" style="text-align:center;opacity:0.6">⌛ Đợi lượt bạn...</div>`;
        const h = gs.hands?.[bjMyId];
        if (!h) return '';
        const idx = h.activeHandIdx || 0;
        const hand = h.cards[idx]; const tot = handTotal(hand); const bet = h.bet[idx];
        const isSA = (h.splitAceIdxs||[]).includes(idx);
        if (tot > 21) return `<div class="bj-msg-sm">💀 Bust!</div>`;
        if (isSA) return `<div class="bj-msg-sm">Split Ace — Tự Stand.</div>`;
        const canD = hand.length===2 && coins>=bet && !isSA;
        const canSp = hand.length===2 && hand[0].rank===hand[1].rank && coins>=bet && h.cards.length<4;
        const canSu = hand.length===2 && idx===0 && h.cards.length===1;
        return `<div class="bj-btn-row">
            <div class="buy" id="bj-rm-hit">Hit</div>
            <div class="buy plain" id="bj-rm-stand">Stand</div>
            ${canD?`<div class="buy bj-double-btn" id="bj-rm-double">Double</div>`:''}
            ${canSp?`<div class="buy bj-split-btn" id="bj-rm-split">Split</div>`:''}
            ${canSu?`<div class="buy plain" id="bj-rm-surrender">Surrender</div>`:''}
        </div>`;
    }
    if (gs.phase==='dealer'||gs.phase==='dealer_bj') return `<div class="bj-msg-sm" style="text-align:center;opacity:0.6">🃏 Nhà cái đang rút bài...</div>`;
    return '';
}

function bjBindMyActions() {
    const gs = bjGameState;
    All.$id('bj-room-place-bet')?.addEventListener('click', () => {
        const inp = All.$id('bj-room-bet-inp');
        bjRoomPlaceBet(parseInt(inp?.value||'0')||0);
    });
    All.$id('bj-win').querySelectorAll('.bj-rquick').forEach(b => {
        b.addEventListener('click', () => {
            const inp = All.$id('bj-room-bet-inp');
            const q = parseInt(b.getAttribute('data-q') || '1');
            const coins = Number(ctx.S.coins) || 0;
            const min = Number(bjSettings.minBet) || 10;
            if (inp) inp.value = String(Math.max(min, Math.floor(coins / q)));
        });
    });
    All.$id('bj-rm-even')?.addEventListener('click', () => {
        bjRoomAction('INSURANCE_ANSWER', { answer:'even' });
    });
    All.$id('bj-rm-buy-ins')?.addEventListener('click', () => {
        const h = gs?.hands?.[bjMyId];
        const ins = Math.floor((h?.bet[0]||0)/2);
        if ((ctx.S.coins||0)<ins) return bjToast('Không đủ vàng');
        bjRoomAction('INSURANCE_ANSWER',{answer:'ins'});
    });
    All.$id('bj-rm-skip-ins')?.addEventListener('click',()=>bjRoomAction('INSURANCE_ANSWER',{answer:'skip'}));
    All.$id('bj-rm-hit')?.addEventListener('click',()=>bjRoomAction('HIT'));
    All.$id('bj-rm-stand')?.addEventListener('click',()=>bjRoomAction('STAND'));
    All.$id('bj-rm-double')?.addEventListener('click',()=>{
        const h=gs?.hands?.[bjMyId]; const idx=h?.activeHandIdx||0; const bet=h?.bet[idx]||0;
        if((ctx.S.coins||0)<bet) return bjToast('Không đủ vàng Double');
        bjRoomAction('DOUBLE');
    });
    All.$id('bj-rm-split')?.addEventListener('click',()=>{
        const h=gs?.hands?.[bjMyId]; const idx=h?.activeHandIdx||0; const bet=h?.bet[idx]||0;
        if((ctx.S.coins||0)<bet) return bjToast('Không đủ vàng Split');
        bjRoomAction('SPLIT');
    });
    All.$id('bj-rm-surrender')?.addEventListener('click',()=>bjRoomAction('SURRENDER'));
}

function bjRenderChat() {
    const el = All.$id('bj-chat-log');
    if (!el) return;
    el.innerHTML = bjChatLog.slice(-50).map(e => {
        if (e.isSystem) return `<div class="bj-chat-line" style="color:#ffd94d; font-style:italic"><b>Hệ thống:</b> ${e.msg.replace(/</g,'&lt;')}</div>`;
        if (e.isReq) {
            const rd = e.reqData;
            const isDone = rd.fulfilled >= rd.amount;
            const btn = `<button class="buy ${isDone ? 'plain' : ''}" style="font-size:10px;padding:2px 5px;margin-left:5px;" ${isDone?'disabled':''} onclick="bjGiveMoney('${rd.reqId}')">${isDone ? 'Xong' : 'Cho'}</button>`;
            return `<div class="bj-chat-line"><b>${e.name}</b> xin <b>${rd.amount.toLocaleString()}G</b> (Đã nhận: ${rd.fulfilled.toLocaleString()})${btn}</div>`;
        }
        return `<div class="bj-chat-line"><b>${e.name}:</b> ${e.msg.replace(/</g,'&lt;')}</div>`;
    }).join('');
    setTimeout(() => { if (el) el.scrollTop = el.scrollHeight + 100; }, 10);
}

function bjBindChatBase() {
    const send = () => {
        const inp = All.$id('bj-chat-inp');
        const msg = (inp?.value||'').trim();
        if (!msg) return;
        if (inp) inp.value = '';
        bjChatLog.push({ name: bjMyName(), msg, ts: Date.now() });
        if (bjChatLog.length>50) bjChatLog.shift();
        bjRenderChat();
        bjBroadcast({ type: 'CHAT', msg });
    };
    All.$id('bj-chat-send')?.addEventListener('click', send);
    All.$id('bj-chat-req-btn')?.addEventListener('click', () => {
        const amtStr = prompt('Nhập số tiền muốn xin (G):');
        const amt = parseInt(amtStr);
        if (!isNaN(amt) && amt > 0) {
            const reqId = bjMyId + '-' + Date.now();
            const msg = { type: 'CHAT_REQ', reqData: { reqId, pid: bjMyId, amount: amt, fulfilled: 0 } };
            bjHandleMsg(bjMyId, msg);
            bjBroadcast(msg);
        }
    });
    All.$id('bj-chat-close')?.addEventListener('click', () => {
        All.$id('bj-chat-wrap')?.classList.remove('open');
    });
    const inp = All.$id('bj-chat-inp');
    if (inp) {
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
        inp.addEventListener('focus', () => {
            if (window.innerWidth <= 640) {
                const wrap = All.$id('bj-chat-wrap');
                if (wrap) wrap.classList.add('mobile-chat-focus');
            }
        });
        inp.addEventListener('blur', () => {
            if (window.innerWidth <= 640) {
                const wrap = All.$id('bj-chat-wrap');
                if (wrap) wrap.classList.remove('mobile-chat-focus');
            }
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODE PICKER
// ─────────────────────────────────────────────────────────────────────────────
export function openBlackjackPicker() {
    const win = All.$id('bj-win');
    const body = All.$id('bj-body');
    if (!win || !body) return;
    
    body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px;padding:30px 10px;">
            <div style="text-align:center;font-size:16px;color:#a3763d;font-weight:bold;margin-bottom:10px;">Chọn chế độ chơi</div>
            <div class="buy" id="bj-solo-pick" style="text-align:center;padding:20px;font-size:16px;">
                🃏 Chơi Đơn<br><small style="font-weight:normal;font-size:12px;opacity:0.8;">Solo vs Nhà cái máy tính</small>
            </div>
            <div class="buy plain" id="bj-room-pick" style="text-align:center;padding:20px;font-size:16px;">
                🎰 Chơi Phòng<br><small style="font-weight:normal;font-size:12px;opacity:0.8;">Đa người (tối đa 4), cùng đấu với nhà cái</small>
            </div>
        </div>`;
    win.style.display = 'flex';
    All.placeBjWin();
    
    All.$id('bj-solo-pick').addEventListener('click', openBlackjackSolo);
    All.$id('bj-room-pick').addEventListener('click', openBlackjackRoom);
}

window['bjGiveMoney'] = function(reqId) {
    const log = bjChatLog.find(e => e.reqData && e.reqData.reqId === reqId);
    if (!log) return;
    const rd = log.reqData;
    if (rd.pid === bjMyId) return bjToast('Bạn không thể tự cho tiền mình!');
    if (!bjPlayers[rd.pid]) return bjToast('Người này đã rời phòng!');
    const remaining = rd.amount - rd.fulfilled;
    if (remaining <= 0) return bjToast('Đã đủ tiền rồi!');
    
    const amtStr = prompt(`Cho tiền ${log.name} (Tối đa: ${remaining.toLocaleString()}G):`, String(remaining));
    const amt = parseInt(amtStr);
    if (isNaN(amt) || amt <= 0) return;
    
    const coins = ctx.S.coins || 0;
    if (coins < amt) return bjToast('Bạn không đủ tiền!');
    
    const give = Math.min(amt, remaining);
    
    const msg = { type: 'GIVE_MONEY_REQ', reqId, from: bjMyName(), amount: give };
    if (bjIsHost) bjHandleMsg(bjMyId, msg);
    else bjBroadcast(msg);
}
