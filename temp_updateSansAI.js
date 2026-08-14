function updateSansAI(a, enemyGroup, dt, arenaRect, arena, projectiles) {
    const staminaPct = Math.max(0, Math.min(100, (a.stamina / a.maxStamina) * 100));
    const staminaFill = a.el.querySelector('.dg-stamina-fill');
    if (staminaFill) staminaFill.style.width = staminaPct + '%';
    
    ['blueMagicCd', 'gravityCd', 'gasterCd', 'tpCd'].forEach(cdName => {
        if (a[cdName] > 0) a[cdName] -= dt;
    });
    if (a._shrugTimer > 0) a._shrugTimer -= dt;
    const maxCds = { blueMagicCd: 7, gravityCd: 9, gasterCd: 10 };
    const classes = { blueMagicCd: '.blue-magic', gravityCd: '.gravity-push', gasterCd: '.gaster-blaster' };
    for (let cdName in maxCds) {
        const bar = a.el.querySelector(classes[cdName]);
        if (bar) {
            bar.style.display = 'block';
            const fill = bar.querySelector('.dg-skill-cd-fill');
            if (fill) fill.style.width = Math.max(0, Math.min(100, (1 - Math.max(0, a[cdName]) / maxCds[cdName]) * 100)) + '%';
        }
    }

    if (a.restPending > 0) {
        a.restPending -= dt;
        if (a.restPending <= 0) {
            a.isResting = true;
            a.restTimer = 4;
            a._sleepStep = 0;
            a._sleepAnim = Math.random() < 0.5 ? 'sleep_stand' : 'stool_chup';
        }
    } else if (a.isResting) {
        a.restTimer -= dt;
        a.stamina = Math.min(a.maxStamina, a.stamina + (100 / 4) * dt); // Full regen in 4s
        if (!a._sleepStep) a._sleepStep = 0;
        a._sleepStep += dt * 10;
        const sp = sansDungeonSpriteForAction(a._sleepAnim || 'sleep_stand', Math.floor(a._sleepStep));
        applySansSprite(a.el, sp);
        if (a.restTimer <= 0) a.isResting = false;
        return;
    }

    if (a.cd > 0) a.cd -= dt;
    if (a.tpCd > 0) a.tpCd -= dt;
    
    /** @type {any} */
    let closest = null;
    let minDist = Infinity;
    enemyGroup.filter(b => b.hp > 0).forEach(b => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(0.1, Math.hypot(dx, dy));
        if (dist < minDist) { minDist = dist; closest = { b, dx, dy, dist }; }
    });

    let canGravityPush = a.gravityCd <= 0 && a.tpCd <= 0 && enemyGroup.filter(b=>b.hp>0).length > 0;
    // Gravity Push trigger: either normal (stamina > 20%) or tired (stamina <= 20%)
    if (canGravityPush) {
        let isTired = a.stamina <= (a.maxStamina * 0.2);
        if (isTired) a.stamina -= 12;
        else a.stamina -= 20;
        
        a.gravityCd = 9;
        a.actionTimer = 1.0;
        if (isTired) a.restPending = 1.0;

        if (arena) {
            arena.style.animation = 'dg-shake 0.4s';
            setTimeout(() => { if (arena) arena.style.animation = ''; }, 400);
        }
        
        // Find furthest wall
        const distTop = a.y - 30;
        const distBottom = arenaRect.height - 30 - a.y;
        const distLeft = a.x - 30;
        const distRight = arenaRect.width - 30 - a.x;
        const maxDist = Math.max(distTop, distBottom, distLeft, distRight);
        
        let wallDirX = 0; let wallDirY = 0;
        if (maxDist === distTop) wallDirY = -1;
        else if (maxDist === distBottom) wallDirY = 1;
        else if (maxDist === distLeft) wallDirX = -1;
        else if (maxDist === distRight) wallDirX = 1;

        // Tired teleport to opposite wall
        if (isTired) {
            if (wallDirX !== 0) {
                a.x = wallDirX > 0 ? 40 : arenaRect.width - 40;
                a.y = 40 + Math.random() * (arenaRect.height - 80);
            } else {
                a.y = wallDirY > 0 ? 40 : arenaRect.height - 40;
                a.x = 40 + Math.random() * (arenaRect.width - 80);
            }
            a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            a._shrugTimer = 0.5;
            a.restPending = 0.5;
        }

        // Apply high speed knockback to enemies towards that wall
        enemyGroup.forEach(e => {
            if (e.hp > 0) {
                e.kb = {
                    time: 0.5,
                    dx: wallDirX,
                    dy: wallDirY,
                    speed: 1200 + Math.random() * 400,
                    wallDamage: true
                };
            }
        });
        
        return;
    }

    if (closest && closest.dist < 60 && a.tpCd <= 0 && a.stamina >= 10) {
        a.stamina -= 10;
        a.tpCd = 2;
        a.x += (closest.dx > 0 ? -150 : 150);
        a.y += (closest.dy > 0 ? -150 : 150);
        a.x = Math.max(30, Math.min(a.x, arenaRect.width - 30));
        a.y = Math.max(30, Math.min(a.y, arenaRect.height - 30));
        a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
        a._shrugTimer = 0.5;
        // Don't set actionTimer to 0.3 so we can keep walking visually, just overridden by shrug
        return;
    }

    if (closest && a.actionState === 'idle') {
        if (a.gasterCd <= 0 && a.stamina >= 15) {
            a.gasterCd = 10;
            a.stamina -= 15;
            const sp = sansDungeonSpriteForAction('magic', 1);
            applySansSprite(a.el, sp);

            const dx = closest.dx;
            const dy = closest.dy;
            const dist = closest.dist || 1;
            const dirX = dx / dist;
            const dirY = dy / dist;
            const angle = Math.atan2(dy, dx);
            
            const bx = a.x - dirX * 30;
            const by = a.y - dirY * 30 - 20;

            const blaster = document.createElement('img');
            blaster.className = 'dg-gaster-blaster';
            blaster.src = sansDungeonSpriteForAction('gaster_charge', 0).src;
            blaster.style.position = 'absolute';
            blaster.style.width = '40px';
            blaster.style.height = '40px';
            blaster.style.objectFit = 'contain';
            blaster.style.left = (bx - 20) + 'px';
            blaster.style.top = (by - 20) + 'px';
            blaster.style.zIndex = '50';
            
            let rotDeg = (angle * 180 / Math.PI) - 90;
            blaster.style.transform = `rotate(${rotDeg}deg)`;
            if (arena) arena.appendChild(blaster);
            
            setTimeout(() => {
                if (!arena || !arena.contains(blaster)) return;
                
                blaster.src = sansDungeonSpriteForAction('gaster_fire', 0).src;

                const laser = document.createElement('div');
                laser.style.position = 'absolute';
                laser.style.height = '40px';
                laser.style.width = '1500px';
                laser.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(0,255,255,0.9) 20%, rgba(255,255,255,0.7) 100%)';
                
                laser.style.left = bx + 'px';
                laser.style.top = (by - 20) + 'px';
                laser.style.transformOrigin = '0 50%';
                let laserRot = angle * 180 / Math.PI;
                laser.style.transform = `rotate(${laserRot}deg)`;
                laser.style.zIndex = '40';
                if (arena) arena.appendChild(laser);

                let dotTimer = 3.0;
                let tickTimer = 0;
                const hitInterval = setInterval(() => {
                    dotTimer -= 0.1;
                    tickTimer -= 0.1;
                    if (dotTimer <= 0 || !arena.contains(laser)) {
                        clearInterval(hitInterval);
                        if (laser.parentNode) laser.remove();
                        if (blaster.parentNode) blaster.remove();
                        return;
                    }
                    if (tickTimer <= 0) {
                        tickTimer = 0.2;
                        enemyGroup.forEach(e => {
                            if (e.hp > 0) {
                                const evx = e.x - bx;
                                const evy = (e.y - 16) - by; // Adjust for enemy center
                                const dot = evx * dirX + evy * dirY;
                                const perpDist = Math.abs(evx * dirY - evy * dirX);
                                
                                if (dot > 0 && perpDist < 40) {
                                    e.hp -= 1;
                                    spawnDmg(e, -1);
                                    if (!e.status) e.status = {};
                                    e.status.karmaDuration = 3 * Math.pow(1.10, a.upgrades.karmaDur || 0);
                                    e.karmaStacks = (e.karmaStacks || 0) + 1;
                                }
                            }
                        });
                    }
                }, 100);
            }, 600);
            return;
        }

        if (a.blueMagicCd <= 0 && a.stamina >= 10 && closest.dist < 100) {
            a.blueMagicCd = 7;
            a.stamina -= 10;
            a.actionTimer = 0.5;

            const target = closest.b;
            if (!target.status) target.status = {};
            target.status.stun = 2;
            
            target.el.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
            target.el.style.transform = `translate3d(${target.x - 16}px, ${target.y - 60}px, 0)`;
            setTimeout(() => {
                if (target.el) {
                    target.el.style.transition = 'transform 0.1s cubic-bezier(0.5, 0, 0.75, 0)';
                    target.el.style.transform = `translate3d(${target.x - 16}px, ${target.y - 16}px, 0)`;
                }
                target.hp -= a.atk;
                spawnDmg(target, -a.atk);
                if (!target.status) target.status = {};
                target.status.karmaDuration = 3 * Math.pow(1.10, a.upgrades.karmaDur || 0);
                target.karmaStacks = (target.karmaStacks || 0) + 1;
            }, 300);
            return;
        }
        
        if (a.cd <= 0 && closest.dist <= a.range) {
            a.cd = a.maxCd;
            const bone = document.createElement('div');
            bone.innerHTML = `<img src="${SANS_DUNGEON_SPRITES.bone}" width="8" height="20">`;
            bone.style.position = 'absolute';
            bone.style.left = a.x + 'px';
            bone.style.top = (a.y - 16) + 'px';
            bone.style.zIndex = '50';
            bone.style.animation = 'dg-spin 0.5s linear infinite';
            if (arena) arena.appendChild(bone);
            
            const speed = 250;
            projectiles.push({
                isBone: true, lifetime: 2, maxLifetime: 2,
                vx: (closest.dx / closest.dist) * speed, vy: (closest.dy / closest.dist) * speed,
                x: a.x, y: a.y, el: bone, a, groupB: enemyGroup,
                onHit: (tgt) => {
                    tgt.hp -= a.atk;
                    spawnDmg(tgt, -a.atk);
                    if (!tgt.status) tgt.status = {};
                    tgt.status.karmaDuration = 3 * Math.pow(1.10, a.upgrades.karmaDur || 0);
                    tgt.karmaStacks = (tgt.karmaStacks || 0) + 1;
                }
            });
            return;
        }
    }

    if (a.actionState !== 'idle') {
        a.actionTimer -= dt;
        if (a.actionTimer <= 0) {
            a.actionState = 'idle';
        } else {
            if (a.actionState !== 'magic' && a.actionState !== 'shrug' && a.actionState !== 'sleep_stand' && a.actionState !== 'stool_chup') {
                if (!a._actionStep) a._actionStep = 0;
                a._actionStep += dt * 10;
                const sp = sansDungeonSpriteForAction(a.actionState, Math.floor(a._actionStep));
                if (closest && closest.dx < 0) sp.flip = true;
                else sp.flip = false;
                applySansSprite(a.el, sp);
            }
            return;
        }
    }

    if (closest) {
        let moveX = 0, moveY = 0;
        const speed = a.speed * dt;
        
        if (closest.dist < a.range * 0.5) {
            moveX = -(closest.dx / closest.dist) * speed;
            moveY = -(closest.dy / closest.dist) * speed;
        } else if (closest.dist > a.range * 0.9) {
            moveX = (closest.dx / closest.dist) * speed;
            moveY = (closest.dy / closest.dist) * speed;
        }
        
        if (moveX !== 0 || moveY !== 0) {
            a.x += moveX;
            a.y += moveY;
            a.x = Math.max(20, Math.min(a.x, arenaRect.width - 20));
            a.y = Math.max(20, Math.min(a.y, arenaRect.height - 20));
            a.el.style.transform = `translate3d(${a.x - 16}px, ${a.y - 16}px, 0)`;
            
            if (!a._walkStep) a._walkStep = 0;
            a._walkStep += dt * 10;
            let sp = sansDungeonSpriteFor(moveX, moveY, Math.floor(a._walkStep));
            if (a._shrugTimer > 0) sp = sansDungeonSpriteForAction('shrug', 0);
            applySansSprite(a.el, sp);
        } else {
            let sp = sansDungeonSpriteForAction('idle', 0);
            if (a._shrugTimer > 0) sp = sansDungeonSpriteForAction('shrug', 0);
            applySansSprite(a.el, sp);
        }
    }
}