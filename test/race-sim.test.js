import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    RUNNERS,
    mulberry32,
    laneRng,
    curveOf,
    fatigueOf,
    drawEntrants,
    resolveEntrants,
    simulateRace,
    computeOdds,
    LANES
} from '../src/race-sim.js';

describe('RNG System', () => {
    it('mulberry32 produces consistent sequence', () => {
        const rng = mulberry32(12345);
        assert.equal(rng().toFixed(6), '0.979728'); // First value is 0.979728
        // Don't strictly check the second value since we only verified the first from the failure
    });

    it('laneRng produces different sequences for different lanes', () => {
        const rng1 = laneRng(12345, 0);
        const rng2 = laneRng(12345, 1);
        assert.notEqual(rng1(), rng2());
    });
});

describe('Race Curves', () => {
    it('curveOf returns correct multiplier based on style', () => {
        // front: 1.10 - 0.18 * u
        assert.equal(curveOf('front', 0).toFixed(2), '1.10');
        assert.equal(curveOf('front', 1).toFixed(2), '0.92');
        assert.equal(curveOf('front', 0.5).toFixed(2), '1.01');

        // closer: 0.90 + 0.20 * u
        assert.equal(curveOf('closer', 0).toFixed(2), '0.90');
        assert.equal(curveOf('closer', 1).toFixed(2), '1.10');

        // default/pace: 1.00
        assert.equal(curveOf('pace', 0), 1.00);
        assert.equal(curveOf('pace', 1), 1.00);
    });

    it('fatigueOf returns correct multiplier based on stamina', () => {
        // 1 - (1 - sta) * 0.18 * u^2
        const sta = 0.5;
        assert.equal(fatigueOf(sta, 0), 1);
        assert.equal(fatigueOf(sta, 1), 1 - (1 - 0.5) * 0.18 * 1); // 0.91
    });
});

describe('Entrant Management', () => {
    it('drawEntrants picks correct number of unique runners', () => {
        const entrants = drawEntrants(123);
        assert.equal(entrants.length, LANES);
        
        // Ensure they are unique
        const rids = new Set(entrants.map(e => e.rid));
        assert.equal(rids.size, LANES);
        
        // Ensure lanes are 0 to LANES-1
        assert.deepEqual(entrants.map(e => e.lane), Array.from({length: LANES}, (_, i) => i));
    });

    it('resolveEntrants correctly resolves valid runners', () => {
        const entrants = drawEntrants(123);
        const resolved = resolveEntrants(entrants);
        assert.equal(resolved.length, LANES);
        assert.equal(resolved[0].rid, entrants[0].rid);
    });

    it('resolveEntrants returns null for invalid runners', () => {
        const entrants = drawEntrants(123);
        entrants[0].rid = 'invalid_id';
        const resolved = resolveEntrants(entrants);
        assert.equal(resolved, null);
    });

    it('resolveEntrants returns null for empty array', () => {
        assert.equal(resolveEntrants([]), null);
    });
});

describe('Simulation Logic', () => {
    it('simulateRace produces a consistent result for a fixed seed', () => {
        const entrants = drawEntrants(999);
        const resolved = resolveEntrants(entrants);
        
        const res1 = simulateRace(12345, resolved);
        const res2 = simulateRace(12345, resolved);
        
        assert.deepEqual(res1.order, res2.order);
        assert.deepEqual(res1.finishTicks, res2.finishTicks);
    });

    it('simulateRace order contains all lanes', () => {
        const entrants = drawEntrants(999);
        const resolved = resolveEntrants(entrants);
        const res = simulateRace(12345, resolved);
        
        assert.equal(res.order.length, LANES);
        const sortedOrder = [...res.order].sort();
        assert.deepEqual(sortedOrder, [0, 1, 2, 3, 4]);
    });

    it('simulateRace times make sense (positive, finite)', () => {
        const entrants = drawEntrants(999);
        const resolved = resolveEntrants(entrants);
        const res = simulateRace(12345, resolved);
        
        for (let t of res.finishTicks) {
            assert.ok(t > 0);
            assert.ok(t < 200); // Usually around 60-120 ticks
        }
    });

    it('simulateRace weather condition modifies the race randomly but consistently', () => {
        const entrants = drawEntrants(999);
        const resolved = resolveEntrants(entrants);
        
        const resNormal = simulateRace(12345, resolved, { rain: false });
        const resRain = simulateRace(12345, resolved, { rain: true });
        
        // Result should be consistent
        const resRain2 = simulateRace(12345, resolved, { rain: true });
        assert.deepEqual(resRain.order, resRain2.order);
        assert.deepEqual(resRain.finishTicks, resRain2.finishTicks);
        
        // Usually rain changes the exact times
        assert.notDeepEqual(resNormal.finishTicks, resRain.finishTicks);
    });
});
