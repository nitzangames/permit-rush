import { CANVAS_W, CANVAS_H, CONFIG, STATE } from './core/constants.js';
import { CanvasManager } from './core/CanvasManager.js';
import { StateMachine } from './core/StateMachine.js';
import { InputHandler } from './core/InputHandler.js';
import { GameSession } from './systems/GameSession.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { drawBlueprintCard } from './render/cardRenderer.js';
import {
  drawTopHUD, drawTimerBar, drawRulebook, drawSwipeHints, drawNewRulesBanner,
} from './render/hudRenderer.js';
import {
  drawBackground, drawMenu, drawGameOver, drawDisasterFlash, drawBriefing,
} from './render/screenRenderer.js';

const canvas = document.getElementById('game');
const cm = new CanvasManager(canvas);
const ctx = cm.ctx;
const input = new InputHandler(canvas, cm);
const sm = new StateMachine(STATE.MENU);
const session = new GameSession();
const audio = new AudioSystem();

// Render/animation state
let cardOffsetX = 0;
let cardReleaseVX = 0;     // for flying off-screen after commit
let stampVisual = null;    // { type, alpha }
let shakeTTL = 0;
let shakeOffset = { x: 0, y: 0 };
let pulseT = 0;
let paused = false;
let lastWarnPlayed = 0;
let pendingAfterDisaster = null; // () => void, fires on tap/swipe while in DISASTER
let disasterArmDelay = 0;        // brief lockout so the stamp animation reads
let briefingArmDelay = 0;
let briefingIsStart = false;

// ---- input wiring ----

input.on('dragMove', ({ dx }) => {
  if (sm.is(STATE.PLAYING)) cardOffsetX = dx;
});

input.on('dragEnd', ({ dx }) => {
  if (sm.is(STATE.PLAYING)) {
    if (Math.abs(dx) > CONFIG.SWIPE_COMMIT_DX) {
      const action = dx > 0 ? 'approve' : 'reject';
      commitStamp(action);
    } else {
      cardOffsetX = 0;
    }
    return;
  }
  if (sm.is(STATE.DISASTER) && pendingAfterDisaster && disasterArmDelay <= 0) {
    const fn = pendingAfterDisaster;
    pendingAfterDisaster = null;
    fn();
    return;
  }
  if (sm.is(STATE.BRIEFING) && briefingArmDelay <= 0) {
    dismissBriefing();
  }
});

input.on('tap', () => {
  if (sm.is(STATE.MENU)) {
    audio.click();
    startGame();
  } else if (sm.is(STATE.GAMEOVER)) {
    audio.click();
    sm.set(STATE.MENU);
  } else if (sm.is(STATE.DISASTER) && pendingAfterDisaster && disasterArmDelay <= 0) {
    const fn = pendingAfterDisaster;
    pendingAfterDisaster = null;
    audio.click();
    fn();
  } else if (sm.is(STATE.BRIEFING) && briefingArmDelay <= 0) {
    audio.click();
    dismissBriefing();
  }
});

function dismissBriefing() {
  session.newRulesBanner = null;
  if (briefingIsStart) {
    session.nextBlueprint();
  }
  briefingIsStart = false;
  sm.set(STATE.PLAYING);
}

function startGame() {
  session.reset();
  cardOffsetX = 0;
  cardReleaseVX = 0;
  stampVisual = null;
  briefingIsStart = true;
  briefingArmDelay = 0.35;
  sm.set(STATE.BRIEFING);
}

function commitStamp(action) {
  stampVisual = { type: action, alpha: 0 };
  cardReleaseVX = action === 'approve' ? 2200 : -2200;
  sm.set(STATE.STAMPING);

  setTimeout(() => {
    if (action === 'approve') audio.stampApprove(); else audio.stampReject();
    const result = session.decide(action);

    if (!result.correct) {
      audio.disaster();
      shakeTTL = 0.55;
      sm.set(STATE.DISASTER);
      disasterArmDelay = 0.45;
      pendingAfterDisaster = () => {
        if (result.gameover) {
          session.saveHiScore();
          sm.set(STATE.GAMEOVER);
        } else {
          nextCard();
        }
      };
    } else {
      if (session.combo >= 2 && session.combo % 3 === 0) audio.combo(session.combo);
      setTimeout(() => {
        if (session.newRulesBanner) {
          cardOffsetX = 0;
          cardReleaseVX = 0;
          stampVisual = null;
          briefingIsStart = false;
          briefingArmDelay = 0.35;
          sm.set(STATE.BRIEFING);
        } else {
          nextCard();
        }
      }, 320);
    }
  }, 220);
}

function nextCard() {
  cardOffsetX = 0;
  cardReleaseVX = 0;
  stampVisual = null;
  session.nextBlueprint();
  sm.set(STATE.PLAYING);
}

