/**
 * Soundriya Rathore - Intelligent Playful PC Cursor Cat Companion
 * Desktop PC Only | 4-Leg Natural Feline Anatomy | Stalk & Hunt Standoff Distance
 * Studio Headphones Audio Listening | Walks to Soundriya's Photo & Shows Affection
 * UI Platform Exploration & Cat Zoomies | 30s Inactivity Easter Eggs (Rainbow Ramp Walk / Aurora)
 * Zero-Emoji | Pure 60 FPS Hardware-Accelerated
 */

(function () {
  'use strict';

  // Strict PC check: Desktop with fine mouse pointer and widescreen
  const isDesktop = () => {
    return window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 992px)').matches;
  };

  if (!isDesktop()) return;

  // Cat Coordinates & Physics
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let mousePrevX = mouseX;
  let mousePrevY = mouseY;
  let mouseSpeed = 0;
  let catX = mouseX - 90;
  let catY = mouseY + 40;
  let facingLeft = false;
  let frameCount = 0;
  
  // State Machine
  // 'stalk', 'chase', 'sit', 'bat', 'listening', 'walk_to_photo', 'photo_affection',
  // 'perch_button', 'zoomies', 'easter_egg', 'stretch', 'sleep'
  let state = 'sit';
  let stateTimer = 0;
  let lastUserActivity = Date.now();
  let easterEggActive = false;
  let easterEggMode = null; // 'rainbow' or 'aurora'
  let easterEggFrame = 0;

  // Zoomies State Variables
  let zoomieTargets = [];
  let zoomieIndex = 0;

  // UI Target for Exploration
  let currentUiTarget = null;

  // Theme Detection (Dark Theme = Pure White Cat | Light Theme = Midnight Slate Cat)
  const isDarkTheme = () => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  };

  // Audio Playback Detection (Universal for Voice Demos & Videos)
  const isAudioActive = () => {
    const activeDemoCard = document.querySelector('.demo-card.playing');
    if (activeDemoCard) return true;
    const mediaElements = document.querySelectorAll('audio, video');
    for (let i = 0; i < mediaElements.length; i++) {
      const media = mediaElements[i];
      if (!media.paused && !media.ended && media.currentTime > 0) {
        return true;
      }
    }
    return false;
  };

  // Create Main Companion Element
  const catEl = document.createElement('div');
  catEl.id = 'playful-cursor-cat';
  catEl.setAttribute('aria-hidden', 'true');
  catEl.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 74px;
    height: 60px;
    pointer-events: none;
    user-select: none;
    z-index: 9995;
    will-change: transform;
    transform: translate3d(-150px, -150px, 0);
    transition: opacity 0.3s ease;
  `;

  // Inject Theme Styling & Animation Keyframes
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #playful-cursor-cat {
      --cat-coat: #1E293B;
      --cat-coat-far: #0F172A;
      --cat-belly: #F8FAFC;
      --cat-paw: #F8FAFC;
      --cat-paw-stroke: #CBD5E1;
      --cat-outline: transparent;
      --cat-ear-inner: #F472B6;
      --cat-nose: #FB7185;
      --cat-eye-color: #38BDF8;
      --cat-shadow: rgba(0, 15, 40, 0.24);
      --cat-bubble-bg: rgba(255, 255, 255, 0.96);
      --cat-bubble-color: #0066FF;
      --cat-bubble-border: rgba(0, 102, 255, 0.2);
    }
    html[data-theme="dark"] #playful-cursor-cat {
      --cat-coat: #FFFFFF;
      --cat-coat-far: #E2E8F0;
      --cat-belly: #F8FAFC;
      --cat-paw: #FFFFFF;
      --cat-paw-stroke: #CBD5E1;
      --cat-outline: #CBD5E1;
      --cat-ear-inner: #FB7185;
      --cat-nose: #FB7185;
      --cat-eye-color: #00E5FF;
      --cat-shadow: rgba(0, 0, 0, 0.45);
      --cat-bubble-bg: rgba(15, 23, 42, 0.96);
      --cat-bubble-color: #38BDF8;
      --cat-bubble-border: rgba(56, 189, 248, 0.3);
    }
    @keyframes catNoteFloatA {
      0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
      40% { opacity: 1; }
      100% { transform: translate(14px, -26px) scale(1.1); opacity: 0; }
    }
    @keyframes catNoteFloatB {
      0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
      40% { opacity: 1; }
      100% { transform: translate(-12px, -30px) scale(1.15); opacity: 0; }
    }
    .cat-music-note-1 { animation: catNoteFloatA 1.8s infinite ease-out; }
    .cat-music-note-2 { animation: catNoteFloatB 2.1s infinite ease-out 0.7s; }

    /* Easter Egg Overlays */
    #cat-easteregg-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9992;
      opacity: 0;
      transition: opacity 0.8s ease;
    }
    #cat-easteregg-overlay.active {
      opacity: 1;
    }
    @keyframes auroraWave {
      0% { transform: scaleY(1) translateY(0); opacity: 0.75; }
      50% { transform: scaleY(1.15) translateY(-8px); opacity: 0.95; }
      100% { transform: scaleY(1) translateY(0); opacity: 0.75; }
    }
    @keyframes starTwinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.25); }
    }
    .aurora-ribbon {
      animation: auroraWave 6s infinite ease-in-out;
    }
    .easter-star {
      animation: starTwinkle 2.5s infinite ease-in-out;
    }
  `;
  document.head.appendChild(styleEl);

  // SVG Anatomy: 4 Natural Feline Legs, Realistic Joints, Studio Headphones, Facial States
  catEl.innerHTML = `
    <div class="cat-wrapper" style="position: relative; width: 100%; height: 100%; transform-origin: 50% 88%;">
      <!-- Cat Ground Shadow -->
      <div class="cat-shadow" style="position: absolute; bottom: 2px; left: 12px; width: 50px; height: 10px; background: var(--cat-shadow); border-radius: 50%; filter: blur(2px);"></div>
      
      <!-- Primary Vector Cat SVG -->
      <svg class="cat-svg" viewBox="0 0 74 60" width="74" height="60" style="overflow: visible;">
        <defs>
          <filter id="cat-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.16"/>
          </filter>
        </defs>

        <!-- Tail (Pivot at Base x=20, y=35) -->
        <g class="cat-tail-group" style="transform-origin: 20px 35px; transition: transform 0.15s ease-out;">
          <path class="cat-tail" d="M 20 35 C 12 34, 6 24, 10 16 C 12 13, 15 16, 13 20 C 10 24, 12 29, 20 32" 
                fill="none" stroke="var(--cat-coat)" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
        </g>

        <!-- Back Leg Far (Quadruped Leg 1 - Left Rear with Hock Joint) -->
        <g class="cat-leg-back-far" style="transform-origin: 22px 34px;">
          <path d="M 22 33 C 17 38 14 45 16 52 C 17 54.5 21 54.5 22 52 C 23 46 24 40 25 35 Z" fill="var(--cat-coat-far)"/>
          <ellipse cx="18.5" cy="52.5" rx="3.6" ry="2.2" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Back Leg Near (Quadruped Leg 2 - Right Rear with Muscular Haunch) -->
        <g class="cat-leg-back-near" style="transform-origin: 28px 33px;">
          <path d="M 28 32 C 23 37 20 45 22 53 C 23 55 28 55 29 53 C 30 46 31 39 32 34 Z" fill="var(--cat-coat)"/>
          <ellipse cx="25" cy="53.5" rx="4" ry="2.3" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Main Torso (Graceful Feline Spine Contour) -->
        <path class="cat-body" d="M 22 36 C 20 28, 28 22, 38 23 C 46 24, 52 28, 52 35 C 52 43, 44 46, 36 46 C 26 46, 22 42, 22 36 Z" 
              fill="var(--cat-coat)" stroke="var(--cat-outline)" stroke-width="0.5" filter="url(#cat-depth-shadow)"/>

        <!-- Soft Chest Fur Patch -->
        <path class="cat-chest" d="M 40 26 C 45 27, 49 32, 49 38 C 49 44, 44 46, 40 46 C 36 46, 37 38, 38 30 Z" fill="var(--cat-belly)"/>

        <!-- Front Leg Far (Quadruped Leg 3 - Left Front Natural Slender Leg & Carpal Wrist) -->
        <g class="cat-leg-front-far" style="transform-origin: 43px 32px;">
          <path d="M 42 32 C 40 37, 39 44, 40 50 C 40.5 53, 43.5 53, 44 50 C 45 44, 45 37, 46 32 Z" fill="var(--cat-coat-far)"/>
          <ellipse cx="42" cy="51.5" rx="3.3" ry="2.2" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Front Leg Near (Quadruped Leg 4 - Right Front Natural Feline Foreleg) -->
        <g class="cat-leg-front-near" style="transform-origin: 49px 31px; transition: transform 0.12s ease;">
          <path d="M 48 31 C 46 36, 45 44, 47 51 C 47.5 54, 51.5 54, 52 51 C 53 44, 53 36, 54 31 Z" fill="var(--cat-coat)"/>
          <ellipse cx="49.5" cy="52" rx="3.8" ry="2.4" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Soundriya Brand Royal Blue Collar with Golden Bell -->
        <g class="cat-collar-group">
          <path d="M 41 27 Q 48 32 55 25" fill="none" stroke="#0066FF" stroke-width="2.8" stroke-linecap="round"/>
          <circle cx="48" cy="30" r="2.5" fill="#F59E0B" stroke="#D97706" stroke-width="0.5"/>
          <circle cx="48.6" cy="29.4" r="0.8" fill="#FEF3C7"/>
        </g>

        <!-- Head Group (Pivot at Neck Base x=49, y=21) -->
        <g class="cat-head-group" style="transform-origin: 49px 21px; transition: transform 0.18s ease;">
          <!-- Left Ear -->
          <polygon points="39,17 42,4 49,14" fill="var(--cat-coat)"/>
          <polygon points="41,16 43,8 48,14" fill="var(--cat-ear-inner)"/>

          <!-- Right Ear -->
          <polygon points="52,13 58,4 62,17" fill="var(--cat-coat)"/>
          <polygon points="54,14 57,8 60,16" fill="var(--cat-ear-inner)"/>

          <!-- Sweet Feline Head Base -->
          <ellipse cx="50" cy="20" rx="12.5" ry="10.5" fill="var(--cat-coat)" stroke="var(--cat-outline)" stroke-width="0.5" filter="url(#cat-depth-shadow)"/>

          <!-- Whiskers -->
          <g stroke="#94A3B8" stroke-width="0.75" stroke-linecap="round">
            <line x1="42" y1="21" x2="32" y2="19"/>
            <line x1="42" y1="23" x2="31" y2="24"/>
            <line x1="57" y1="21" x2="67" y2="19"/>
            <line x1="57" y1="23" x2="68" y2="24"/>
          </g>

          <!-- Cute Pink Button Nose & Mouth -->
          <polygon points="48.5,22.2 51.5,22.2 50,23.6" fill="var(--cat-nose)"/>
          <path d="M 50 23.6 L 50 24.6 Q 48.5 25.6 47 25 M 50 24.6 Q 51.5 25.6 53 25" 
                fill="none" stroke="#94A3B8" stroke-width="0.9" stroke-linecap="round"/>

          <!-- 1. Normal Watching Eyes -->
          <g class="cat-eyes-normal">
            <ellipse cx="45.5" cy="18" rx="2.5" ry="3.2" fill="var(--cat-eye-color)"/>
            <circle cx="44.7" cy="16.8" r="1.1" fill="#FFFFFF"/>
            <ellipse cx="53.5" cy="18" rx="2.5" ry="3.2" fill="var(--cat-eye-color)"/>
            <circle cx="52.7" cy="16.8" r="1.1" fill="#FFFFFF"/>
          </g>

          <!-- 2. Happy / Listening Eyes (^ ^ Arcs) -->
          <g class="cat-eyes-happy" style="display: none;">
            <path d="M 43 19 Q 45.5 15.5 48 19" fill="none" stroke="#0066FF" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M 51 19 Q 53.5 15.5 56 19" fill="none" stroke="#0066FF" stroke-width="1.8" stroke-linecap="round"/>
          </g>

          <!-- 3. Sleeping / Shut Eyes -->
          <g class="cat-eyes-sleep" style="display: none;">
            <path d="M 43.5 19 Q 45.5 21 47.5 19" fill="none" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M 51.5 19 Q 53.5 21 55.5 19" fill="none" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/>
          </g>

          <!-- 4. Hunting / Stalking Predator Glare -->
          <g class="cat-eyes-hunt" style="display: none;">
            <circle cx="45.5" cy="18" r="3.4" fill="#0284C7"/>
            <circle cx="45.5" cy="18" r="2.2" fill="#0F172A"/>
            <circle cx="44.5" cy="16.8" r="0.8" fill="#FFFFFF"/>
            <circle cx="53.5" cy="18" r="3.4" fill="#0284C7"/>
            <circle cx="53.5" cy="18" r="2.2" fill="#0F172A"/>
            <circle cx="52.5" cy="16.8" r="0.8" fill="#FFFFFF"/>
          </g>

          <!-- 5. Starry Amazed Eyes (For Easter Egg Aurora) -->
          <g class="cat-eyes-starry" style="display: none;">
            <circle cx="45.5" cy="18" r="3.6" fill="#38BDF8"/>
            <polygon points="45.5,15.5 46.2,17.2 48,17.5 46.5,18.8 47,20.5 45.5,19.5 44,20.5 44.5,18.8 43,17.5 44.8,17.2" fill="#FFFFFF"/>
            <circle cx="53.5" cy="18" r="3.6" fill="#38BDF8"/>
            <polygon points="53.5,15.5 54.2,17.2 56,17.5 54.5,18.8 55,20.5 53.5,19.5 52,20.5 52.5,18.8 51,17.5 52.8,17.2" fill="#FFFFFF"/>
          </g>

          <!-- Studio Headphones (Puts on when voice demo or video plays!) -->
          <g class="cat-headphones" style="display: none; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <path d="M 37 17 C 37 4 62 4 62 17" fill="none" stroke="#0B192C" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M 37 17 C 37 4 62 4 62 17" fill="none" stroke="#0066FF" stroke-width="1.6" stroke-linecap="round"/>
            <rect x="35" y="12" width="5.5" height="11" rx="2.75" fill="#0B192C"/>
            <rect x="36" y="13" width="3.5" height="9" rx="1.75" fill="#0066FF"/>
            <circle cx="37.7" cy="17.5" r="1.1" fill="#38BDF8"/>
            <rect x="59" y="12" width="5.5" height="11" rx="2.75" fill="#0B192C"/>
            <rect x="60" y="13" width="3.5" height="9" rx="1.75" fill="#0066FF"/>
            <circle cx="61.7" cy="17.5" r="1.1" fill="#38BDF8"/>
          </g>

          <!-- Floating Vector Music Notes -->
          <g class="cat-music-notes" style="display: none;">
            <g class="cat-music-note-1">
              <path d="M 62 4 L 68 2 L 68 7 M 64 7 A 1.8 1.4 0 1 1 62 5.6 A 1.8 1.4 0 0 1 64 7 Z" fill="#0066FF" stroke="#38BDF8" stroke-width="0.5"/>
            </g>
            <g class="cat-music-note-2">
              <path d="M 34 5 L 30 2 L 30 7 M 32 7 A 1.8 1.4 0 1 1 30 5.6 A 1.8 1.4 0 0 1 32 7 Z" fill="#38BDF8" stroke="#0066FF" stroke-width="0.5"/>
            </g>
          </g>
        </g>
      </svg>

      <!-- Emote Interaction Bubble -->
      <div class="cat-bubble" style="
        position: absolute;
        top: -18px;
        right: -8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.3px;
        color: var(--cat-bubble-color);
        background: var(--cat-bubble-bg);
        border: 1px solid var(--cat-bubble-border);
        padding: 2px 7px;
        border-radius: 9px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.14);
        opacity: 0;
        transform: translateY(4px) scale(0.8);
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: none;
        white-space: nowrap;
      ">:3</div>
    </div>
  `;

  document.body.appendChild(catEl);

  // SVG DOM Element References
  const wrapper = catEl.querySelector('.cat-wrapper');
  const tailGroup = catEl.querySelector('.cat-tail-group');
  const legBackFar = catEl.querySelector('.cat-leg-back-far');
  const legBackNear = catEl.querySelector('.cat-leg-back-near');
  const legFrontFar = catEl.querySelector('.cat-leg-front-far');
  const legFrontNear = catEl.querySelector('.cat-leg-front-near');
  const headGroup = catEl.querySelector('.cat-head-group');
  const eyesNormal = catEl.querySelector('.cat-eyes-normal');
  const eyesHappy = catEl.querySelector('.cat-eyes-happy');
  const eyesSleep = catEl.querySelector('.cat-eyes-sleep');
  const eyesHunt = catEl.querySelector('.cat-eyes-hunt');
  const eyesStarry = catEl.querySelector('.cat-eyes-starry');
  const headphones = catEl.querySelector('.cat-headphones');
  const musicNotes = catEl.querySelector('.cat-music-notes');
  const bubble = catEl.querySelector('.cat-bubble');

  // Eye State Controller
  function setEyes(mode) {
    if (eyesNormal) eyesNormal.style.display = mode === 'normal' ? 'block' : 'none';
    if (eyesHappy) eyesHappy.style.display = mode === 'happy' ? 'block' : 'none';
    if (eyesSleep) eyesSleep.style.display = mode === 'sleep' ? 'block' : 'none';
    if (eyesHunt) eyesHunt.style.display = mode === 'hunt' ? 'block' : 'none';
    if (eyesStarry) eyesStarry.style.display = mode === 'starry' ? 'block' : 'none';
  }

  // Emote Bubble Display
  function showBubble(text, duration = 1200) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0) scale(1)';
    clearTimeout(bubble._timeout);
    bubble._timeout = setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(4px) scale(0.8)';
    }, duration);
  }

  // Activity Tracker (Any action resets idle counter and dismisses easter egg)
  const registerActivity = () => {
    lastUserActivity = Date.now();
    if (easterEggActive) {
      stopEasterEgg();
    }
  };

  window.addEventListener('mousemove', (e) => {
    mousePrevX = mouseX;
    mousePrevY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseSpeed = Math.hypot(mouseX - mousePrevX, mouseY - mousePrevY);
    registerActivity();
  }, { passive: true });

  window.addEventListener('mousedown', registerActivity, { passive: true });
  window.addEventListener('keydown', registerActivity, { passive: true });
  window.addEventListener('scroll', registerActivity, { passive: true });

  // Playful Click Interaction: Jump & Pounce
  window.addEventListener('click', () => {
    registerActivity();
    showBubble(':3', 900);
    if (wrapper) {
      wrapper.style.transition = 'transform 0.16s ease-out';
      wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(-16px) scale(1.12)`;
      setTimeout(() => {
        wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(0) scale(1)`;
        setTimeout(() => {
          wrapper.style.transition = '';
        }, 160);
      }, 160);
    }
  });

  // Find Soundriya's visible photo in current viewport
  function findVisiblePortrait() {
    const candidateSelectors = [
      '.hero-image-card',
      '.about-image-card',
      '.hero-image',
      '.about-image'
    ];
    for (let sel of candidateSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60 && rect.bottom > 60 && rect.left < window.innerWidth && rect.right > 0) {
          return {
            element: el,
            targetX: rect.left + Math.min(50, rect.width * 0.25),
            targetY: rect.bottom - 10
          };
        }
      }
    }
    return null;
  }

  // Find Interactive UI Platform in current viewport (Play button, filter tab, CTA)
  function findVisibleUiPlatform() {
    const selectors = [
      '.demo-play-btn',
      '.audio-tab-btn.active',
      '.audio-tab-btn',
      '.hero-actions .btn-primary',
      '.pill-badge'
    ];
    for (let sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top > 80 && rect.bottom < window.innerHeight - 80 && rect.left > 40 && rect.right < window.innerWidth - 40) {
          return {
            element: el,
            targetX: rect.left + rect.width / 2,
            targetY: rect.top - 15
          };
        }
      }
    }
    return null;
  }

  // =========================================================================
  // Easter Egg System: 30 Seconds Inactivity
  // =========================================================================
  let easterEggOverlay = null;

  function startEasterEgg() {
    if (easterEggActive) return;
    easterEggActive = true;
    easterEggFrame = 0;
    easterEggMode = isDarkTheme() ? 'aurora' : 'rainbow';

    easterEggOverlay = document.createElement('div');
    easterEggOverlay.id = 'cat-easteregg-overlay';

    if (easterEggMode === 'rainbow') {
      // Light Mode: Vibrant Rainbow Runway Across Lower Viewport
      easterEggOverlay.innerHTML = `
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" style="width: 100vw; height: 100vh; position: absolute; bottom: 0; left: 0;">
          <defs>
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FF3B30"/>
              <stop offset="18%" stop-color="#FF9500"/>
              <stop offset="36%" stop-color="#FFCC00"/>
              <stop offset="54%" stop-color="#34C759"/>
              <stop offset="72%" stop-color="#00C7BE"/>
              <stop offset="88%" stop-color="#007AFF"/>
              <stop offset="100%" stop-color="#AF52DE"/>
            </linearGradient>
            <filter id="rainbowGlow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <!-- Glowing Rainbow Arch Runway -->
          <path d="M -50 500 Q 500 240 1050 500" fill="none" stroke="url(#rainbowGrad)" stroke-width="42" stroke-linecap="round" filter="url(#rainbowGlow)" opacity="0.95"/>
          <path d="M -50 500 Q 500 240 1050 500" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
        </svg>
      `;
      showBubble('*strut*', 2000);

    } else {
      // Dark Mode: Dim Page, Aurora Borealis Ribbon Waves & Twinkling Stars
      let starsHtml = '';
      for (let i = 0; i < 28; i++) {
        const sx = Math.random() * 95;
        const sy = Math.random() * 65;
        const sSize = 1.5 + Math.random() * 2.5;
        const sDelay = (Math.random() * 2.5).toFixed(2);
        starsHtml += `<circle class="easter-star" cx="${sx}%" cy="${sy}%" r="${sSize}" fill="#E0F2FE" style="animation-delay: ${sDelay}s;" />`;
      }

      easterEggOverlay.style.background = 'rgba(5, 12, 28, 0.68)';
      easterEggOverlay.style.backdropFilter = 'blur(2px)';
      easterEggOverlay.innerHTML = `
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;">
          <defs>
            <linearGradient id="auroraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(16, 185, 129, 0.6)"/>
              <stop offset="45%" stop-color="rgba(6, 182, 212, 0.8)"/>
              <stop offset="80%" stop-color="rgba(99, 102, 241, 0.6)"/>
              <stop offset="100%" stop-color="rgba(168, 85, 247, 0.4)"/>
            </linearGradient>
            <linearGradient id="auroraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(56, 189, 248, 0.5)"/>
              <stop offset="50%" stop-color="rgba(52, 211, 153, 0.7)"/>
              <stop offset="100%" stop-color="rgba(147, 51, 234, 0.5)"/>
            </linearGradient>
            <filter id="auroraBlur">
              <feGaussianBlur stdDeviation="22"/>
            </filter>
          </defs>
          <!-- Twinkling Stars -->
          ${starsHtml}
          <!-- Rippling Aurora Curtains -->
          <path class="aurora-ribbon" d="M -50 160 Q 250 80 500 170 T 1050 140 L 1050 0 L -50 0 Z" fill="url(#auroraGrad1)" filter="url(#auroraBlur)"/>
          <path class="aurora-ribbon" d="M -50 210 Q 300 120 600 220 T 1050 180 L 1050 0 L -50 0 Z" fill="url(#auroraGrad2)" filter="url(#auroraBlur)" style="animation-duration: 8s; animation-delay: -3s;"/>
        </svg>
      `;
      showBubble('*gasp*', 2500);
    }

    document.body.appendChild(easterEggOverlay);
    requestAnimationFrame(() => {
      if (easterEggOverlay) easterEggOverlay.classList.add('active');
    });
  }

  function stopEasterEgg() {
    if (!easterEggActive) return;
    easterEggActive = false;
    if (easterEggOverlay) {
      easterEggOverlay.classList.remove('active');
      const elToRemove = easterEggOverlay;
      setTimeout(() => {
        if (elToRemove && elToRemove.parentNode) {
          elToRemove.parentNode.removeChild(elToRemove);
        }
      }, 800);
      easterEggOverlay = null;
    }
    state = 'sit';
    setEyes('normal');
  }

  // =========================================================================
  // 60 FPS Intelligent Companion Animation Loop
  // =========================================================================
  function animate() {
    frameCount++;
    const now = Date.now();
    const idleSeconds = (now - lastUserActivity) / 1000;

    // Trigger 30-Second Inactivity Easter Egg
    if (idleSeconds >= 30 && !easterEggActive && !isAudioActive()) {
      startEasterEgg();
    }

    // 1. Audio Playback Priority (Voice Demos & Videos)
    const audioPlaying = isAudioActive();
    if (audioPlaying) {
      if (headphones) headphones.style.display = 'block';
      if (musicNotes) musicNotes.style.display = 'block';
    } else {
      if (headphones) headphones.style.display = 'none';
      if (musicNotes) musicNotes.style.display = 'none';
    }

    // Handle Easter Egg Animation Modes
    if (easterEggActive) {
      easterEggFrame++;

      if (easterEggMode === 'rainbow') {
        // Fashion Ramp Walk Across Rainbow Arc
        // Progress t from 0 to 1 across screen width
        const cycle = (easterEggFrame % 450) / 450;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        
        // Quadratic bezier arc matching SVG path (M -50 500 Q 500 240 1050 500)
        const t = cycle;
        const p0 = { x: 50, y: screenH * 0.78 };
        const p1 = { x: screenW * 0.5, y: screenH * 0.44 };
        const p2 = { x: screenW - 50, y: screenH * 0.78 };

        catX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        catY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        facingLeft = false;

        // Glamour Strutting Gait
        const strut = frameCount * 0.32;
        const stepL = Math.sin(strut);
        const stepR = Math.sin(strut + Math.PI);
        if (legFrontFar) legFrontFar.style.transform = `translateY(${stepL * 5}px) rotate(${stepL * 18}deg)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${stepR * 5}px) rotate(${stepR * 18}deg)`;
        if (legBackFar) legBackFar.style.transform = `translateY(${stepR * 5}px) rotate(${stepR * 16}deg)`;
        if (legBackNear) legBackNear.style.transform = `translateY(${stepL * 5}px) rotate(${stepL * 16}deg)`;

        // Head held high with regal model poise
        if (headGroup) headGroup.style.transform = `rotate(${Math.sin(strut * 0.5) * 4 - 3}deg) translateY(-2px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${-20 + Math.sin(strut * 0.8) * 18}deg)`;

        // Mid-ramp pose pause
        if (cycle > 0.48 && cycle < 0.54) {
          setEyes('happy');
          if (headGroup) headGroup.style.transform = 'rotate(0deg)';
        } else {
          setEyes('normal');
        }

      } else {
        // Dark Mode: Amazed by Aurora Borealis & Starfield
        const targetX = window.innerWidth * 0.5;
        const targetY = window.innerHeight * 0.68;
        catX += (targetX - catX) * 0.05;
        catY += (targetY - catY) * 0.05;

        setEyes('starry');
        // Cat sits back on haunches gazing up at the northern sky
        if (headGroup) headGroup.style.transform = `rotate(-14deg) translateY(-4px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.06) * 12}deg)`;
        
        // Gentle paw batting at floating star
        const pawReach = Math.sin(frameCount * 0.08);
        if (legFrontNear) legFrontNear.style.transform = `translate(4px, -${Math.max(0, pawReach * 9)}px) rotate(-16deg)`;
      }

      catEl.style.transform = `translate3d(${catX - 37}px, ${catY - 45}px, 0)`;
      if (wrapper) wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
      requestAnimationFrame(animate);
      return;
    }

    // =========================================================================
    // Standard Interactive States (Hunting, Music, Photo, Exploration, Zoomies)
    // =========================================================================

    // Target Calculation with Respectful Hunting Standoff Perimeter (NEVER under mouse)
    let targetX = mouseX;
    let targetY = mouseY;

    // Determine hunting standoff offset (75px to 110px away from pointer)
    const cursorVectorX = mouseX - catX;
    const cursorVectorY = mouseY - catY;
    const cursorDist = Math.hypot(cursorVectorX, cursorVectorY);

    // Prevent cat from ever going under or too close to mouse cursor (< 65px buffer)
    if (cursorDist < 65 && !isAudioActive() && state !== 'zoomies') {
      // Repel backwards away from mouse cursor
      catX -= (cursorVectorX / (cursorDist || 1)) * 10;
      catY -= (cursorVectorY / (cursorDist || 1)) * 10;
    }

    // Audio Listening Mode: Cat puts on headphones & grooves
    if (audioPlaying) {
      state = 'listening';
      setEyes('happy');

      // Position comfortably to the side of the cursor
      targetX = mouseX + (catX > mouseX ? 85 : -85);
      targetY = mouseY + 30;

      const beat = Math.sin(frameCount * 0.16);
      if (headGroup) headGroup.style.transform = `translateY(${beat * 3}px) rotate(${beat * 3.5}deg)`;
      if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.12) * 16}deg)`;
      if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.max(0, -beat * 2.5)}px)`;

      catX += (targetX - catX) * 0.08;
      catY += (targetY - catY) * 0.08;
      facingLeft = targetX < catX;

    } else if (state === 'zoomies') {
      // =======================================================================
      // Cat Zoomies: Frantic high-speed sprint across the screen!
      // =======================================================================
      const curTarget = zoomieTargets[zoomieIndex];
      if (curTarget) {
        const zdx = curTarget.x - catX;
        const zdy = curTarget.y - catY;
        const zDist = Math.hypot(zdx, zdy);

        facingLeft = zdx < 0;
        setEyes('hunt');

        // Super-speed sprint (24px/frame)
        const zSpeed = Math.min(24, Math.max(8, zDist * 0.18));
        catX += (zdx / zDist) * zSpeed;
        catY += (zdy / zDist) * zSpeed;

        // Hyper quadruped sprint cycle
        const zStride = frameCount * 0.7;
        if (legFrontFar) legFrontFar.style.transform = `translateY(${Math.sin(zStride) * 6}px) rotate(22deg)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(zStride + Math.PI) * 6}px) rotate(-22deg)`;
        if (legBackFar) legBackFar.style.transform = `translateY(${Math.sin(zStride + 1) * 6}px) rotate(20deg)`;
        if (legBackNear) legBackNear.style.transform = `translateY(${Math.sin(zStride + 1 + Math.PI) * 6}px) rotate(-20deg)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(zStride * 0.9) * 32}deg)`;

        if (zDist < 35) {
          zoomieIndex++;
          if (zoomieIndex >= zoomieTargets.length) {
            // Zoomies complete! Skid-stop and pant calmly
            state = 'sit';
            setEyes('normal');
            showBubble(':3', 1000);
          }
        }
      } else {
        state = 'sit';
      }

    } else if (idleSeconds > 4 && idleSeconds < 14) {
      // =======================================================================
      // Idle Action 1: Walk over to Soundriya's Photo & Show Affection!
      // =======================================================================
      const portrait = findVisiblePortrait();
      if (portrait) {
        state = 'walk_to_photo';
        const pDx = portrait.targetX - catX;
        const pDy = portrait.targetY - catY;
        const pDist = Math.hypot(pDx, pDy);

        if (pDist > 25) {
          // Walk step-by-step toward Soundriya's photo
          facingLeft = pDx < 0;
          setEyes('normal');
          const walkSpeed = Math.min(7, Math.max(3, pDist * 0.08));
          catX += (pDx / pDist) * walkSpeed;
          catY += (pDy / pDist) * walkSpeed;

          // Natural walking gait
          const walkStride = frameCount * 0.35;
          if (legFrontFar) legFrontFar.style.transform = `translateY(${Math.sin(walkStride) * 3}px)`;
          if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(walkStride + Math.PI) * 3}px)`;
          if (legBackFar) legBackFar.style.transform = `translateY(${Math.sin(walkStride + 0.8) * 3}px)`;
          if (legBackNear) legBackNear.style.transform = `translateY(${Math.sin(walkStride + 0.8 + Math.PI) * 3}px)`;

        } else {
          // Arrived at Soundriya's photo: cheek rubbing & affectionate purr
          state = 'photo_affection';
          setEyes('happy');
          const rub = Math.sin(frameCount * 0.08);
          if (wrapper) {
            wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${rub * 6}deg) translateY(${Math.abs(rub) * 2}px)`;
          }
          if (tailGroup) tailGroup.style.transform = `rotate(${-28 + rub * 12}deg)`;
          if (frameCount % 180 === 0) {
            showBubble('*purr*', 1400);
          }
        }
      } else {
        // No photo in view: explore interactive UI platform (e.g., voice demo play button)
        const uiPlatform = findVisibleUiPlatform();
        if (uiPlatform) {
          state = 'perch_button';
          const uDx = uiPlatform.targetX - catX;
          const uDy = uiPlatform.targetY - catY;
          const uDist = Math.hypot(uDx, uDy);

          if (uDist > 20) {
            facingLeft = uDx < 0;
            const uSpeed = Math.min(6, Math.max(2.5, uDist * 0.07));
            catX += (uDx / uDist) * uSpeed;
            catY += (uDy / uDist) * uSpeed;

            const uStride = frameCount * 0.35;
            if (legFrontFar) legFrontFar.style.transform = `translateY(${Math.sin(uStride) * 3}px)`;
            if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(uStride + Math.PI) * 3}px)`;
            if (legBackFar) legBackFar.style.transform = `translateY(${Math.sin(uStride + 0.8) * 3}px)`;
            if (legBackNear) legBackNear.style.transform = `translateY(${Math.sin(uStride + 0.8 + Math.PI) * 3}px)`;
          } else {
            // Perch atop button & pat lightly
            setEyes('normal');
            if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.08) * 10}deg)`;
            if (frameCount % 160 === 0) {
              // Cute paw tap on the button
              if (legFrontNear) legFrontNear.style.transform = 'translateY(4px)';
              setTimeout(() => {
                if (legFrontNear) legFrontNear.style.transform = '';
              }, 180);
              showBubble(':3', 800);
            }
          }
        }
      }

    } else if (idleSeconds > 14 && idleSeconds < 29) {
      // Trigger Cat Zoomies occasionally during prolonged idle
      if (state !== 'zoomies' && Math.random() < 0.015) {
        state = 'zoomies';
        zoomieIndex = 0;
        zoomieTargets = [
          { x: window.innerWidth * 0.15, y: window.innerHeight * 0.35 },
          { x: window.innerWidth * 0.85, y: window.innerHeight * 0.65 },
          { x: window.innerWidth * 0.45, y: window.innerHeight * 0.25 },
          { x: mouseX + 90, y: mouseY + 30 }
        ];
        showBubble('*zoomies!*', 1200);
      } else if (state !== 'zoomies') {
        // Sleep peacefully with zZz
        state = 'sleep';
        setEyes('sleep');
        if (tailGroup) tailGroup.style.transform = 'rotate(-10deg)';
        if (frameCount % 170 === 0) {
          showBubble('zZz', 1600);
        }
      }

    } else {
      // =======================================================================
      // Active Hunting Mode: Stalking & Chasing the Mouse Cursor
      // =======================================================================
      // Standoff position: Stay 80px behind or to the flank of mouse motion
      const flankAngle = Math.atan2(catY - mouseY, catX - mouseX);
      const safeDistance = 85;
      targetX = mouseX + Math.cos(flankAngle) * safeDistance;
      targetY = mouseY + Math.sin(flankAngle) * safeDistance;

      // Keep slightly below mouse plane
      if (targetY < mouseY + 15) {
        targetY = mouseY + 25;
      }

      const dx = targetX - catX;
      const dy = targetY - catY;
      const distToStandoff = Math.hypot(dx, dy);

      // Stalking Butt-Wiggle before pounce
      if (cursorDist > 220 && state === 'sit') {
        state = 'stalk';
        stateTimer = 16;
        setEyes('hunt');
        showBubble('!', 500);
      }

      if (state === 'stalk' && stateTimer > 0) {
        stateTimer--;
        const wiggle = Math.sin(frameCount * 0.8) * 6;
        if (tailGroup) tailGroup.style.transform = `rotate(${wiggle * 3}deg)`;
        if (wrapper) wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(5px) scaleY(0.88)`;
        if (legBackNear) legBackNear.style.transform = `translateX(${wiggle * 0.6}px)`;
        if (legBackFar) legBackFar.style.transform = `translateX(${-wiggle * 0.6}px)`;

      } else if (distToStandoff > 18) {
        // Chase & Hunt towards the standoff perimeter
        state = 'chase';
        setEyes(cursorDist > 140 ? 'hunt' : 'normal');

        const chaseSpeed = Math.min(Math.max(distToStandoff * 0.14, 4), 16);
        catX += (dx / distToStandoff) * chaseSpeed;
        catY += (dy / distToStandoff) * chaseSpeed;
        facingLeft = mouseX < catX;

        // Quadruped Gallop Gait
        const stride = frameCount * 0.44;
        const frontStepL = Math.sin(stride);
        const frontStepR = Math.sin(stride + Math.PI);
        const backStepL = Math.sin(stride + 0.8);
        const backStepR = Math.sin(stride + 0.8 + Math.PI);

        if (legFrontFar) legFrontFar.style.transform = `translateY(${frontStepL * 4}px) rotate(${frontStepL * 14}deg)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${frontStepR * 4}px) rotate(${frontStepR * 14}deg)`;
        if (legBackFar) legBackFar.style.transform = `translateY(${backStepL * 4}px) rotate(${backStepL * 16}deg)`;
        if (legBackNear) legBackNear.style.transform = `translateY(${backStepR * 4}px) rotate(${backStepR * 16}deg)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(stride * 0.7) * 22}deg)`;
        if (headGroup) headGroup.style.transform = `rotate(${facingLeft ? -4 : 4}deg) translateY(-1px)`;

      } else {
        // At hunting perimeter: Crouch & watch cursor
        state = 'sit';
        facingLeft = mouseX < catX;
        setEyes('normal');

        // Reset leg transforms
        if (legFrontFar) legFrontFar.style.transform = '';
        if (legFrontNear) legFrontNear.style.transform = '';
        if (legBackFar) legBackFar.style.transform = '';
        if (legBackNear) legBackNear.style.transform = '';
        if (headGroup) headGroup.style.transform = '';
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.08) * 12}deg)`;

        // Occasional playful batting at distance
        if (mouseSpeed > 5 && Math.random() < 0.04) {
          if (legFrontNear) legFrontNear.style.transform = 'translate(4px, -6px) rotate(-16deg)';
          setTimeout(() => {
            if (legFrontNear) legFrontNear.style.transform = '';
          }, 140);
        }

        // Periodic blink
        if (frameCount % 200 > 192) {
          setEyes('sleep');
        }
      }
    }

    // Apply Position & Orientation
    catEl.style.transform = `translate3d(${catX - 37}px, ${catY - 45}px, 0)`;
    if (wrapper && state !== 'photo_affection' && state !== 'stalk') {
      wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }

    requestAnimationFrame(animate);
  }

  // Start Animation Loop
  requestAnimationFrame(animate);

  // Responsive Screen Check
  window.addEventListener('resize', () => {
    if (!isDesktop()) {
      catEl.style.display = 'none';
      if (easterEggActive) stopEasterEgg();
    } else {
      catEl.style.display = 'block';
    }
  });

})();
