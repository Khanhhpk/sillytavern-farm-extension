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
//  CARD ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const SUITS = ['\u2660', '\u2665', '\u2666', '\u2663'];
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
    const isRed = card.suit === '\u2665' || card.suit === '\u2666';
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
    if (s.shoeIdx >= s.shoe.length) {
        s.shoe = buildShoe(s.settings.numDecks, Date.now() & 0xffffffff);
        s.shoeIdx = 0;
    }
    return { ...s.shoe[s.shoeIdx++], hidden: !!hidden, isNew: true };
}

function buildSoloUI() {
    return `<div id="bj-solo-wrap">
        <div class="bj-table">
            <div class="bj-dealer-area">
                <div class="bj-area-label">Nh\u00e0 c\u00e1i</div>
                <div class="bj-hand-row" id="bj-dealer-hand"></div>
                <div class="bj-score" id="bj-dealer-score"></div>
            </div>
            <div class="bj-player-area">
                <div class="bj-area-label">B\u1ea1n \u2014 <span id="bj-coins-display"></span></div>
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
        if (dealerScoreEl) dealerScoreEl.textContent = vis.length ? `\u0110i\u1ec3m: ${handTotal(vis)}` : '';
    }
    const handsEl = All.$id('bj-player-hands');
    if (handsEl) {
        handsEl.innerHTML = s.playerHands.map((hand, i) => {
            const isActive = i === s.activeHandIdx && s.phase === 'player';
            const total = handTotal(hand);
            const bet = s.bets[i] || 0;
            return `<div class="bj-player-hand${isActive ? ' active-hand' : ''}">
                <div class="bj-hand-row">${hand.map(c => cardHTML(c)).join('')}</div>
                <div class="bj-score">\u0110i\u1ec3m: ${total}${total > 21 ? ' \uD83D\uDC80 Bust!' : ''} \u2014 C\u01b0\u1ee3c: ${bet.toLocaleString()}G</div>
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
                <span class="buy plain bj-quick" data-q="4">\u00bc</span>
                <span class="buy plain bj-quick" data-q="2">\u00bd</span>
                <span class="buy plain bj-quick" data-q="1">Max</span>
            </div>
            <div class="bj-btn-row" style="margin-top:8px;">
                <div class="buy" id="bj-deal">\uD83C\uDCCF Ph\u00e1t B\u00e0i</div>
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
                <div class="bj-msg-sm">B\u1ea1n c\u00f3 Blackjack! Dealer upcard l\u00e0 Ace.</div>
                <div class="bj-btn-row">
                    <div class="buy" id="bj-even-money">L\u1ea5y ngay 1:1 (Even Money)</div>
                    <div class="buy plain" id="bj-no-insurance">B\u1ecf qua, ch\u1edd k\u1ebft qu\u1ea3</div>
                </div>`;
            All.$id('bj-even-money').addEventListener('click', soloEvenMoney);
            All.$id('bj-no-insurance').addEventListener('click', () => soloAfterInsurance(false));
        } else {
            const maxIns = Math.floor(bet / 2);
            actEl.innerHTML = `
                <div class="bj-msg-sm">Dealer upcard l\u00e0 Ace \u2014 Mua b\u1ea3o hi\u1ec3m? (t\u1ed1i \u0111a ${maxIns}G)</div>
                <div class="bj-btn-row">
                    <div class="buy" id="bj-buy-ins">Mua ${maxIns}G</div>
                    <div class="buy plain" id="bj-skip-ins">B\u1ecf qua</div>
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
            actEl.innerHTML = `<div class="bj-msg-sm">\uD83D\uDC80 Bust! T\u1ef1 \u0111\u1ed9ng chuy\u1ec3n tay...</div>`;
            return;
        }
        if (isSplitAce) {
            setTimeout(() => soloNextHand(), 400);
            actEl.innerHTML = `<div class="bj-msg-sm">Split Ace \u2014 Ch\u1ec9 nh\u1eadn 1 l\u00e1, t\u1ef1 Stand.</div>`;
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
        actEl.innerHTML = `<div class="bj-btn-row"><div class="buy" id="bj-next-round">V\u00e1n M\u1edbi</div></div>`;
        All.$id('bj-next-round').addEventListener('click', soloNewRound);
    }
}

function soloStartRound() {
    const s = soloState;
    const coins = ctx.S.coins || 0;
    const inp = All.$id('bj-bet-inp');
    const want = Math.max(0, parseInt(inp ? inp.value : '0') || 0);
    if (want < s.settings.minBet) return bjToast(`C\u01b0\u1ee3c t\u1ed1i thi\u1ec3u ${s.settings.minBet}G`);
    if (s.settings.maxBet > 0 && want > s.settings.maxBet) return bjToast(`C\u01b0\u1ee3c t\u1ed1i \u0111a ${s.settings.maxBet}G`);
    if (want > coins) return bjToast(`Kh\u00f4ng \u0111\u1ee7 v\u00e0ng (${coins.toLocaleString()}G)`);

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
    showMsg(`\u2660 Even Money! Nh\u1eadn l\u1ea1i ${payout.toLocaleString()}G`);
    soloRender();
}

function soloBuyInsurance(amount) {
    const s = soloState;
    if ((ctx.S.coins || 0) < amount) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng mua b\u1ea3o hi\u1ec3m');
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
            showMsg(`Dealer Blackjack! B\u1ea3o hi\u1ec3m tr\u1ea3 ${insPayout.toLocaleString()}G`);
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
    const hand = s.playerHands[s.activeHandIdx];
    hand.push(soloDrawCard());
    soloRender();
    if (handTotal(hand) > 21) setTimeout(() => soloNextHand(), 700);
}

function soloStand() { soloNextHand(); }

