import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    ANCHOR_MIN,
    ANCHOR_MAX,
    POT_CAP,
    INITIAL_BET_CAP,
    HOUSE_RETURN,
    MIN_MULT,
    rollD100,
    rollAnchor,
    clampAnchor,
    safeAmount,
    oddsOf,
    resolveRoll,
    resolveStake,
    nextPot,
    applyCashOut,
    resultLabel
} from '../src/bet-odds.js';

describe('Constants & Bounds', () => {
    it('Bounds prevent 100% win rate exploit', () => {
        assert.ok(ANCHOR_MIN >= 2, 'ANCHOR_MIN must be >= 2 to allow "hi" to lose');
        assert.ok(ANCHOR_MAX <= 99, 'ANCHOR_MAX must be <= 99 to allow "lo" to lose');
    });
});

describe('RNG & Anchors', () => {
    it('rollD100 respects bounds 1 to 100', () => {
        assert.equal(rollD100(() => 0), 1);
        assert.equal(rollD100(() => 0.999), 100);
        assert.equal(rollD100(() => 0.5), 51);
    });

    it('rollAnchor respects ANCHOR_MIN to ANCHOR_MAX', () => {
        assert.equal(rollAnchor(() => 0), ANCHOR_MIN);
        assert.equal(rollAnchor(() => 0.999), ANCHOR_MAX);
    });

    it('clampAnchor clamps values to safe bounds', () => {
        assert.equal(clampAnchor(1), ANCHOR_MIN);
        assert.equal(clampAnchor(0), ANCHOR_MIN);
        assert.equal(clampAnchor(-50), ANCHOR_MIN);
        assert.equal(clampAnchor(100), ANCHOR_MAX);
        assert.equal(clampAnchor(50), 50);
        assert.equal(clampAnchor(NaN), ANCHOR_MIN);
        assert.equal(clampAnchor('70'), 70);
    });
});

describe('Safety Formatting', () => {
    it('safeAmount sanitizes inputs correctly', () => {
        assert.equal(safeAmount(100), 100);
        assert.equal(safeAmount(100.99), 100);
        assert.equal(safeAmount(-50), 0);
        assert.equal(safeAmount(0), 0);
        assert.equal(safeAmount(NaN), 0);
        assert.equal(safeAmount(Infinity), 0);
        assert.equal(safeAmount('100'), 100);
        assert.equal(safeAmount('abc'), 0);
    });
});

describe('Odds Calculation', () => {
    it('oddsOf calculates correct wins and multipliers for valid anchors', () => {
        // test anchor 50
        const oddsHi = oddsOf(50, 'hi'); // 100 - 50 = 50 wins
        assert.equal(oddsHi.wins, 50);
        assert.equal(oddsHi.locked, false);
        assert.equal(oddsHi.mult, Math.round((HOUSE_RETURN / 50) * 100) / 100);

        const oddsLo = oddsOf(50, 'lo'); // 50 - 1 = 49 wins
        assert.equal(oddsLo.wins, 49);
        assert.equal(oddsLo.locked, false);
    });

    it('oddsOf locks impossible or 100% win rate cases (exploit prevention)', () => {
        // If anchor is 1, 'hi' has 99 wins. 99 wins means no losing outcomes (1 push, 99 win).
        const exploitHi = oddsOf(1, 'hi');
        assert.equal(exploitHi.locked, true, 'Should lock when wins >= 99');
        assert.equal(exploitHi.mult, 0);

        // If anchor is 100, 'lo' has 99 wins.
        const exploitLo = oddsOf(100, 'lo');
        assert.equal(exploitLo.locked, true, 'Should lock when wins >= 99');
    });

    it('oddsOf respects MIN_MULT', () => {
        const oddsHi = oddsOf(ANCHOR_MIN, 'hi'); // eg. 5, so hi has 95 wins.
        // MULT = 97 / 95 = 1.02. If min_mult is higher, it respects it.
        assert.ok(oddsHi.mult >= MIN_MULT);
    });
});

describe('Game Resolution', () => {
    it('resolveRoll returns correct status', () => {
        assert.equal(resolveRoll(50, 'hi', 50), 'push');
        assert.equal(resolveRoll(50, 'lo', 50), 'push');

        assert.equal(resolveRoll(50, 'hi', 51), 'win');
        assert.equal(resolveRoll(50, 'hi', 49), 'lose');

        assert.equal(resolveRoll(50, 'lo', 49), 'win');
        assert.equal(resolveRoll(50, 'lo', 51), 'lose');
    });

    it('resolveStake respects caps and available coins', () => {
        assert.equal(resolveStake(50, 100), 50);
        assert.equal(resolveStake(200, 100), 100);
        assert.equal(resolveStake(INITIAL_BET_CAP + 1000, INITIAL_BET_CAP + 1000), INITIAL_BET_CAP);
        assert.equal(resolveStake(-50, 100), 0);
    });

    it('nextPot calculates safely and respects cap', () => {
        assert.equal(nextPot(100, 1.5), 150);
        assert.equal(nextPot(100.5, 1.5), 150); // pot floors to 100
        assert.equal(nextPot(POT_CAP, 2), POT_CAP);
        assert.equal(nextPot(100, NaN), 0);
        assert.equal(nextPot(100, -1), 0);
    });

    it('applyCashOut moves pot to coins idempotently', () => {
        const state = { coins: 1000, betPot: 500 };
        const res = applyCashOut(state);
        assert.equal(res, 500);
        assert.equal(state.coins, 1500);
        assert.equal(state.betPot, 0);

        // Idempotent check
        const res2 = applyCashOut(state);
        assert.equal(res2, 0);
        assert.equal(state.coins, 1500);
    });
});