function handleTimeout() {
  // Timeout is always wrong. Visual stamp reflects the "wrong" direction
  // (opposite of the correct action) so the card slides off dramatically.
  const bp = session.activeBlueprint;
  const correctAction = bp.violations.length > 0 ? 'reject' : 'approve';
  const wrong = correctAction === 'reject' ? 'approve' : 'reject';
  stampVisual = { type: wrong, alpha: 0 };
  cardReleaseVX = wrong === 'approve' ? 2200 : -2200;
  sm.set(STATE.STAMPING);

  setTimeout(() => {
    if (wrong === 'approve') audio.stampApprove(); else audio.stampReject();
    const result = session.decide('timeout');
    audio.disaster();
    shakeTTL = 0.55;
    sm.set(STATE.DISASTER);
    disasterArmDelay = 0.45;
    pendingAfterDisaster = () => {
      if (result.gameover) {
        session.saveHiScore();
        sm.set(STATE.GAMEOVER);
      } else {
        nextCard();
      }
    };
  }, 220);
}

// ---- game loop ----

let lastTime = performance.now();

function update(dt) {
  pulseT += dt;

  if (sm.is(STATE.PLAYING)) {
    session.tick(dt);
    if (session.timer < 1.5 && session.timer - dt >= Math.floor(session.timer - dt)) {
      const now = performance.now();
      if (now - lastWarnPlayed > 420) {
        audio.timerWarn();
        lastWarnPlayed = now;
      }
    }
    if (session.timer <= 0) {
      handleTimeout();
    }
  }

  if (sm.is(STATE.STAMPING) || sm.is(STATE.DISASTER)) {
    // Fly the card off-screen and fade stamp in.
    cardOffsetX += cardReleaseVX * dt;
    if (stampVisual) stampVisual.alpha = Math.min(1, stampVisual.alpha + dt * 6);
  }

  if (disasterArmDelay > 0) disasterArmDelay -= dt;
  if (briefingArmDelay > 0) briefingArmDelay -= dt;

  if (shakeTTL > 0) {
    shakeTTL -= dt;
    const s = 36 * Math.max(0, shakeTTL / 0.55);
    shakeOffset.x = (Math.random() - 0.5) * s * 2;
    shakeOffset.y = (Math.random() - 0.5) * s * 2;
  } else {
    shakeOffset.x = 0; shakeOffset.y = 0;
  }
}

function render() {
  ctx.save();
  ctx.translate(shakeOffset.x, shakeOffset.y);

  drawBackground(ctx);

  if (sm.is(STATE.MENU)) {
    drawMenu(ctx, session.getHiScore(), pulseT);
  } else if (sm.is(STATE.BRIEFING)) {
    drawBriefing(ctx, session, briefingIsStart, pulseT);
  } else {
    drawTopHUD(ctx, session);
    drawTimerBar(ctx, session);

    const newRuleIds = session.newRulesBanner ? session.newRulesBanner.rules.map(r => r.id) : null;
    drawRulebook(ctx, session, newRuleIds);
    drawSwipeHints(ctx, cardOffsetX);

    drawBlueprintCard(ctx, session.activeBlueprint, cardOffsetX, stampVisual);
    drawNewRulesBanner(ctx, session.newRulesBanner);

    if (sm.is(STATE.DISASTER)) {
      drawDisasterFlash(ctx, session.lastDisaster, disasterArmDelay <= 0, pulseT);
    }

    if (sm.is(STATE.GAMEOVER)) {
      drawGameOver(ctx, session, pulseT);
    }
  }

  ctx.restore();
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!paused) {
    update(dt);
    render();
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame((t) => { lastTime = t; loop(t); });

// Platform (Play Nitzan Games) pause/resume hooks
if (typeof window !== 'undefined' && window.PlaySDK) {
  if (window.PlaySDK.onPause) window.PlaySDK.onPause(() => {
    paused = true;
    audio.muted = true;
    audio.suspend();
  });
  if (window.PlaySDK.onResume) window.PlaySDK.onResume(() => {
    paused = false;
    audio.muted = false;
    audio.resume();
    lastTime = performance.now();
  });
}

// YouTube Playables hooks
window.onAdStart = () => { paused = true; audio.muted = true; audio.suspend(); };
window.onAdEnd   = () => { paused = false; audio.muted = false; audio.resume(); lastTime = performance.now(); };

document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (document.hidden) audio.suspend(); else { audio.resume(); lastTime = performance.now(); }
});

// Screenshot mode — skip menus/briefing and drop straight into gameplay
if (typeof window !== 'undefined' && window.PlaySDK && window.PlaySDK.screenshotMode) {
  session.reset();
  session.nextBlueprint();
  sm.set(STATE.PLAYING);
}