function soloDouble() {
    const s = soloState;
    const idx = s.activeHandIdx;
    const bet = s.bets[idx];
    if ((ctx.S.coins || 0) < bet) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng Double');
    ctx.S.coins = (ctx.S.coins || 0) - bet;
    s.bets[idx] *= 2;
    save();
    s.playerHands[idx].push(soloDrawCard());
    soloRender();
    setTimeout(() => soloNextHand(), 500);
}

function soloSplit() {
    const s = soloState;
    const idx = s.activeHandIdx;
    const bet = s.bets[idx];
    if ((ctx.S.coins || 0) < bet) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng Split');
    ctx.S.coins = (ctx.S.coins || 0) - bet;
    save();
    const hand = s.playerHands[idx];
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
    s.playerHands[s.activeHandIdx].surrendered = true;
    const refund = Math.floor(s.bets[0] / 2);
    ctx.S.coins = (ctx.S.coins || 0) + refund;
    save(); renderStatus();
    soloNextHand();
}

function soloNextHand() {
    const s = soloState;
    const next = s.activeHandIdx + 1;
    if (next < s.playerHands.length) { s.activeHandIdx = next; soloRender(); }
    else soloRunDealer();
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
        if (total < 17 || (soft && total === 16)) {
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
        if (pTotal > 21) { results.push(`${lbl}\uD83D\uDC80 Bust (m\u1ea5t ${bet.toLocaleString()}G)`); continue; }
        if (pBJ && dBJ) { ctx.S.coins = (ctx.S.coins || 0) + bet; results.push(`${lbl}\uD83E\uDD1D Ho\u00e0 BJ`); continue; }
        if (pBJ) { const p = bet + Math.floor(bet * 1.5); ctx.S.coins = (ctx.S.coins || 0) + p; results.push(`${lbl}\u2660 BLACKJACK +${Math.floor(bet*1.5).toLocaleString()}G`); continue; }
        if (dBJ) { results.push(`${lbl}\uD83D\uDC94 Dealer BJ`); continue; }
        if (dBust || pTotal > dTotal) { ctx.S.coins = (ctx.S.coins || 0) + bet * 2; results.push(`${lbl}\u2705 Th\u1eafng +${bet.toLocaleString()}G`); continue; }
        if (pTotal === dTotal) { ctx.S.coins = (ctx.S.coins || 0) + bet; results.push(`${lbl}\uD83E\uDD1D Ho\u00e0`); continue; }
        results.push(`${lbl}\u274C Thua`);
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

function bjMyName() { return ctx.S.username || 'Kh\u00e1ch'; }

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
            <div class="bj-msg-sm">B\u1ea1n c\u1ea7n c\u00f3 t\u00ean ng\u01b0\u1eddi ch\u01a1i tr\u01b0\u1edbc</div>
            <input class="inp" id="bj-inp-name" placeholder="Nh\u1eadp t\u00ean c\u1ee7a b\u1ea1n...">
            <div class="buy" id="bj-save-name" style="text-align:center">L\u01b0u t\u00ean</div>
        </div>`;
        All.$id('bj-save-name').onclick = () => {
            const v = (All.$id('bj-inp-name').value || '').trim();
            if (!v) return bjToast('T\u00ean kh\u00f4ng \u0111\u01b0\u1ee3c tr\u1ed1ng!');
            ctx.S.username = v;
            import('./state.js').then(m => m.save());
            bjRenderMenu();
        };
        return;
    }
    body.innerHTML = `<div style="padding:20px;display:flex;flex-direction:column;gap:14px;text-align:center;">
        <div style="font-weight:bold;color:#ffd94d;font-size:14px;">\uD83C\uDFB0 Ph\u00f2ng Blackjack \u2014 ${bjMyName()}</div>
        <div class="buy" id="bj-host-btn" style="text-align:center">\uD83C\uDFB0 T\u1ea1o Ph\u00f2ng (Host)</div>
        <div style="display:flex;gap:8px;">
            <input class="inp" id="bj-join-code" placeholder="Nh\u1eadp m\u00e3 ph\u00f2ng..." style="flex:1">
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
    bjUpdateStatus('\u0110ang t\u1ea1o ph\u00f2ng...', '#ffd94d');
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
    bjPeer.on('error', err => bjUpdateStatus('L\u1ed7i: ' + err.type, '#e05'));
}

async function bjJoinRoom() {
    const code = (All.$id('bj-join-code')?.value || '').trim();
    if (!code) return bjUpdateStatus('Nh\u1eadp m\u00e3 ph\u00f2ng!', '#e05');
    bjUpdateStatus('\u0110ang k\u1ebft n\u1ed1i...', '#ffd94d');
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
        conn.on('error', () => bjUpdateStatus('L\u1ed7i k\u1ebft n\u1ed1i!', '#e05'));
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
    bjPeer.on('error', err => bjUpdateStatus('L\u1ed7i: ' + err.type, '#e05'));
}

function bjSetupConn(conn) {
    conn.on('data', data => bjHandleMsg(conn.peer, data));
    conn.on('close', () => bjHandleDisconnect(conn.peer));
    conn.on('error', () => bjHandleDisconnect(conn.peer));
}

function bjHandleMsg(fromPid, data) {
    switch (data.type) {
        case 'HELLO': {
            const status = (bjGameState && bjRoomPhase !== 'summary') ? 'spectator' : 'idle';
            bjPlayers[fromPid] = { name: data.name || 'Kh\u00e1ch', status };
            if (bjIsHost) {
                bjBroadcast({ type: 'PLAYER_JOIN', pid: fromPid, name: data.name, status }, fromPid);
                bjConns[fromPid].send({ type: 'WELCOME', players: bjPlayers, settings: bjSettings, gameState: bjGameState, roomPhase: bjRoomPhase, summaryData: bjSummaryData, chatLog: bjChatLog });
            }
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
            bjPlayers[data.pid] = { name: data.name, status: data.status };
            bjRenderRoom(); break;
        case 'PLAYER_LEFT':
            delete bjPlayers[data.pid];
            if (bjGameState) bjGameState.turnOrder = bjGameState.turnOrder.filter(p => p !== data.pid);
            bjRenderRoom(); break;
        case 'READY':
            if (bjPlayers[fromPid]) bjPlayers[fromPid].status = data.ready ? 'ready' : 'idle';
            if (bjIsHost) bjBroadcast({ type: 'READY', pid: fromPid, ready: data.ready }, fromPid);
            bjRenderRoom(); break;
        case 'SETTINGS_UPDATE':
            bjSettings = data.settings;
            bjSystemChat(`Host c\u1eadp nh\u1eadt: min ${bjSettings.minBet}G, ch\u1edd ${bjSettings.delay}s`);
            bjRenderRoom(); break;
        case 'KICKED':
            bjToast('B\u1ea1n \u0111\u00e3 b\u1ecb \u0111u\u1ed5i kh\u1ecfi ph\u00f2ng.');
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
        case 'BET_PLACED':
            if (bjGameState) {
                bjGameState.betsIn[data.pid] = data.bet;
                bjGameState.hands[data.pid] = {
                    cards: [[]], bet: [data.bet], stood: [false], doubled: [false],
                    activeHandIdx: 0, splitAceIdxs: [], insuranceBet: 0, surrendered: false,
                };
            }
            bjRenderRoom();
            if (bjIsHost) bjCheckAllBetsIn();
            break;
        case 'DEAL_CARDS':
            if (bjGameState) {
                bjGameState.hands = data.hands; bjGameState.dealerHand = data.dealerHand;
                bjGameState.phase = data.phase; bjGameState.currentTurn = data.currentTurn;
                if (data.shoeIdx !== undefined) bjGameState.shoeIdx = data.shoeIdx;
            }
            bjMyStatus = bjGameState?.hands[bjMyId] ? 'playing' : 'spectator';
            bjRenderRoom(); break;
        case 'INSURANCE_ANSWER':
            if (bjIsHost) {
                bjGameState.insuranceAnswers = bjGameState.insuranceAnswers || {};
                bjGameState.insuranceAnswers[data.pid] = data.answer;
                bjCheckInsuranceAnswers();
            }
            break;
        case 'ACTION':
            bjHandleRoomAction(fromPid, data); break;
        case 'SUMMARY_START':
            if (data.payouts) {
                const payout = data.payouts[bjMyId] || 0;
                if (payout > 0) {
                    ctx.S.coins = (ctx.S.coins || 0) + payout;
                    save(); renderStatus();
                    bjToast(`Nh\u1eadn ${payout.toLocaleString()}G t\u1eeb b\u00e0n!`);
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
            if (tEl) tEl.innerText = `V\u00f2ng m\u1edbi sau: ${data.left}s`;
            break;
        case 'SKIP_TIMER':
            bjSummaryTimeLeft = 0; break;
        case 'BACK_TO_LOBBY':
            bjGameState = null; bjRoomPhase = 'lobby'; bjSummaryData = null;
            bjRenderRoom(); break;
        case 'CHAT':
            bjChatLog.push({ name: bjPlayers[fromPid]?.name || '?', msg: data.msg, ts: Date.now() });
            if (bjChatLog.length > 50) bjChatLog.shift();
            if (!All.$id('bj-chat-wrap')?.classList.contains('open')) { bjUnreadChat++; bjRenderRoom(); }
            bjRenderChat();
            if (bjIsHost && fromPid !== bjMyId) bjBroadcast(data, fromPid);
            break;
        case 'CHAT_REQ':
            bjChatLog.push({ name: bjPlayers[fromPid]?.name || fromPid, isReq: true, reqData: data.reqData, ts: Date.now() });
            if (bjChatLog.length > 50) bjChatLog.shift();
            if (!All.$id('bj-chat-wrap')?.classList.contains('open')) { bjUnreadChat++; bjRenderRoom(); }
            bjRenderChat();
            if (bjIsHost && fromPid !== bjMyId) bjBroadcast(data, fromPid);
            break;
        case 'GIVE_MONEY':
            const log = bjChatLog.find(e => e.reqData && e.reqData.reqId === data.reqId);
            if (log) {
                log.reqData.fulfilled += data.amount;
                if (log.reqData.pid === bjMyId) {
                    ctx.S.coins = (ctx.S.coins || 0) + data.amount;
                    save(); renderStatus();
                    bjSystemChat(`${data.from} \u0111\u00e3 cho b\u1ea1n ${data.amount.toLocaleString()}G!`);
                }
                bjRenderChat();
            }
            if (bjIsHost && fromPid !== bjMyId) bjBroadcast(data, fromPid);
            break;
        case 'GOLD_SEND':
            if (data.targetPid === bjMyId) {
                ctx.S.coins = (ctx.S.coins || 0) + data.amount;
                save(); renderStatus();
                bjSystemChat(`${bjPlayers[fromPid]?.name || '?'} g\u1eedi b\u1ea1n ${data.amount.toLocaleString()}G!`);
            }
            break;
        case 'ROOM_FULL':
            bjToast('Ph\u00f2ng \u0111\u00e3 \u0111\u1ea7y!'); closeBlackjack(); break;
    }
}

function bjHandleDisconnect(pid) {
    if (!bjConns[pid] && !bjPlayers[pid] && pid !== bjRoomId) return; // Already handled
    
    delete bjConns[pid];
    if (bjPlayers[pid]) {
        const name = bjPlayers[pid].name;
        delete bjPlayers[pid];
        bjSystemChat(`${name} \u0111\u00e3 r\u1eddi ph\u00f2ng`);
        if (bjIsHost) {
            if (bjGameState) {
                bjGameState.turnOrder = bjGameState.turnOrder.filter(p => p !== pid);
                if (bjGameState.currentTurn === pid) bjAdvanceTurn();
                else bjCheckAllBetsIn();
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
                    bjSystemChat(`Host c\u0169 tho\u00e1t. B\u1ea1n \u0111\u00e3 tr\u1edf th\u00e0nh Host m\u1edbi!`);
                    if (bjGameState) {
                        bjGameState.turnOrder = bjGameState.turnOrder.filter(p => p !== pid);
                        if (bjGameState.currentTurn === pid) bjAdvanceTurn();
                        else if (bjGameState.phase === 'betting') bjCheckAllBetsIn();
                    }
                    if (bjRoomPhase === 'summary' && !bjSummaryTimer) {
                        bjSummaryTimer = setInterval(() => {
                            bjSummaryTimeLeft--;
                            if (bjSummaryTimeLeft <= 0) bjHostEndSummary();
                            else {
                                bjBroadcast({ type: 'TIMER_TICK', left: bjSummaryTimeLeft });
                                const tEl = All.$id('bj-summary-timer');
                                if (tEl) tEl.innerText = `V\u00f2ng m\u1edbi sau: ${bjSummaryTimeLeft}s`;
                            }
                        }, 1000);
                    }
                    bjRenderRoom();
                } else {
                    bjRoomId = newHostId;
                    bjSystemChat(`Host c\u0169 tho\u00e1t. \u0110ang \u0111\u1ed5i Host t\u1edbi ${bjPlayers[newHostId]?.name || 'ng\u01b0\u1eddi ch\u01a1i kh\u00e1c'}...`);
                    const conn = bjPeer.connect(newHostId, { reliable: true });
                    bjConns[newHostId] = conn;
                    conn.on('open', () => {
                        bjSetupConn(conn);
                        conn.send({ type: 'HELLO', name: bjMyName(), id: bjMyId });
                    });
                    conn.on('error', () => { bjToast('Kh\u00f4ng th\u1ec3 k\u1ebft n\u1ed1i \u0111\u1ebfn Host m\u1edbi!'); closeBlackjack(); });
                }
            } else {
                closeBlackjack(); bjToast('Ph\u00f2ng \u0111\u00e3 \u0111\u00f3ng.');
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
    if (active.length === 0) return bjToast('C\u1ea7n \u00edt nh\u1ea5t 1 ng\u01b0\u1eddi ch\u01a1i');
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) & 0xffffffff;
    const msg = { type: 'ROUND_START', seed, turnOrder: active, betDeadline: Date.now() + 30000 };
    bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
}

function bjCheckAllBetsIn() {
    if (!bjGameState || bjGameState.phase !== 'betting') return;
    if (bjGameState.turnOrder.every(p => bjGameState.betsIn[p] !== undefined)) bjHostDealCards();
}

function bjHostDealCards() {
    const gs = bjGameState;
    const shoe = gs.shoe;
    let idx = gs.shoeIdx;
    const draw = (hidden) => ({ ...shoe[idx++], hidden: !!hidden, isNew: true });

    for (const pid of gs.turnOrder) {
        if (!gs.hands[pid]) gs.hands[pid] = { cards: [[]], bet: [0], stood: [false], doubled: [false], activeHandIdx: 0, splitAceIdxs: [], insuranceBet: 0, surrendered: false };
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
    for (const pid of gs.turnOrder) {
        const ans = gs.insuranceAnswers[pid];
        const h = gs.hands[pid];
        if (ans === 'ins') h.insuranceBet = Math.floor(h.bet[0] / 2);
    }
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
        const done = h.cards.every((c, i) => h.stood[i] || handTotal(c) > 21);
        if (!done) { next = pid; break; }
    }
    if (next) {
        gs.currentTurn = next;
        const msg = { type: 'ACTION', actionType: 'TURN_CHANGE', pid: next };
        bjBroadcast(msg); bjHandleMsg(bjMyId, msg);
    } else {
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
    if (data.hand) {
        gs.hands[data.pid] = data.hand;
        if (data.shoeIdx !== undefined) gs.shoeIdx = data.shoeIdx;
        bjRenderRoom();
        if (!bjIsHost) return;
    }
    if (!bjIsHost) return;
    if (data.actionType === 'INSURANCE_ANSWER') {
        gs.insuranceAnswers = gs.insuranceAnswers || {};
        gs.insuranceAnswers[fromPid] = data.answer;
        bjCheckInsuranceAnswers(); return;
    }
    const h = gs.hands[fromPid];
    if (!h || gs.currentTurn !== fromPid) return;
    const idx = h.activeHandIdx || 0;

    if (data.actionType === 'HIT') {
        h.cards[idx].push({ ...gs.shoe[gs.shoeIdx++], isNew: true });
        if (handTotal(h.cards[idx]) > 21) h.stood[idx] = true;
    } else if (data.actionType === 'STAND') {
        h.stood[idx] = true;
        if (idx + 1 < h.cards.length) h.activeHandIdx = idx + 1;
    } else if (data.actionType === 'DOUBLE') {
        h.cards[idx].push({ ...gs.shoe[gs.shoeIdx++], isNew: true });
        h.bet[idx] *= 2; h.stood[idx] = true; h.doubled[idx] = true;
    } else if (data.actionType === 'SPLIT') {
        const sc = h.cards[idx].splice(1, 1)[0];
        const nh = [sc, { ...gs.shoe[gs.shoeIdx++], isNew: true }];
        h.cards[idx].push({ ...gs.shoe[gs.shoeIdx++], isNew: true });
        h.cards.splice(idx + 1, 0, nh);
        h.bet.splice(idx + 1, 0, h.bet[idx]);
        h.stood.splice(idx + 1, 0, false);
        h.doubled.splice(idx + 1, 0, false);
        if (sc.rank === 'A') {
            h.splitAceIdxs = h.splitAceIdxs || [];
            h.splitAceIdxs.push(idx, idx + 1);
            h.stood[idx] = true; h.stood[idx + 1] = true;
        }
    } else if (data.actionType === 'SURRENDER') {
        h.surrendered = true; h.stood[idx] = true;
    }

    gs.hands[fromPid] = h;
    bjBroadcast({ type: 'ACTION', actionType: data.actionType, pid: fromPid, hand: h, shoeIdx: gs.shoeIdx });
    const done = h.cards.every((c, i) => h.stood[i] || handTotal(c) > 21);
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
        if (tot < 17 || (isSoft(gs.dealerHand) && tot === 16)) {
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
        payouts[pid] = p;
    }

    if (payouts[bjMyId]) { ctx.S.coins = (ctx.S.coins || 0) + payouts[bjMyId]; save(); renderStatus(); }
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
                if (tEl) tEl.innerText = `V\u00f2ng m\u1edbi sau: ${bjSummaryTimeLeft}s`;
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
    if (coins < amount) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng!');
    if (amount < bjSettings.minBet) return bjToast(`C\u01b0\u1ee3c t\u1ed1i thi\u1ec3u ${bjSettings.minBet}G`);
    if (bjSettings.maxBet > 0 && amount > bjSettings.maxBet) return bjToast(`C\u01b0\u1ee3c t\u1ed1i \u0111a ${bjSettings.maxBet}G`);
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
    const max = parseInt(All.$id('bj-cfg-max')?.value) || 0;
    const decks = Math.min(8, Math.max(1, parseInt(All.$id('bj-cfg-decks')?.value) || 6));
    const delay = Math.min(30, Math.max(5, parseInt(All.$id('bj-cfg-delay')?.value) || 10));
    bjSettings = { minBet: Math.max(1, min), maxBet: Math.max(0, max), numDecks: decks, delay };
    bjBroadcast({ type: 'SETTINGS_UPDATE', settings: bjSettings });
    bjToast(`\u0110\u00e3 c\u1eadp nh\u1eadt: min ${bjSettings.minBet}G, ch\u1edd ${delay}s`);
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROOM — Render
// ─────────────────────────────────────────────────────────────────────────────
function bjRenderRoom() {
    const body = All.$id('bj-body');
    if (!body) return;
    const gs = bjGameState;
    const allPids = Object.keys(bjPlayers);

    let html = `<div class="bj-room-layout">
        <div class="bj-room-main">
            <div class="bj-room-topbar">
                <div class="bj-room-code-badge" id="bj-room-code-badge" title="Copy m\u00e3 ph\u00f2ng">\uD83C\uDCCB ${bjRoomId}</div>
                <div style="font-size:11px;color:#ddd;flex:1;text-align:center;">${bjMyName()} \u2014 ${(ctx.S.coins||0).toLocaleString()}G${bjMyStatus==='spectator'?' \uD83D\uDC41':''}</div>
                <div class="buy plain" id="bj-out-room-ingame" style="font-size:11px;">\u2190 Tho\u00e1t</div>
                <div class="bj-chat-toggle" id="bj-chat-toggle">\uD83D\uDCAC Chat ${bjUnreadChat > 0 ? `<span style="background:#e74c3c;color:white;border-radius:10px;padding:1px 5px;margin-left:5px;font-size:10px;">${bjUnreadChat}</span>` : ''}</div>
            </div>
            <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding-bottom: 10px;">`;

    if (bjRoomPhase === 'lobby') {
        const isAllReady = allPids.filter(p => p !== bjMyId && bjPlayers[p].status !== 'spectator').every(p => bjPlayers[p].status === 'ready');
        html += `<div class="bj-lobby-wrap">
            <div class="bj-lobby-box">
                <div class="bj-lobby-title">S\u1ea3nh Ch\u1edd</div>
                <div class="bj-player-list">
                    ${allPids.map(p => {
                        const isHost = (p === Object.keys(bjPlayers)[0]); // Tạm tính người đầu tiên là host nếu chưa migration
                        const ready = bjPlayers[p].status === 'ready';
                        const meStr = p === bjMyId ? ' (B\u1ea1n)' : '';
                        const kickBtn = (bjIsHost && p !== bjMyId) ? `<button class="bj-kick-btn" data-pid="${p}">Kick</button>` : '';
                        return `<div class="bj-player-row ${ready ? 'ready' : ''} ${isHost ? 'host' : ''}">
                            <span>${bjPlayers[p].name}${meStr} ${isHost?'\uD83D\uDC51':(ready?'\u2714':'\u23F3')}</span>
                            ${kickBtn}
                        </div>`;
                    }).join('')}
                </div>
                ${bjIsHost ? `
                <div class="bj-settings-host">
                    <div style="font-size:12px;font-weight:bold;color:#ffd94d;margin-bottom:6px;">\u2699\uFE0F C\u00e0i \u0111\u1eb7t b\u00e0n</div>
                    <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
                        <label style="font-size:11px;color:#ddd;">Min <input class="inp" id="bj-cfg-min" type="number" value="${bjSettings.minBet}" min="1" style="width:50px;padding:4px;font-size:11px"></label>
                        <label style="font-size:11px;color:#ddd;">Max <input class="inp" id="bj-cfg-max" type="number" value="${bjSettings.maxBet}" min="0" style="width:50px;padding:4px;font-size:11px"></label>
                        <label style="font-size:11px;color:#ddd;">B\u1ed9 <input class="inp" id="bj-cfg-decks" type="number" value="${bjSettings.numDecks}" min="1" max="8" style="width:40px;padding:4px;font-size:11px"></label>
                        <label style="font-size:11px;color:#ddd;">Ch\u1edd(s) <input class="inp" id="bj-cfg-delay" type="number" value="${bjSettings.delay}" min="5" max="30" style="width:40px;padding:4px;font-size:11px"></label>
                        <div class="buy plain" id="bj-cfg-apply" style="font-size:11px;padding:4px 8px">L\u01b0u</div>
                    </div>
                </div>
                <div class="bj-btn-row" style="margin-top:15px;">
                    <div class="buy ${!isAllReady && allPids.length > 1 ? 'plain' : ''}" id="bj-start-room-btn" ${!isAllReady && allPids.length > 1 ? 'style="opacity:0.5;pointer-events:none"' : ''}>\u25b6 B\u1eaft \u0111\u1ea7u</div>
                </div>
                ` : `
                <div class="bj-btn-row" style="margin-top:15px;">
                    <div class="buy bj-btn-ready ${bjPlayers[bjMyId].status === 'ready' ? '' : 'not-ready'}" id="bj-ready-btn">${bjPlayers[bjMyId].status === 'ready' ? 'H\u1ee7y S\u1eb5n S\u00e0ng' : 'S\u1eb5n S\u00e0ng'}</div>
                </div>
                <div class="bj-msg-sm" style="text-align:center;padding:10px;opacity:0.7">Ch\u1edd Host b\u1eaft \u0111\u1ea7u...</div>
                `}
            </div>
        </div>`;
    } else {
        // ingame or summary
        html += `<div class="bj-table">
            <div class="bj-dealer-area">
                <div class="bj-area-label">Nh\u00e0 c\u00e1i (m\u00e1y)</div>
                <div class="bj-hand-row">${(gs?.dealerHand||[]).map(c => cardHTML(c, true)).join('')}</div>
                <div class="bj-score">${gs?.dealerHand?.length ? `\u0110i\u1ec3m: ${handTotal(gs.dealerHand.filter(c=>!c.hidden))}` : ''}</div>
            </div>
            <div class="bj-players-grid">`;
        for (const pid of (gs?.turnOrder || [])) {
            const ph = bjPlayers[pid] || { name: pid };
            const h = gs.hands?.[pid];
            const isMe = pid === bjMyId, isTurn = gs.currentTurn === pid;
            html += `<div class="bj-player-slot${isMe?' me':''}${isTurn?' my-turn':''}">
                <div class="bj-player-name">${ph.name}${isTurn?' \u27a4':''}${isMe?' (B\u1ea1n)':''}</div>`;
            if (h) {
                h.cards.forEach((cards, i) => {
                    const tot = handTotal(cards);
                    html += `<div class="bj-hand-row">${cards.map(c => cardHTML(c,true)).join('')}</div>
                        <div class="bj-score">${tot}${tot>21?' Bust!':''} \u2014 ${(h.bet[i]||0).toLocaleString()}G</div>`;
                });
            } else html += `<div class="bj-msg-sm" style="opacity:0.5">Ch\u1edd \u0111\u1eb7t c\u01b0\u1ee3c...</div>`;
            html += `</div>`;
        }
        for (const pid of allPids) {
            if (!gs?.turnOrder?.includes(pid)) {
                html += `<div class="bj-player-slot spectator"><div class="bj-player-name">\uD83D\uDC41 ${bjPlayers[pid].name} (xem)</div></div>`;
            }
        }
        html += `</div></div>
        <div id="bj-my-actions" class="bj-actions">${bjBuildMyActions()}</div>
        <div id="bj-room-msg" class="bj-message"></div>`;

        if (bjRoomPhase === 'summary' && bjSummaryData) {
            html += `<div class="bj-summary-overlay">
                <div class="bj-summary-box">
                    <div class="bj-summary-title">T\u1ed4NG K\u1ebeT V\u00d2NG</div>
                    <table class="bj-summary-table">
                        <tr><th>Ng\u01b0\u1eddi ch\u01a1i</th><th>\u0110i\u1ec3m</th><th>C\u01b0\u1ee3c</th><th>K\u1ebft qu\u1ea3</th><th>Nh\u1eadn</th></tr>
                        <tr><td><b>Nh\u00e0 c\u00e1i</b></td><td>${handTotal(bjSummaryData.dealerHand)}</td><td>-</td><td>-</td><td>-</td></tr>
                        ${(bjSummaryData.gs?.turnOrder || []).map(pid => {
                            const name = bjPlayers[pid]?.name || pid;
                            const h = bjSummaryData.gs.hands[pid];
                            if (!h) return '';
                            let pts = h.cards.map(c => handTotal(c)).join(' / ');
                            let bet = h.bet.reduce((a,b)=>a+b, 0) + (h.insuranceBet||0);
                            let pay = bjSummaryData.payouts[pid] || 0;
                            let resCls = pay > bet ? 'bj-val-win' : (pay === bet ? 'bj-val-push' : 'bj-val-lose');
                            return `<tr class="${pid===bjMyId?'me':''}"><td>${name}</td><td>${pts}</td><td>${bet.toLocaleString()}</td><td class="${resCls}">${pay>bet?'Th\u1eafng':(pay===bet?'H\u00f2a':'Thua')}</td><td class="${resCls}">+${pay.toLocaleString()}</td></tr>`;
                        }).join('')}
                    </table>
                    <div class="bj-countdown" id="bj-summary-timer">V\u00f2ng m\u1edbi sau: ${bjSummaryTimeLeft}s</div>
                    ${bjIsHost ? `<div class="bj-btn-row" style="margin-top:15px;"><div class="buy plain" id="bj-skip-btn">B\u1ecf qua (Skip)</div></div>` : ''}
                </div>
            </div>`;
        }
    }

    html += `</div></div>
    <div class="bj-chat-wrap" id="bj-chat-wrap">
        <div class="bj-chat-header" id="bj-chat-close">
            <span>\uD83D\uDCAC Chat</span>
            <span class="bj-chat-close">\u274C</span>
        </div>
        <div class="bj-chat-log" id="bj-chat-log">${bjChatLog.slice(-20).map(e =>
            `<div class="bj-chat-line"><b>${e.name}:</b> ${e.msg.replace(/</g,'&lt;')}</div>`
        ).join('')}</div>
        <div class="bj-chat-inp-row">
            <div class="buy plain" id="bj-chat-req-btn" style="padding:4px 8px;" title="Xin ti\u1ec1n">\uD83D\uDCB0</div>
            <input class="inp bj-chat-inp" id="bj-chat-inp" placeholder="Chat..." style="flex:1" enterkeyhint="send">
            <div class="buy plain" id="bj-chat-send" style="white-space:nowrap">G\u1eedi</div>
        </div>
    </div></div>`;

    body.innerHTML = html;
    All.$id('bj-out-room-ingame')?.addEventListener('click', closeBlackjack);
    All.$id('bj-room-code-badge')?.addEventListener('click', () => {
        navigator.clipboard.writeText(bjRoomId).then(() => bjToast('Copy m\u00e3 ph\u00f2ng!'));
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
        if (confirm('B\u1ea1n mu\u1ed1n \u0111u\u1ed5i ng\u01b0\u1eddi ch\u01a1i n\u00e0y?')) {
            if (bjConns[pid]) bjConns[pid].send({ type: 'KICKED' });
            setTimeout(() => {
                if (bjConns[pid]) bjConns[pid].close();
                bjHandleDisconnect(pid);
            }, 500);
        }
    }));
    bjBindMyActions();
    bjBindChat();
    const cl = All.$id('bj-chat-log');
    if (cl) cl.scrollTop = cl.scrollHeight;
}

function bjBuildMyActions() {
    const gs = bjGameState;
    if (!gs) return '';
    if (bjMyStatus === 'spectator') return `<div class="bj-msg-sm" style="text-align:center;opacity:0.6">\uD83D\uDC41 \u0110ang xem \u2014 S\u1ebd v\u00e0o \u1edf round sau</div>`;
    const coins = ctx.S.coins || 0;

    if (gs.phase === 'betting') {
        if (gs.betsIn?.[bjMyId]) return `<div class="bj-msg-sm" style="text-align:center;color:#7ed;">\u2713 \u0110\u00e3 \u0111\u1eb7t ${gs.betsIn[bjMyId].toLocaleString()}G \u2014 Ch\u1edd ng\u01b0\u1eddi kh\u00e1c...</div>`;
        const min = bjSettings.minBet;
        if (coins < min) return `<div class="bj-msg-sm" style="color:#e05;">\u26a0 Kh\u00f4ng \u0111\u1ee7 v\u00e0ng c\u01b0\u1ee3c (c\u1ea7n t\u1ed1i thi\u1ec3u ${min}G)</div>`;
        return `<div class="bj-bet-row">
            <input class="inp" id="bj-room-bet-inp" type="number" min="${min}" max="${bjSettings.maxBet||''}" value="${Math.min(Math.max(min,100),coins)}" style="width:110px">
            <span class="buy plain bj-quick bj-rquick" data-q="4">\u00bc</span>
            <span class="buy plain bj-quick bj-rquick" data-q="2">\u00bd</span>
            <span class="buy plain bj-quick bj-rquick" data-q="1">Max</span>
            <div class="buy" id="bj-room-place-bet">\u0110\u1eb7t C\u01b0\u1ee3c</div>
        </div>`;
    }
    if (gs.phase === 'insurance') {
        const myHand = gs.hands?.[bjMyId];
        if (!myHand) return '';
        const hasBJ = isBlackjack(myHand.cards[0]);
        if (hasBJ) return `<div class="bj-btn-row">
            <div class="buy" id="bj-rm-even">L\u1ea5y ngay 1:1 (Even Money)</div>
            <div class="buy plain" id="bj-rm-skip-ins">B\u1ecf qua</div>
        </div>`;
        const maxIns = Math.floor((myHand.bet[0]||0)/2);
        return `<div class="bj-msg-sm">Dealer Ace \u2014 Mua b\u1ea3o hi\u1ec3m ${maxIns}G?</div>
        <div class="bj-btn-row">
            <div class="buy" id="bj-rm-buy-ins">Mua ${maxIns}G</div>
            <div class="buy plain" id="bj-rm-skip-ins">B\u1ecf qua</div>
        </div>`;
    }
    if (gs.phase === 'player') {
        if (gs.currentTurn !== bjMyId) return `<div class="bj-msg-sm" style="text-align:center;opacity:0.6">\u231b \u0110\u1ee3i l\u01b0\u1ee3t b\u1ea1n...</div>`;
        const h = gs.hands?.[bjMyId];
        if (!h) return '';
        const idx = h.activeHandIdx || 0;
        const hand = h.cards[idx]; const tot = handTotal(hand); const bet = h.bet[idx];
        const isSA = (h.splitAceIdxs||[]).includes(idx);
        if (tot > 21) return `<div class="bj-msg-sm">\uD83D\uDC80 Bust!</div>`;
        if (isSA) return `<div class="bj-msg-sm">Split Ace \u2014 T\u1ef1 Stand.</div>`;
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
    if (gs.phase==='dealer'||gs.phase==='dealer_bj') return `<div class="bj-msg-sm" style="text-align:center;opacity:0.6">\uD83C\uDCCF Nh\u00e0 c\u00e1i \u0111ang r\u00fat b\u00e0i...</div>`;
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
        const h = gs?.hands?.[bjMyId];
        if (!h) return;
        const payout = h.bet[0]*2;
        ctx.S.coins=(ctx.S.coins||0)+payout; save(); renderStatus();
        bjRoomAction('INSURANCE_ANSWER', { answer:'even' });
    });
    All.$id('bj-rm-buy-ins')?.addEventListener('click', () => {
        const h = gs?.hands?.[bjMyId];
        const ins = Math.floor((h?.bet[0]||0)/2);
        if ((ctx.S.coins||0)<ins) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng');
        ctx.S.coins=(ctx.S.coins||0)-ins; save();
        bjRoomAction('INSURANCE_ANSWER',{answer:'ins'});
    });
    All.$id('bj-rm-skip-ins')?.addEventListener('click',()=>bjRoomAction('INSURANCE_ANSWER',{answer:'skip'}));
    All.$id('bj-rm-hit')?.addEventListener('click',()=>bjRoomAction('HIT'));
    All.$id('bj-rm-stand')?.addEventListener('click',()=>bjRoomAction('STAND'));
    All.$id('bj-rm-double')?.addEventListener('click',()=>{
        const h=gs?.hands?.[bjMyId]; const idx=h?.activeHandIdx||0; const bet=h?.bet[idx]||0;
        if((ctx.S.coins||0)<bet) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng Double');
        ctx.S.coins=(ctx.S.coins||0)-bet; save(); bjRoomAction('DOUBLE');
    });
    All.$id('bj-rm-split')?.addEventListener('click',()=>{
        const h=gs?.hands?.[bjMyId]; const idx=h?.activeHandIdx||0; const bet=h?.bet[idx]||0;
        if((ctx.S.coins||0)<bet) return bjToast('Kh\u00f4ng \u0111\u1ee7 v\u00e0ng Split');
        ctx.S.coins=(ctx.S.coins||0)-bet; save(); bjRoomAction('SPLIT');
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
            return `<div class="bj-chat-line"><b>${e.name}</b> xin <b>${rd.amount.toLocaleString()}G</b> (\u0110\u00e3 nh\u1eadn: ${rd.fulfilled.toLocaleString()})${btn}</div>`;
        }
        return `<div class="bj-chat-line"><b>${e.name}:</b> ${e.msg.replace(/</g,'&lt;')}</div>`;
    }).join('');
    setTimeout(() => { if (el) el.scrollTop = el.scrollHeight + 100; }, 10);
}

function bjBindChat() {
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
        const amtStr = prompt('Nh\u1eadp s\u1ed1 ti\u1ec1n mu\u1ed1n xin (G):');
        const amt = parseInt(amtStr);
        if (!isNaN(amt) && amt > 0) {
            const reqId = bjMyId + '-' + Date.now();
            const msg = { type: 'CHAT_REQ', reqData: { reqId, pid: bjMyId, amount: amt, fulfilled: 0 } };
            bjHandleMsg(bjMyId, msg);
            bjBroadcast(msg);
        }
    });
    All.$id('bj-chat-toggle')?.addEventListener('click', () => {
        All.$id('bj-chat-wrap')?.classList.add('open');
        if (bjUnreadChat > 0) { bjUnreadChat = 0; bjRenderRoom(); }
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
            <div style="text-align:center;font-size:16px;color:#a3763d;font-weight:bold;margin-bottom:10px;">Ch\u1ecdn ch\u1ebf \u0111\u1ed9 ch\u01a1i</div>
            <div class="buy" id="bj-solo-pick" style="text-align:center;padding:20px;font-size:16px;">
                \uD83C\uDCCF Ch\u01a1i \u0110\u01a1n<br><small style="font-weight:normal;font-size:12px;opacity:0.8;">Solo vs Nh\u00e0 c\u00e1i m\u00e1y t\u00ednh</small>
            </div>
            <div class="buy plain" id="bj-room-pick" style="text-align:center;padding:20px;font-size:16px;">
                \uD83C\uDFB0 Ch\u01a1i Ph\u00f2ng<br><small style="font-weight:normal;font-size:12px;opacity:0.8;">\u0110a ng\u01b0\u1eddi (t\u1ed1i \u0111a 4), c\u00f9ng \u0111\u1ea5u v\u1edbi nh\u00e0 c\u00e1i</small>
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
    if (rd.pid === bjMyId) return bjToast('B\u1ea1n kh\u00f4ng th\u1ec3 t\u1ef1 cho ti\u1ec1n m\u00ecnh!');
    const remaining = rd.amount - rd.fulfilled;
    if (remaining <= 0) return bjToast('\u0110\u00e3 \u0111\u1ee7 ti\u1ec1n r\u1ed3i!');
    
    const amtStr = prompt(`Cho ti\u1ec1n ${log.name} (T\u1ed1i \u0111a: ${remaining.toLocaleString()}G):`, String(remaining));
    const amt = parseInt(amtStr);
    if (isNaN(amt) || amt <= 0) return;
    
    const coins = ctx.S.coins || 0;
    if (coins < amt) return bjToast('B\u1ea1n kh\u00f4ng \u0111\u1ee7 ti\u1ec1n!');
    
    const give = Math.min(amt, remaining);
    ctx.S.coins = coins - give;
    save(); renderStatus();
    
    const msg = { type: 'GIVE_MONEY', reqId, from: bjMyName(), amount: give };
    bjHandleMsg(bjMyId, msg);
    if (bjIsHost) bjBroadcast(msg);
    else bjBroadcast(msg); // Clients send to host, host will broadcast it to others? Wait, clients only send to Host! Host needs to broadcast it!
}
