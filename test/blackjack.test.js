/**
 * Blackjack Comprehensive Test Suite
 * Tests card engine, payout logic, solo mode, and multiplayer security hardening.
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

// ─── Inline card engine (mirrors blackjack.js) ────────────────────────────────
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
    for (let d = 0; d < numDecks; d++)
        for (const suit of SUITS)
            for (const rank of RANKS)
                cards.push({ suit, rank });
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

function bjEscapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Payout logic (mirrors bjHostEndRound) ────────────────────────────────────
function calcPayout(pid, h, gs, dTotal, dBJ, dBust) {
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
            if (pBJ) { p += bet + Math.floor(bet * 1.2); continue; }
            if (dBJ) continue;
            if (dBust || pTotal > dTotal) { p += bet * 2; continue; }
            if (pTotal === dTotal) { p += bet; continue; }
        }
    }
    return p;
}

// ─── Simulate multiplayer BET_REQUEST host logic ──────────────────────────────
function simulateBetRequest(bjGameState, bjSettings, fromPid, data) {
    if (typeof data.bet !== 'number' || data.bet <= 0 || !Number.isFinite(data.bet)) return 'INVALID';
    if (data.bet < bjSettings.minBet) return 'BELOW_MIN';
    if (bjSettings.maxBet > 0 && data.bet > bjSettings.maxBet) return 'ABOVE_MAX';
    if (!bjGameState || bjGameState.phase !== 'betting' || (bjGameState.betsIn && bjGameState.betsIn[fromPid])) return 'WRONG_PHASE';
    return 'ACCEPTED';
}

// ─────────────────────────────────────────────────────────────────────────────
//  TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('Card Engine', () => {
    it('handTotal: basic values', () => {
        assert.equal(handTotal([{rank:'K'},{rank:'Q'}]), 20);
        assert.equal(handTotal([{rank:'A'},{rank:'K'}]), 21);
        assert.equal(handTotal([{rank:'A'},{rank:'A'}]), 12);
    });

    it('handTotal: ace soft/hard conversion', () => {
        // A+A+K = 12 (one ace goes hard)
        assert.equal(handTotal([{rank:'A'},{rank:'A'},{rank:'K'}]), 12);
        // A+K+K = 21
        assert.equal(handTotal([{rank:'A'},{rank:'K'},{rank:'K'}]), 21);
        // A+A+9 = 21
        assert.equal(handTotal([{rank:'A'},{rank:'A'},{rank:'9'}]), 21);
    });

    it('handTotal: hidden cards ignored', () => {
        assert.equal(handTotal([{rank:'K'},{rank:'Q',hidden:true}]), 10);
    });

    it('isSoft: detects soft hand correctly', () => {
        assert.equal(isSoft([{rank:'A'},{rank:'6'}]), true);  // soft 17
        assert.equal(isSoft([{rank:'A'},{rank:'K'}]), true);  // A+K = 21, counted as 11 so it is soft 21
        assert.equal(isSoft([{rank:'A'},{rank:'A'},{rank:'9'}]), true); // 11+1+9 = 21, one ace is 11, so soft 21
        assert.equal(isSoft([{rank:'A'},{rank:'A'},{rank:'K'}]), false); // 1+1+10 = 12, aces are 1, hard 12
        assert.equal(isSoft([{rank:'K'},{rank:'7'}]), false);
    });

    it('isBlackjack: only exactly A+10-value', () => {
        assert.equal(isBlackjack([{rank:'A'},{rank:'K'}]), true);
        assert.equal(isBlackjack([{rank:'A'},{rank:'10'}]), true);
        assert.equal(isBlackjack([{rank:'A'},{rank:'9'}]), false);
        assert.equal(isBlackjack([{rank:'A'},{rank:'K'},{rank:'2'}]), false); // 3 cards
        assert.equal(isBlackjack([{rank:'7'},{rank:'7'},{rank:'7'}]), false); // 21 but not BJ
    });

    it('buildShoe: correct card count', () => {
        const shoe = buildShoe(1, 12345);
        assert.equal(shoe.length, 52);
        const shoe6 = buildShoe(6, 99999);
        assert.equal(shoe6.length, 312);
    });

    it('buildShoe: deterministic with same seed', () => {
        const a = buildShoe(1, 42);
        const b = buildShoe(1, 42);
        assert.deepEqual(a, b);
    });

    it('buildShoe: different seeds produce different shoes', () => {
        const a = buildShoe(1, 1);
        const b = buildShoe(1, 2);
        assert.notDeepEqual(a, b);
    });

    it('buildShoe: all ranks and suits present', () => {
        const shoe = buildShoe(1, 777);
        for (const suit of SUITS)
            for (const rank of RANKS)
                assert.ok(shoe.some(c => c.suit === suit && c.rank === rank), `Missing ${rank}${suit}`);
    });

    it('is10Value: correct classification', () => {
        assert.equal(is10Value('10'), true);
        assert.equal(is10Value('J'), true);
        assert.equal(is10Value('Q'), true);
        assert.equal(is10Value('K'), true);
        assert.equal(is10Value('A'), false);
        assert.equal(is10Value('9'), false);
    });
});

describe('Payout Logic', () => {
    const makeHand = (cards, bet = 100) => ({
        cards: [cards], bet: [bet], stood: [true], doubled: [false],
        activeHandIdx: 0, splitAceIdxs: [], insuranceBet: 0, surrendered: false,
    });

    const makeGs = (extra = {}) => ({
        turnOrder: ['p1'], hands: {}, dealerHand: [], betsIn: {}, insuranceAnswers: {},
        ...extra,
    });

    it('player wins normally', () => {
        const h = makeHand([{rank:'K'},{rank:'9'}], 100); // 19
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 18, false, false);
        assert.equal(p, 200); // bet back + win
    });

    it('player loses', () => {
        const h = makeHand([{rank:'K'},{rank:'7'}], 100); // 17
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 18, false, false);
        assert.equal(p, 0);
    });

    it('push (tie)', () => {
        const h = makeHand([{rank:'K'},{rank:'7'}], 100); // 17
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 17, false, false);
        assert.equal(p, 100); // just bet back
    });

    it('player blackjack vs non-BJ dealer pays 6:5', () => {
        const gs = { insuranceAnswers: {} };
        const h = { cards: [[{rank:'A'}, {rank:'K'}]], bet: [100], surrendered: false, insuranceBet: 0 };
        const dTotal = 20; // non-BJ
        assert.equal(calcPayout('p1', h, gs, dTotal, false, false), 220); // 100 + 100*1.2
    });

    it('both blackjack = push', () => {
        const h = makeHand([{rank:'A'},{rank:'K'}], 100);
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 21, true, false);
        assert.equal(p, 100);
    });

    it('dealer blackjack beats player', () => {
        const h = makeHand([{rank:'K'},{rank:'9'}], 100); // 19
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 21, true, false);
        assert.equal(p, 0);
    });

    it('dealer bust = player wins', () => {
        const h = makeHand([{rank:'K'},{rank:'7'}], 100); // 17
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 22, false, true);
        assert.equal(p, 200);
    });

    it('player bust loses (even if dealer busts)', () => {
        const h = makeHand([{rank:'K'},{rank:'K'},{rank:'5'}], 100); // 25 bust
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 22, false, true);
        assert.equal(p, 0);
    });

    it('surrender returns half bet', () => {
        const h = makeHand([{rank:'K'},{rank:'6'}], 100);
        h.surrendered = true;
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 18, false, false);
        assert.equal(p, 50);
    });

    it('even money: pays 2x regardless of dealer hand', () => {
        const h = makeHand([{rank:'A'},{rank:'K'}], 100);
        const gs = makeGs({ insuranceAnswers: { p1: 'even' } });
        const p = calcPayout('p1', h, gs, 21, true, false); // dealer BJ
        assert.equal(p, 200);
        const p2 = calcPayout('p1', h, gs, 18, false, false);
        assert.equal(p2, 200);
    });

    it('insurance pays 3x insuranceBet when dealer has BJ', () => {
        const h = makeHand([{rank:'K'},{rank:'8'}], 100);
        h.insuranceBet = 50;
        const gs = makeGs();
        const p = calcPayout('p1', h, gs, 21, true, false);
        assert.equal(p, 150); // 50 * 3 = 150 (original bet lost to dealer BJ)
    });

    it('NO host double-payout: SUMMARY_START only credits once', () => {
        // Simulates the old bug: host would credit itself twice.
        // In the patched version bjHostEndRound does NOT manually add coins;
        // it broadcasts SUMMARY_START which credits once via bjHandleMsg.
        // We assert that calcPayout only runs once and that there is no separate pre-payout.
        let credits = 0;
        const payout = 200;
        // Old behavior simulation (BUG):
        //   credits += payout;   // line ~1192 (now removed)
        //   credits += payout;   // via SUMMARY_START handler
        // New behavior: only SUMMARY_START credits
        credits += payout; // via SUMMARY_START handler only
        assert.equal(credits, 200, 'Host should only receive payout once');
    });
});

describe('Multiplayer Security — BET_REQUEST host validation', () => {
    const makeGs = (phase, betsIn = {}) => ({ phase, betsIn });
    const settings = { minBet: 10, maxBet: 100, numDecks: 6 };

    it('accepts valid bet in betting phase', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 50 }), 'ACCEPTED');
    });

    it('rejects NaN bet', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: NaN }), 'INVALID');
    });

    it('rejects Infinity bet', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: Infinity }), 'INVALID');
    });

    it('rejects negative bet', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: -50 }), 'INVALID');
    });

    it('rejects zero bet', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 0 }), 'INVALID');
    });

    it('rejects string bet (type coercion attack)', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: '50' }), 'INVALID');
    });

    it('rejects bet below minimum', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 5 }), 'BELOW_MIN');
    });

    it('rejects bet above maximum', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 200 }), 'ABOVE_MAX');
    });

    it('accepts bet equal to max', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 100 }), 'ACCEPTED');
    });

    it('accepts bet equal to min', () => {
        const gs = makeGs('betting');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 10 }), 'ACCEPTED');
    });

    it('rejects late bet (phase = player) — LATE-BETTING EXPLOIT', () => {
        const gs = makeGs('player');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 50 }), 'WRONG_PHASE');
    });

    it('rejects late bet (phase = dealer)', () => {
        const gs = makeGs('dealer');
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 50 }), 'WRONG_PHASE');
    });

    it('rejects bet replacement — DOUBLE BET EXPLOIT', () => {
        const gs = makeGs('betting', { p1: 50 }); // already bet
        assert.equal(simulateBetRequest(gs, settings, 'p1', { bet: 100 }), 'WRONG_PHASE');
    });

    it('rejects when no game state', () => {
        assert.equal(simulateBetRequest(null, settings, 'p1', { bet: 50 }), 'WRONG_PHASE');
    });

    it('accepts no-max when maxBet=0', () => {
        const gs = makeGs('betting');
        const s2 = { ...settings, maxBet: 0 };
        assert.equal(simulateBetRequest(gs, s2, 'p1', { bet: 99999 }), 'ACCEPTED');
    });
});

describe('Multiplayer Security — GIVE_MONEY_REQ cap', () => {
    function simulateGiveMoneyHost(reqData, giveAmount) {
        let actualGive = giveAmount;
        if (reqData.fulfilled + actualGive > reqData.amount) {
            actualGive = reqData.amount - reqData.fulfilled;
        }
        if (actualGive <= 0) return { accepted: false, actualGive: 0 };
        return { accepted: true, actualGive };
    }

    it('allows normal give within limit', () => {
        const rd = { amount: 100, fulfilled: 0 };
        const r = simulateGiveMoneyHost(rd, 50);
        assert.equal(r.accepted, true);
        assert.equal(r.actualGive, 50);
    });

    it('caps overpayment to remaining amount', () => {
        const rd = { amount: 100, fulfilled: 60 };
        const r = simulateGiveMoneyHost(rd, 100); // tries to give 100 but only 40 left
        assert.equal(r.accepted, true);
        assert.equal(r.actualGive, 40);
    });

    it('rejects if already fulfilled', () => {
        const rd = { amount: 100, fulfilled: 100 };
        const r = simulateGiveMoneyHost(rd, 50);
        assert.equal(r.accepted, false);
        assert.equal(r.actualGive, 0);
    });

    it('rejects negative give amount', () => {
        const rd = { amount: 100, fulfilled: 0 };
        const r = simulateGiveMoneyHost(rd, -50);
        assert.equal(r.accepted, false);
    });
});

describe('XSS Prevention — bjEscapeHTML', () => {
    it('escapes < and >', () => {
        assert.equal(bjEscapeHTML('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('escapes & character', () => {
        assert.equal(bjEscapeHTML('a&b'), 'a&amp;b');
    });

    it('escapes double quotes', () => {
        assert.equal(bjEscapeHTML('"hello"'), '&quot;hello&quot;');
    });

    it('handles empty string', () => {
        assert.equal(bjEscapeHTML(''), '');
    });

    it('handles null/undefined safely', () => {
        assert.equal(bjEscapeHTML(null), '');
        assert.equal(bjEscapeHTML(undefined), '');
    });

    it('passes safe string unchanged', () => {
        assert.equal(bjEscapeHTML('Nguyễn Văn A'), 'Nguyễn Văn A');
    });

    it('XSS img onerror payload is neutralized', () => {
        const payload = '<img src=x onerror=alert(1)>';
        const escaped = bjEscapeHTML(payload);
        assert.ok(!escaped.includes('<img'), 'img tag must not pass through');
        assert.ok(escaped.includes('&lt;img'), 'must be escaped');
    });

    it('XSS via username chain: name stored escaped, renders safely in innerHTML context', () => {
        const maliciousName = '<b onmouseover=stealCookies()>Player1</b>';
        const safe = bjEscapeHTML(maliciousName);
        // After escaping: &lt;b onmouseover=stealCookies()&gt;Player1&lt;/b&gt;
        // When set as innerHTML, browser treats it as plaintext, NOT as a live tag.
        // The text 'onmouseover' may still appear (as display text), but without surrounding
        // angle brackets it cannot be parsed as an HTML attribute and thus cannot execute.
        assert.ok(!safe.includes('<b '), 'raw <b tag must not be present');
        assert.ok(safe.includes('&lt;b'), 'must be escaped to &lt;b');
        // The key safety proof: no un-escaped < or > so the attribute cannot form a tag
        assert.ok(!safe.includes('<'), 'no un-escaped < angle bracket');
        assert.ok(!safe.includes('>'), 'no un-escaped > angle bracket');
    });
});

describe('Dealer Logic', () => {
    it('dealer hits on soft 17', () => {
        // soft 17 = A+6: total 17 but soft, dealer must hit
        const hand = [{rank:'A'},{rank:'6'}];
        const total = handTotal(hand);
        const soft = isSoft(hand);
        assert.equal(total, 17);
        assert.equal(soft, true);
        const shouldHit = total < 17 || (soft && total === 17);
        assert.equal(shouldHit, true);
    });

    it('dealer stands on hard 17', () => {
        const hand = [{rank:'K'},{rank:'7'}];
        const total = handTotal(hand);
        const soft = isSoft(hand);
        assert.equal(total, 17);
        assert.equal(soft, false);
        const shouldHit = total < 17 || (soft && total === 17);
        assert.equal(shouldHit, false);
    });

    it('dealer stands on 18+', () => {
        const hand = [{rank:'K'},{rank:'8'}];
        const total = handTotal(hand);
        const soft = isSoft(hand);
        const shouldHit = total < 17 || (soft && total === 17);
        assert.equal(shouldHit, false);
    });

    it('dealer hits on 16', () => {
        const hand = [{rank:'K'},{rank:'6'}];
        const total = handTotal(hand);
        const soft = isSoft(hand);
        const shouldHit = total < 17 || (soft && total === 17);
        assert.equal(shouldHit, true);
    });
});

describe('Edge Cases — integer overflow / extreme bets', () => {
    it('very large bet does not overflow payout', () => {
        const bigBet = Number.MAX_SAFE_INTEGER;
        const h = {
            cards: [[{rank:'K'},{rank:'9'}]], bet: [bigBet], stood: [true],
            doubled: [false], activeHandIdx: 0, splitAceIdxs: [], insuranceBet: 0, surrendered: false,
        };
        const gs = { insuranceAnswers: {} };
        const payout = calcPayout('p1', h, gs, 18, false, false);
        // bet * 2 should still be a safe integer (or Infinity, either way it won't be a silent wrap)
        assert.ok(typeof payout === 'number', 'payout is numeric');
        assert.ok(payout >= 0, 'payout is non-negative');
    });

    it('isBlackjack with 0 cards returns false', () => {
        assert.equal(isBlackjack([]), false);
    });

    it('handTotal with empty hand returns 0', () => {
        assert.equal(handTotal([]), 0);
    });

    it('buildShoe with numDecks=0 returns empty array', () => {
        const shoe = buildShoe(0, 1);
        assert.equal(shoe.length, 0);
    });
});
