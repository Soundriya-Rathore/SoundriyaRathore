/**
 * Soundriya Rathore - Intelligent Playful PC Cursor Cat Companion
 * Desktop PC Only | Natural 4-Leg Feline Anatomy | Relaxed Hunting Standoff
 * Random Playful Engine: Dancing, Singing/Meow, Tail Chase, Yawn & Loaf, Pacing, Biscuits
 * Full Screen-Edge Traversal (Enters One Side & Exits Other Above Taskbar)
 * 1-Minute Easter Eggs: Dimmed 7-Band Rainbow with Slow Runway Strut | Aurora Borealis with Luminous Crescent Moon
 * 3-Minute Grand Easter Egg: SPIDER-CAT Web-Swinging across Top Navigation Bar shouting "WEB!" and "THWIP!"
 * Zero-Emoji | Pure Hardware-Accelerated 60 FPS
 */

(function () {
  'use strict';

  // Strict PC check: Desktop with fine mouse pointer and widescreen
  const isDesktop = () => {
    return window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 992px)').matches;
  };

  if (!isDesktop()) return;

  // Cat Coordinates & Smoothed Physics
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let catX = mouseX - 100;
  let catY = mouseY + 35;
  let facingLeft = false;
  let frameCount = 0;

  // State Machine: 'sit', 'stalk', 'chase', 'listening', 'walk_to_photo', 'photo_affection',
  // 'knead_biscuits', 'edge_stroll', 'dance', 'sing_meow', 'chase_tail', 'yawn_loaf', 'sleep',
  // 'easter_egg' (1-min rainbow/aurora), 'spider_cat' (3-min web-swinging)
  let state = 'sit';
  let stateTimer = 0;
  let lastUserActivity = Date.now();
  const EASTER_EGG_TIMEOUT_MS = 60000;   // 1 Minute (60s)
  const SPIDER_CAT_TIMEOUT_MS = 180000;  // 3 Minutes (180s)
  
  let easterEggActive = false;
  let easterEggMode = null; // 'rainbow' or 'aurora'
  let easterEggFrame = 0;

  // Spider-Cat State
  let spiderCatActive = false;
  let spiderFrame = 0;
  let spiderSwingIndex = 0;
  let spiderAnchorX = window.innerWidth * 0.35;
  const spiderAnchorY = 24; // Top Navigation Bar anchor level

  // Screen Edge Stroll State (Full screen traversal from off-screen to off-screen)
  let edgeDirection = 1; // 1 = Left to Right, -1 = Right to Left
  let edgeActive = false;

  // Tail Chase Angle
  let spinAngle = 0;

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

  // Create Companion Root Container
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

  // Create Fixed Spider-Man Web SVG Overlay
  const spiderWebSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  spiderWebSvg.id = 'cat-spider-web-overlay';
  spiderWebSvg.setAttribute('aria-hidden', 'true');
  spiderWebSvg.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9993;
    overflow: visible;
    display: none;
  `;
  spiderWebSvg.innerHTML = `
    <defs>
      <filter id="webSoftGlow">
        <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#FFFFFF" flood-opacity="0.95"/>
      </filter>
    </defs>
    <!-- Web Line from Navbar to Cat -->
    <line id="spider-web-line" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" filter="url(#webSoftGlow)"/>
    <!-- Sticky Web Burst / Splat on Navigation Bar -->
    <g id="spider-web-splat">
      <circle cx="0" cy="0" r="7" fill="#FFFFFF" opacity="0.95" filter="url(#webSoftGlow)"/>
      <path d="M 0 0 L -14 -6 M 0 0 L -9 -13 M 0 0 L 9 -13 M 0 0 L 14 -6 M 0 0 L 16 5 M 0 0 L 9 13 M 0 0 L -9 13 M 0 0 L -16 5" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="11" fill="none" stroke="#FFFFFF" stroke-width="0.8" opacity="0.75"/>
    </g>
  `;
  document.body.appendChild(spiderWebSvg);

  const webLine = spiderWebSvg.querySelector('#spider-web-line');
  const webSplat = spiderWebSvg.querySelector('#spider-web-splat');

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

    /* 1-Minute Easter Egg Overlays */
    #cat-easteregg-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9992;
      opacity: 0;
      transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #cat-easteregg-overlay.active {
      opacity: 1;
    }

    /* Aurora Waves, Stars & Moon Glow */
    @keyframes auroraWave1 {
      0%, 100% { transform: scaleY(1) translateY(0) rotate(0deg); opacity: 0.7; }
      50% { transform: scaleY(1.22) translateY(-12px) rotate(1deg); opacity: 0.95; }
    }
    @keyframes auroraWave2 {
      0%, 100% { transform: scaleY(1.15) translateY(-8px) rotate(-1deg); opacity: 0.85; }
      50% { transform: scaleY(0.95) translateY(4px) rotate(0.5deg); opacity: 0.65; }
    }
    @keyframes shootingStarAnim {
      0% { transform: translate(0, 0) scale(1); opacity: 0; }
      5% { opacity: 1; }
      28% { transform: translate(-280px, 150px) scale(0.8); opacity: 0; }
      100% { transform: translate(-280px, 150px) scale(0.8); opacity: 0; }
    }
    @keyframes starPulseSlow {
      0%, 100% { opacity: 0.35; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1.3); }
    }
    @keyframes moonGlowPulse {
      0%, 100% { opacity: 0.75; transform: scale(1); }
      50% { opacity: 0.95; transform: scale(1.04); }
    }

    .aurora-ribbon-1 { animation: auroraWave1 9s infinite ease-in-out; }
    .aurora-ribbon-2 { animation: auroraWave2 12s infinite ease-in-out -4s; }
    .shooting-star-group { animation: shootingStarAnim 7.5s infinite ease-in 2.5s; }
    .easter-star-twinkle { animation: starPulseSlow 3s infinite ease-in-out; }
    .easter-moon-glow { animation: moonGlowPulse 5s infinite ease-in-out; }
  `;
  document.head.appendChild(styleEl);

  // SVG Anatomy: 4 Natural Feline Legs, Realistic Joints, Studio Headphones, Facial States, Spider-Cat Suit
  catEl.innerHTML = `
    <div class="cat-wrapper" style="position: relative; width: 100%; height: 100%; transform-origin: 50% 88%;">
      <!-- Ground Shadow -->
      <div class="cat-shadow" style="position: absolute; bottom: 2px; left: 12px; width: 50px; height: 10px; background: var(--cat-shadow); border-radius: 50%; filter: blur(2px);"></div>
      
      <!-- Primary Vector Cat SVG -->
      <svg class="cat-svg" viewBox="0 0 74 60" width="74" height="60" style="overflow: visible;">
        <defs>
          <filter id="cat-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.16"/>
          </filter>
        </defs>

        <!-- Tail (Pivot at Base x=20, y=35) -->
        <g class="cat-tail-group" style="transform-origin: 20px 35px; transition: transform 0.18s ease-out;">
          <path class="cat-tail" d="M 20 35 C 12 34, 6 24, 10 16 C 12 13, 15 16, 13 20 C 10 24, 12 29, 20 32" 
                fill="none" stroke="var(--cat-coat)" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
        </g>

        <!-- Back Leg Far (Quadruped Leg 1 - Left Rear with Hock Joint) -->
        <g class="cat-leg-back-far" style="transform-origin: 22px 34px; transition: transform 0.15s ease;">
          <path d="M 22 33 C 17 38 14 45 16 52 C 17 54.5 21 54.5 22 52 C 23 46 24 40 25 35 Z" fill="var(--cat-coat-far)"/>
          <ellipse cx="18.5" cy="52.5" rx="3.6" ry="2.2" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Back Leg Near (Quadruped Leg 2 - Right Rear with Muscular Haunch) -->
        <g class="cat-leg-back-near" style="transform-origin: 28px 33px; transition: transform 0.15s ease;">
          <path d="M 28 32 C 23 37 20 45 22 53 C 23 55 28 55 29 53 C 30 46 31 39 32 34 Z" fill="var(--cat-coat)"/>
          <ellipse cx="25" cy="53.5" rx="4" ry="2.3" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Main Torso (Graceful Feline Spine Contour) -->
        <path class="cat-body" d="M 22 36 C 20 28, 28 22, 38 23 C 46 24, 52 28, 52 35 C 52 43, 44 46, 36 46 C 26 46, 22 42, 22 36 Z" 
              fill="var(--cat-coat)" stroke="var(--cat-outline)" stroke-width="0.5" filter="url(#cat-depth-shadow)"/>

        <!-- Soft Chest Fur Patch -->
        <path class="cat-chest" d="M 40 26 C 45 27, 49 32, 49 38 C 49 44, 44 46, 40 46 C 36 46, 37 38, 38 30 Z" fill="var(--cat-belly)"/>

        <!-- Front Leg Far (Quadruped Leg 3 - Left Front Natural Slender Leg & Carpal Wrist) -->
        <g class="cat-leg-front-far" style="transform-origin: 43px 32px; transition: transform 0.15s ease;">
          <path d="M 42 32 C 40 37, 39 44, 40 50 C 40.5 53, 43.5 53, 44 50 C 45 44, 45 37, 46 32 Z" fill="var(--cat-coat-far)"/>
          <ellipse cx="42" cy="51.5" rx="3.3" ry="2.2" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Front Leg Near (Quadruped Leg 4 - Right Front Natural Foreleg) -->
        <g class="cat-leg-front-near" style="transform-origin: 49px 31px; transition: transform 0.15s ease;">
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
        <g class="cat-head-group" style="transform-origin: 49px 21px; transition: transform 0.2s ease;">
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

          <!-- Button Nose -->
          <polygon points="48.5,22.2 51.5,22.2 50,23.6" fill="var(--cat-nose)"/>

          <!-- Mouth Closed (Default) -->
          <path class="cat-mouth-closed" d="M 50 23.6 L 50 24.6 Q 48.5 25.6 47 25 M 50 24.6 Q 51.5 25.6 53 25" 
                fill="none" stroke="#94A3B8" stroke-width="0.9" stroke-linecap="round"/>

          <!-- Mouth Open (For Singing / Meowing / Yawning) -->
          <g class="cat-mouth-open" style="display: none;">
            <ellipse cx="50" cy="25.5" rx="2.5" ry="2.2" fill="#FB7185"/>
            <path d="M 47.5 24.5 Q 50 23.5 52.5 24.5" fill="none" stroke="#94A3B8" stroke-width="0.8"/>
          </g>

          <!-- 1. Normal Watching Eyes -->
          <g class="cat-eyes-normal">
            <ellipse cx="45.5" cy="18" rx="2.5" ry="3.2" fill="var(--cat-eye-color)"/>
            <circle cx="44.7" cy="16.8" r="1.1" fill="#FFFFFF"/>
            <ellipse cx="53.5" cy="18" rx="2.5" ry="3.2" fill="var(--cat-eye-color)"/>
            <circle cx="52.7" cy="16.8" r="1.1" fill="#FFFFFF"/>
          </g>

          <!-- 2. Happy / Listening / Biscuit-Kneading Eyes (^ ^ Arcs) -->
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

        <!-- ===================================================================
             SPIDER-CAT SUIT OVERLAY (Transforms after 3 Minutes!)
             =================================================================== -->
        <g class="cat-spiderman-suit" style="display: none;">
          <!-- Blue Flanks Body Suit -->
          <path d="M 22 36 C 20 28, 28 22, 38 23 C 46 24, 52 28, 52 35 C 52 43, 44 46, 36 46 C 26 46, 22 42, 22 36 Z" fill="#1D4ED8"/>
          <!-- Red Center Chest & Spine Section -->
          <path d="M 32 23 C 40 23, 48 27, 48 35 C 48 43, 40 46, 34 45 C 38 41, 38 28, 32 23 Z" fill="#EF4444"/>
          <!-- Spider Web Grid on Red Body -->
          <path d="M 35 24 L 46 43 M 43 24 L 35 43 M 34 32 Q 40 33 46 32 M 34 38 Q 40 39 46 38" fill="none" stroke="#0F172A" stroke-width="0.6"/>
          <!-- Spider Emblem on Chest -->
          <g transform="translate(41, 33)">
            <ellipse cx="0" cy="0" rx="1.5" ry="2" fill="#0F172A"/>
            <circle cx="0" cy="-2.2" r="1" fill="#0F172A"/>
            <path d="M -1 -1 Q -3 -3 -4 -5 M -1 0 Q -4 0 -5 2 M -1 1 Q -4 2 -3 5 M 1 -1 Q 3 -3 4 -5 M 1 0 Q 4 0 5 2 M 1 1 Q 4 2 3 5" fill="none" stroke="#0F172A" stroke-width="0.65"/>
          </g>

          <!-- Red Gloves on Front Paws -->
          <ellipse cx="42" cy="51.5" rx="3.5" ry="2.3" fill="#EF4444" stroke="#DC2626" stroke-width="0.5"/>
          <ellipse cx="49.5" cy="52" rx="4" ry="2.5" fill="#EF4444" stroke="#DC2626" stroke-width="0.5"/>
          <!-- Red Boots on Rear Paws -->
          <ellipse cx="18.5" cy="52.5" rx="3.8" ry="2.3" fill="#EF4444" stroke="#DC2626" stroke-width="0.5"/>
          <ellipse cx="25" cy="53.5" rx="4.2" ry="2.4" fill="#EF4444" stroke="#DC2626" stroke-width="0.5"/>

          <!-- Red Spider-Cat Mask & Hood -->
          <polygon points="39,17 42,4 49,14" fill="#EF4444"/>
          <polygon points="52,13 58,4 62,17" fill="#EF4444"/>
          <ellipse cx="50" cy="20" rx="12.5" ry="10.5" fill="#EF4444" filter="url(#cat-depth-shadow)"/>

          <!-- Black Spider Web Grid on Mask -->
          <path d="M 50 20 L 50 9.5 M 50 20 L 42 10.5 M 50 20 L 58 10.5 M 50 20 L 37.5 20 M 50 20 L 62.5 20 M 50 20 L 43 28 M 50 20 L 57 28" stroke="#0F172A" stroke-width="0.75" stroke-linecap="round"/>
          <path d="M 45 13 Q 50 11 55 13 M 42 16 Q 50 14 58 16 M 44 24 Q 50 26 56 24" fill="none" stroke="#0F172A" stroke-width="0.75"/>

          <!-- Iconic White Curved Triangular Spider-Man Eye Lenses -->
          <path d="M 41 15 C 45 14, 47 18, 47 21 C 44 22, 39 20, 41 15 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
          <path d="M 59 15 C 55 14, 53 18, 53 21 C 56 22, 61 20, 59 15 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>
        </g>
      </svg>

      <!-- Comic / Emote Interaction Bubble -->
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
  const mouthClosed = catEl.querySelector('.cat-mouth-closed');
  const mouthOpen = catEl.querySelector('.cat-mouth-open');
  const eyesNormal = catEl.querySelector('.cat-eyes-normal');
  const eyesHappy = catEl.querySelector('.cat-eyes-happy');
  const eyesSleep = catEl.querySelector('.cat-eyes-sleep');
  const eyesHunt = catEl.querySelector('.cat-eyes-hunt');
  const eyesStarry = catEl.querySelector('.cat-eyes-starry');
  const headphones = catEl.querySelector('.cat-headphones');
  const musicNotes = catEl.querySelector('.cat-music-notes');
  const spidermanSuit = catEl.querySelector('.cat-spiderman-suit');
  const bubble = catEl.querySelector('.cat-bubble');

  // Eye State Controller
  function setEyes(mode) {
    if (eyesNormal) eyesNormal.style.display = mode === 'normal' ? 'block' : 'none';
    if (eyesHappy) eyesHappy.style.display = mode === 'happy' ? 'block' : 'none';
    if (eyesSleep) eyesSleep.style.display = mode === 'sleep' ? 'block' : 'none';
    if (eyesHunt) eyesHunt.style.display = mode === 'hunt' ? 'block' : 'none';
    if (eyesStarry) eyesStarry.style.display = mode === 'starry' ? 'block' : 'none';
  }

  // Mouth State Controller
  function setMouth(isOpen) {
    if (mouthClosed) mouthClosed.style.display = isOpen ? 'none' : 'block';
    if (mouthOpen) mouthOpen.style.display = isOpen ? 'block' : 'none';
  }

  // Bubble Messenger
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

  // User Activity Tracker (Resets idle timers & dismisses active Easter eggs gracefully)
  const registerActivity = () => {
    lastUserActivity = Date.now();
    if (easterEggActive) {
      stopEasterEgg();
    }
    if (spiderCatActive) {
      stopSpiderCat();
    }
  };

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    registerActivity();
  }, { passive: true });

  window.addEventListener('mousedown', registerActivity, { passive: true });
  window.addEventListener('keydown', registerActivity, { passive: true });
  window.addEventListener('scroll', registerActivity, { passive: true });

  // Playful Click Hop
  window.addEventListener('click', () => {
    registerActivity();
    showBubble(':3', 900);
    if (wrapper) {
      wrapper.style.transition = 'transform 0.16s ease-out';
      wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(-14px) scale(1.1)`;
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

  // =========================================================================
  // Easter Egg System: 1 Minute Inactivity (60,000ms)
  // =========================================================================
  let easterEggOverlay = null;

  function startEasterEgg() {
    if (easterEggActive || spiderCatActive) return;
    easterEggActive = true;
    easterEggFrame = 0;
    easterEggMode = isDarkTheme() ? 'aurora' : 'rainbow';

    easterEggOverlay = document.createElement('div');
    easterEggOverlay.id = 'cat-easteregg-overlay';

    if (easterEggMode === 'rainbow') {
      // Light Mode: Authentic 7-Band Concentric Rainbow Arc with DIMMED Backdrop
      easterEggOverlay.style.background = 'rgba(15, 23, 42, 0.44)';
      easterEggOverlay.style.backdropFilter = 'blur(2px)';
      easterEggOverlay.innerHTML = `
        <svg viewBox="0 0 1200 700" preserveAspectRatio="none" style="width: 100vw; height: 100vh; position: absolute; bottom: 0; left: 0;">
          <defs>
            <filter id="rainbowSoftGlow">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- 7 Concentric Rainbow Ribbon Bands (7px width each, total 49px) -->
          <g filter="url(#rainbowSoftGlow)" opacity="0.96">
            <path d="M -80 620 Q 600 240 1280 620" fill="none" stroke="#FF2D55" stroke-width="7" stroke-linecap="round"/>
            <path d="M -80 627 Q 600 247 1280 627" fill="none" stroke="#FF9500" stroke-width="7" stroke-linecap="round"/>
            <path d="M -80 634 Q 600 254 1280 634" fill="none" stroke="#FFCC00" stroke-width="7" stroke-linecap="round"/>
            <path d="M -80 641 Q 600 261 1280 641" fill="none" stroke="#34C759" stroke-width="7" stroke-linecap="round"/>
            <path d="M -80 648 Q 600 268 1280 648" fill="none" stroke="#00C7BE" stroke-width="7" stroke-linecap="round"/>
            <path d="M -80 655 Q 600 275 1280 655" fill="none" stroke="#007AFF" stroke-width="7" stroke-linecap="round"/>
            <path d="M -80 662 Q 600 282 1280 662" fill="none" stroke="#AF52DE" stroke-width="7" stroke-linecap="round"/>
          </g>

          <!-- Cloud Base Puffs Left -->
          <g fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0 4px 14px rgba(0,0,0,0.12))">
            <circle cx="80" cy="590" r="50"/>
            <circle cx="140" cy="610" r="45"/>
            <circle cx="40" cy="625" r="40"/>
          </g>

          <!-- Cloud Base Puffs Right -->
          <g fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0 4px 14px rgba(0,0,0,0.12))">
            <circle cx="1120" cy="590" r="50"/>
            <circle cx="1060" cy="610" r="45"/>
            <circle cx="1160" cy="625" r="40"/>
          </g>
        </svg>
      `;
      showBubble('*strut*', 2600);

    } else {
      // Dark Mode: Dim Atmosphere, Aurora Curtains, LUMINOUS CRESCENT MOON & Starfield
      let starsSvg = '';
      for (let i = 0; i < 35; i++) {
        const sx = (Math.random() * 96).toFixed(1);
        const sy = (Math.random() * 62).toFixed(1);
        const sSize = (0.7 + Math.random() * 1.3).toFixed(1);
        const sDelay = (Math.random() * 3).toFixed(1);
        starsSvg += `<circle class="easter-star-twinkle" cx="${sx}%" cy="${sy}%" r="${sSize}" fill="#E0F2FE" style="animation-delay: ${sDelay}s;" />`;
      }
      const brightStars = [
        { x: 380, y: 80 }, { x: 620, y: 120 }, { x: 880, y: 70 }, { x: 1060, y: 130 }
      ];
      for (let bs of brightStars) {
        starsSvg += `
          <g transform="translate(${bs.x}, ${bs.y})" class="easter-star-twinkle">
            <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#FFFFFF" opacity="0.95"/>
            <circle cx="0" cy="0" r="2.5" fill="#38BDF8"/>
          </g>
        `;
      }

      easterEggOverlay.style.background = 'rgba(4, 9, 22, 0.74)';
      easterEggOverlay.style.backdropFilter = 'blur(2px)';
      easterEggOverlay.innerHTML = `
        <svg viewBox="0 0 1200 700" preserveAspectRatio="none" style="width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;">
          <defs>
            <linearGradient id="auroraGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(16, 185, 129, 0.75)"/>
              <stop offset="45%" stop-color="rgba(6, 182, 212, 0.65)"/>
              <stop offset="100%" stop-color="rgba(6, 182, 212, 0)"/>
            </linearGradient>
            <linearGradient id="auroraViolet" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(168, 85, 247, 0.7)"/>
              <stop offset="50%" stop-color="rgba(56, 189, 248, 0.6)"/>
              <stop offset="100%" stop-color="rgba(129, 140, 248, 0)"/>
            </linearGradient>
            <linearGradient id="shootingStarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="60%" stop-color="rgba(56, 189, 248, 0.8)"/>
              <stop offset="100%" stop-color="rgba(56, 189, 248, 0)"/>
            </linearGradient>
            <filter id="auroraCurtainBlur">
              <feGaussianBlur stdDeviation="18"/>
            </filter>
          </defs>

          <!-- Starfield -->
          ${starsSvg}

          <!-- Glowing Crescent Moon with Halo -->
          <g class="easter-moon-group" transform="translate(180, 85)">
            <circle cx="0" cy="0" r="42" fill="rgba(224, 242, 254, 0.22)" filter="url(#auroraCurtainBlur)" class="easter-moon-glow"/>
            <path d="M 0 -24 A 24 24 0 1 0 24 0 A 19 19 0 1 1 0 -24 Z" fill="#F8FAFC" filter="drop-shadow(0 0 14px rgba(255, 255, 255, 0.85))"/>
            <circle cx="-6" cy="2" r="3.2" fill="#E2E8F0" opacity="0.6"/>
            <circle cx="-2" cy="-10" r="2.4" fill="#E2E8F0" opacity="0.5"/>
            <circle cx="2" cy="11" r="2" fill="#E2E8F0" opacity="0.5"/>
          </g>

          <!-- Shooting Star / Meteor -->
          <g class="shooting-star-group" transform="translate(1100, 45)">
            <line x1="0" y1="0" x2="130" y2="-65" stroke="url(#shootingStarGrad)" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="0" cy="0" r="2.8" fill="#FFFFFF"/>
          </g>

          <!-- Layered Ethereal Aurora Borealis Curtains -->
          <path class="aurora-ribbon-1" d="M -60 140 Q 280 60 620 150 T 1260 110 L 1260 0 L -60 0 Z" fill="url(#auroraGreen)" filter="url(#auroraCurtainBlur)"/>
          <path class="aurora-ribbon-2" d="M -60 180 Q 320 90 700 190 T 1260 140 L 1260 0 L -60 0 Z" fill="url(#auroraViolet)" filter="url(#auroraCurtainBlur)"/>
        </svg>
      `;
      showBubble('*gasp*', 2600);
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
      }, 900);
      easterEggOverlay = null;
    }
    state = 'sit';
    setEyes('normal');
    setMouth(false);
  }

  // =========================================================================
  // Grand Easter Egg System: 3 Minutes (180,000ms) - SPIDER-CAT!
  // =========================================================================
  function startSpiderCat() {
    if (spiderCatActive) return;
    // Dismiss 1-minute easter egg if active
    if (easterEggActive) stopEasterEgg();

    spiderCatActive = true;
    spiderFrame = 0;
    spiderSwingIndex = 0;
    spiderAnchorX = window.innerWidth * 0.35;

    // Put on the Spider-Man suit!
    if (spidermanSuit) spidermanSuit.style.display = 'block';
    if (spiderWebSvg) spiderWebSvg.style.display = 'block';

    showBubble('*POOF! SPIDER-CAT!*', 2000);
  }

  function stopSpiderCat() {
    if (!spiderCatActive) return;
    spiderCatActive = false;

    // Hide Spider-Man suit and web line
    if (spidermanSuit) spidermanSuit.style.display = 'none';
    if (spiderWebSvg) spiderWebSvg.style.display = 'none';

    // Backflip landing
    if (wrapper) {
      wrapper.style.transition = 'transform 0.3s ease-out';
      wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} rotate(360deg)`;
      setTimeout(() => {
        wrapper.style.transition = '';
        wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
      }, 300);
    }

    state = 'sit';
    setEyes('normal');
    setMouth(false);
    showBubble(':3', 1000);
  }

  // Developer convenience: Accessible via console for instant testing
  window.triggerSpiderCat = startSpiderCat;
  window.triggerEasterEgg = startEasterEgg;

  // =========================================================================
  // 60 FPS Companion Animation Loop
  // =========================================================================
  function animate() {
    frameCount++;
    const now = Date.now();
    const idleMs = now - lastUserActivity;
    const idleSeconds = idleMs / 1000;

    // Check Trigger for 3-Minute Grand Easter Egg: SPIDER-CAT!
    if (idleMs >= SPIDER_CAT_TIMEOUT_MS && !spiderCatActive && !isAudioActive()) {
      startSpiderCat();
    } else if (idleMs >= EASTER_EGG_TIMEOUT_MS && idleMs < SPIDER_CAT_TIMEOUT_MS && !easterEggActive && !spiderCatActive && !isAudioActive()) {
      startEasterEgg();
    }

    // Audio Playback Priority Check
    const audioPlaying = isAudioActive();
    if (audioPlaying) {
      if (headphones) headphones.style.display = 'block';
      if (musicNotes) musicNotes.style.display = 'block';
    } else {
      if (headphones) headphones.style.display = 'none';
      if (musicNotes) musicNotes.style.display = 'none';
    }

    // =========================================================================
    // 3-Minute Grand Easter Egg: SPIDER-CAT WEB SWINGING
    // =========================================================================
    if (spiderCatActive) {
      spiderFrame++;

      // Multiple Anchor Points along the top Navigation Bar
      const navAnchors = [
        window.innerWidth * 0.28,
        window.innerWidth * 0.72,
        window.innerWidth * 0.48,
        window.innerWidth * 0.82,
        window.innerWidth * 0.18
      ];

      // Switch anchor point every 220 frames (~3.6s per swing session)
      const currentAnchorIndex = Math.floor(spiderFrame / 220) % navAnchors.length;
      spiderAnchorX += (navAnchors[currentAnchorIndex] - spiderAnchorX) * 0.05;

      // Authentic Pendulum Swing Physics
      const swingSpeed = 0.038;
      const angle = Math.sin(spiderFrame * swingSpeed) * 0.68; // Radians (~ -39 to +39 deg)
      const ropeLength = 150 + Math.cos(spiderFrame * (swingSpeed * 0.5)) * 25;

      catX = spiderAnchorX + Math.sin(angle) * ropeLength;
      catY = spiderAnchorY + Math.cos(angle) * ropeLength;

      // Facing orientation based on swing velocity
      const swingVel = Math.cos(spiderFrame * swingSpeed);
      facingLeft = swingVel < 0;

      // Cat body tilts with pendulum arc
      const swingDeg = angle * (180 / Math.PI);

      // Upside-Down Hanging Pause every 4th cycle
      const hangingCycle = Math.floor(spiderFrame / 440) % 2 === 1;
      if (hangingCycle && Math.abs(angle) < 0.18) {
        // Hangs upside-down by a single web thread from navbar
        if (wrapper) wrapper.style.transform = 'rotate(180deg)';
        if (spiderFrame % 140 === 0) {
          showBubble('*hangs upside-down*', 1600);
        }
      } else {
        if (wrapper) {
          wrapper.style.transform = `${facingLeft ? 'scaleX(-1) ' : ''}rotate(${swingDeg * 0.85}deg)`;
        }

        // Shouts at the top of the Navigation Bar!
        // Triggers shouts near the peak of the swing / when shooting webs
        if (spiderFrame % 180 === 15) {
          showBubble('*THWIP!*', 1200);
        } else if (spiderFrame % 180 === 60) {
          showBubble('*WEB!*', 1200);
        } else if (spiderFrame % 180 === 115) {
          showBubble('SPIDER-CAT!', 1400);
        }
      }

      // Update Web SVG Vector Line & Sticky Splat
      if (webLine && webSplat) {
        webLine.setAttribute('x1', spiderAnchorX);
        webLine.setAttribute('y1', spiderAnchorY);
        webLine.setAttribute('x2', catX + (facingLeft ? -8 : 8));
        webLine.setAttribute('y2', catY - 14); // Connects to front paw!
        webSplat.setAttribute('transform', `translate(${spiderAnchorX}, ${spiderAnchorY})`);
      }

      catEl.style.transform = `translate3d(${catX - 37}px, ${catY - 45}px, 0)`;
      requestAnimationFrame(animate);
      return;
    }

    // =========================================================================
    // 1-Minute Easter Egg Rendering (Rainbow / Aurora)
    // =========================================================================
    if (easterEggActive) {
      easterEggFrame++;

      if (easterEggMode === 'rainbow') {
        // ULTRA-SLOW, DELICATE, REGAL Runway Ramp Walk (30 seconds per cycle = 1800 frames)
        const cycleFrames = 1800;
        const cycle = (easterEggFrame % cycleFrames) / cycleFrames;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const t = cycle;
        const p0 = { x: 50, y: screenH * 0.84 };
        const p1 = { x: screenW * 0.5, y: screenH * 0.38 };
        const p2 = { x: screenW - 50, y: screenH * 0.84 };

        catX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        catY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        facingLeft = false;

        const delicateStrut = frameCount * 0.08;
        const stepL = Math.sin(delicateStrut);
        const stepR = Math.sin(delicateStrut + Math.PI);

        if (legFrontFar) legFrontFar.style.transform = `translateY(${stepL * 3}px) rotate(${stepL * 8}deg)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${stepR * 3}px) rotate(${stepR * 8}deg)`;
        if (legBackFar) legBackFar.style.transform = `translateY(${stepR * 3}px) rotate(${stepR * 8}deg)`;
        if (legBackNear) legBackNear.style.transform = `translateY(${stepL * 3}px) rotate(${stepL * 8}deg)`;

        if (headGroup) headGroup.style.transform = `rotate(${Math.sin(delicateStrut * 0.5) * 2.5 - 2}deg) translateY(-2px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${-22 + Math.sin(delicateStrut * 0.5) * 12}deg)`;

        if (cycle > 0.48 && cycle < 0.52) {
          setEyes('happy');
          if (headGroup) headGroup.style.transform = 'rotate(0deg)';
        } else {
          setEyes('normal');
        }

      } else {
        // Dark Mode: Serene Stargazer with Aurora and Glowing Crescent Moon
        const targetX = window.innerWidth * 0.5;
        const targetY = window.innerHeight * 0.70;
        catX += (targetX - catX) * 0.03;
        catY += (targetY - catY) * 0.03;

        setEyes('starry');
        setMouth(false);
        if (headGroup) headGroup.style.transform = `rotate(-16deg) translateY(-4px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.04) * 8}deg)`;

        const breath = Math.sin(frameCount * 0.04) * 1.5;
        if (wrapper) wrapper.style.transform = `scaleY(${1 + breath * 0.02})`;
      }

      catEl.style.transform = `translate3d(${catX - 37}px, ${catY - 45}px, 0)`;
      if (wrapper && easterEggMode === 'rainbow') {
        wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
      }
      requestAnimationFrame(animate);
      return;
    }

    // =========================================================================
    // Active Cursor Following & Hunting Standoff (Gentle & Calm Speeds)
    // =========================================================================
    const cursorVectorX = mouseX - catX;
    const cursorVectorY = mouseY - catY;
    const cursorDist = Math.hypot(cursorVectorX, cursorVectorY);

    // Standoff Perimeter: Never go under mouse (< 70px buffer)
    if (cursorDist < 70 && !isAudioActive() && state !== 'edge_stroll') {
      catX -= (cursorVectorX / (cursorDist || 1)) * 6;
      catY -= (cursorVectorY / (cursorDist || 1)) * 6;
    }

    if (audioPlaying) {
      // Audio Listening Mode: Cat puts on headphones & grooves
      state = 'listening';
      setEyes('happy');
      setMouth(false);

      const targetX = mouseX + (catX > mouseX ? 85 : -85);
      const targetY = mouseY + 30;

      const beat = Math.sin(frameCount * 0.16);
      if (headGroup) headGroup.style.transform = `translateY(${beat * 2.5}px) rotate(${beat * 3}deg)`;
      if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.12) * 14}deg)`;
      if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.max(0, -beat * 2)}px)`;

      catX += (targetX - catX) * 0.06;
      catY += (targetY - catY) * 0.06;
      facingLeft = targetX < catX;

    } else if (idleSeconds >= 2.5 && idleSeconds < 58) {
      // =======================================================================
      // RANDOM PLAYFUL BEHAVIOR ENGINE (Autonomous, Rich, Varied Feline Life!)
      // =======================================================================
      stateTimer--;

      if (stateTimer <= 0) {
        const portrait = findVisiblePortrait();
        const randChoice = Math.random();

        if (portrait && randChoice < 0.28) {
          state = 'walk_to_photo';
          stateTimer = 350; // ~6 seconds
        } else if (randChoice < 0.42 && !edgeActive) {
          state = 'edge_stroll';
          edgeActive = true;
          edgeDirection = Math.random() < 0.5 ? 1 : -1;
          catX = edgeDirection === 1 ? -70 : window.innerWidth + 70;
          catY = window.innerHeight - 38; // Sits right atop taskbar
          stateTimer = 900; // ~15 seconds to leisurely cross screen
          showBubble(':3', 1000);
        } else if (randChoice < 0.56) {
          state = 'dance';
          stateTimer = 220; // ~3.6 seconds
          showBubble('*dance*', 1400);
        } else if (randChoice < 0.70) {
          state = 'sing_meow';
          stateTimer = 200; // ~3.3 seconds
          showBubble('meow~', 1500);
        } else if (randChoice < 0.82) {
          state = 'knead_biscuits';
          stateTimer = 260; // ~4.3 seconds
          showBubble('*knead*', 1400);
        } else if (randChoice < 0.92) {
          state = 'chase_tail';
          spinAngle = 0;
          stateTimer = 140; // ~2.3 seconds
          showBubble('*spin*', 1200);
        } else {
          state = 'yawn_loaf';
          stateTimer = 280; // ~4.6 seconds
          showBubble('*yawn*', 1500);
        }
      }

      // Execute current playful behavior
      if (state === 'walk_to_photo') {
        const portrait = findVisiblePortrait();
        if (portrait) {
          const pDx = portrait.targetX - catX;
          const pDy = portrait.targetY - catY;
          const pDist = Math.hypot(pDx, pDy);

          if (pDist > 25) {
            facingLeft = pDx < 0;
            setEyes('normal');
            setMouth(false);
            const walkSpeed = Math.min(3.5, Math.max(1.2, pDist * 0.05));
            catX += (pDx / pDist) * walkSpeed;
            catY += (pDy / pDist) * walkSpeed;

            const walkStride = frameCount * 0.22;
            if (legFrontFar) legFrontFar.style.transform = `translateY(${Math.sin(walkStride) * 2.5}px)`;
            if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(walkStride + Math.PI) * 2.5}px)`;
            if (legBackFar) legBackFar.style.transform = `translateY(${Math.sin(walkStride + 0.8) * 2.5}px)`;
            if (legBackNear) legBackNear.style.transform = `translateY(${Math.sin(walkStride + 0.8 + Math.PI) * 2.5}px)`;
          } else {
            setEyes('happy');
            setMouth(false);
            const rub = Math.sin(frameCount * 0.06);
            if (wrapper) {
              wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${rub * 5}deg) translateY(${Math.abs(rub) * 1.5}px)`;
            }
            if (tailGroup) tailGroup.style.transform = `rotate(${-26 + rub * 10}deg)`;
            if (frameCount % 180 === 0) showBubble('*purr*', 1400);
          }
        } else {
          stateTimer = 0;
        }

      } else if (state === 'edge_stroll') {
        setEyes('normal');
        setMouth(false);
        const taskbarTopY = window.innerHeight - 38;
        catY += (taskbarTopY - catY) * 0.08;

        const slowEdgeSpeed = 1.1;
        catX += edgeDirection * slowEdgeSpeed;
        facingLeft = edgeDirection < 0;

        const strollCycle = frameCount * 0.16;
        if (legFrontFar) legFrontFar.style.transform = `translateY(${Math.sin(strollCycle) * 2.8}px)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(strollCycle + Math.PI) * 2.8}px)`;
        if (legBackFar) legBackFar.style.transform = `translateY(${Math.sin(strollCycle + 0.8) * 2.8}px)`;
        if (legBackNear) legBackNear.style.transform = `translateY(${Math.sin(strollCycle + 0.8 + Math.PI) * 2.8}px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${-18 + Math.sin(strollCycle * 0.5) * 12}deg)`;

        if ((edgeDirection === 1 && catX > window.innerWidth + 75) ||
            (edgeDirection === -1 && catX < -75)) {
          edgeActive = false;
          catX = mouseX + (edgeDirection === 1 ? -90 : 90);
          catY = mouseY + 30;
          stateTimer = 0;
        }

      } else if (state === 'dance') {
        setEyes('happy');
        setMouth(false);
        const danceStep = Math.sin(frameCount * 0.12) * 5;
        catX += Math.cos(frameCount * 0.06) * 0.6;
        if (wrapper) wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${danceStep}deg) translateY(${Math.abs(danceStep) * 0.5}px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.14) * 20}deg)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(frameCount * 0.14) * 3}px)`;

      } else if (state === 'sing_meow') {
        setEyes('happy');
        setMouth(true);
        if (headGroup) headGroup.style.transform = `rotate(-8deg) translateY(-2px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${-20 + Math.sin(frameCount * 0.08) * 10}deg)`;
        if (musicNotes && frameCount % 60 < 40) musicNotes.style.display = 'block';

      } else if (state === 'knead_biscuits') {
        setEyes('happy');
        setMouth(false);
        const slowKnead = Math.sin(frameCount * 0.045);
        if (legFrontFar) legFrontFar.style.transform = `translateY(${Math.max(0, slowKnead * 2.8)}px)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.max(0, -slowKnead * 2.8)}px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.04) * 8}deg)`;

      } else if (state === 'chase_tail') {
        setEyes('hunt');
        setMouth(false);
        spinAngle += 7;
        if (wrapper) wrapper.style.transform = `rotate(${spinAngle}deg)`;
        if (tailGroup) tailGroup.style.transform = `rotate(28deg)`;

      } else if (state === 'yawn_loaf') {
        if (stateTimer > 180) {
          setEyes('sleep');
          setMouth(true);
          if (wrapper) wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} scaleX(1.1) translateY(2px)`;
          if (legFrontNear) legFrontNear.style.transform = 'translate(4px, -1px)';
          if (legFrontFar) legFrontFar.style.transform = 'translate(4px, -1px)';
        } else {
          setMouth(false);
          setEyes('sleep');
          if (legFrontNear) legFrontNear.style.transform = '';
          if (legFrontFar) legFrontFar.style.transform = '';
          if (wrapper) wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(3px) scaleY(0.92)`;
          if (tailGroup) tailGroup.style.transform = 'rotate(-8deg)';
        }
      }

    } else {
      // =======================================================================
      // Relaxed Cursor Stalking & Trailing (Calm, Measured Pacing)
      // =======================================================================
      state = 'sit';
      edgeActive = false;
      setMouth(false);

      const flankAngle = Math.atan2(catY - mouseY, catX - mouseX);
      const safeDistance = 90;
      let targetX = mouseX + Math.cos(flankAngle) * safeDistance;
      let targetY = mouseY + Math.sin(flankAngle) * safeDistance;

      if (targetY < mouseY + 15) {
        targetY = mouseY + 26;
      }

      const dx = targetX - catX;
      const dy = targetY - catY;
      const distToStandoff = Math.hypot(dx, dy);

      if (distToStandoff > 18) {
        state = 'chase';
        setEyes('normal');

        const calmSpeed = Math.min(Math.max(distToStandoff * 0.05, 1.2), 4.5);
        catX += (dx / distToStandoff) * calmSpeed;
        catY += (dy / distToStandoff) * calmSpeed;
        facingLeft = mouseX < catX;

        const stride = frameCount * 0.24;
        const stepL = Math.sin(stride);
        const stepR = Math.sin(stride + Math.PI);
        if (legFrontFar) legFrontFar.style.transform = `translateY(${stepL * 3}px) rotate(${stepL * 9}deg)`;
        if (legFrontNear) legFrontNear.style.transform = `translateY(${stepR * 3}px) rotate(${stepR * 9}deg)`;
        if (legBackFar) legBackFar.style.transform = `translateY(${stepR * 3}px) rotate(${stepR * 9}deg)`;
        if (legBackNear) legBackNear.style.transform = `translateY(${stepL * 3}px) rotate(${stepL * 9}deg)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(stride * 0.7) * 14}deg)`;
        if (headGroup) headGroup.style.transform = `rotate(${facingLeft ? -3 : 3}deg)`;

      } else {
        facingLeft = mouseX < catX;
        setEyes('normal');

        if (legFrontFar) legFrontFar.style.transform = '';
        if (legFrontNear) legFrontNear.style.transform = '';
        if (legBackFar) legBackFar.style.transform = '';
        if (legBackNear) legBackNear.style.transform = '';
        if (headGroup) headGroup.style.transform = '';
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.07) * 10}deg)`;

        if (frameCount % 200 > 192) {
          setEyes('sleep');
        }
      }
    }

    // Apply Position & Facing Flip
    catEl.style.transform = `translate3d(${catX - 37}px, ${catY - 45}px, 0)`;
    if (wrapper && state !== 'photo_affection' && state !== 'chase_tail' && state !== 'dance' && state !== 'yawn_loaf' && !easterEggActive && !spiderCatActive) {
      wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }

    requestAnimationFrame(animate);
  }

  // Start Companion Loop
  requestAnimationFrame(animate);

  // Responsive Screen Check
  window.addEventListener('resize', () => {
    if (!isDesktop()) {
      catEl.style.display = 'none';
      if (easterEggActive) stopEasterEgg();
      if (spiderCatActive) stopSpiderCat();
    } else {
      catEl.style.display = 'block';
    }
  });

})();
