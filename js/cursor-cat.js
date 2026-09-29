/**
 * Soundriya Rathore - Intelligent Playful PC Cursor Cat Companion
 * Desktop PC Only | 4-Leg Quadruped Anatomy | Hunting Physics
 * Studio Headphones Audio Mode | Soundriya Photo Affection | Theme Adaptive
 * Zero-Emoji | Pure Hardware-Accelerated 60 FPS
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
  let catX = mouseX - 70;
  let catY = mouseY + 50;
  let velocityX = 0;
  let velocityY = 0;
  let facingLeft = false;
  let frameCount = 0;
  let idleTime = 0;
  let state = 'sit'; // 'sit', 'stalk', 'sprint', 'bat', 'listening', 'affection', 'stretch', 'sleep'
  let stalkTimer = 0;
  let batTimer = 0;
  let stretchTimer = 0;
  let sleepZTimer = 0;
  let affectionTarget = null;
  let isAffectionActive = false;

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

  // Theme Detection (Dark Theme = Pure White Cat | Light Theme = Midnight Slate Cat)
  const isDarkTheme = () => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  };

  // Create Companion Root Container
  const catEl = document.createElement('div');
  catEl.id = 'playful-cursor-cat';
  catEl.setAttribute('aria-hidden', 'true');
  catEl.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 68px;
    height: 56px;
    pointer-events: none;
    user-select: none;
    z-index: 9995;
    will-change: transform;
    transform: translate3d(-120px, -120px, 0);
    transition: opacity 0.3s ease;
  `;

  // Dynamic Theme Palette Definitions & Keyframe Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #playful-cursor-cat {
      --cat-coat: #1E293B;
      --cat-coat-dark: #0F172A;
      --cat-belly: #F8FAFC;
      --cat-paw: #F8FAFC;
      --cat-paw-stroke: #CBD5E1;
      --cat-outline: transparent;
      --cat-ear-inner: #F472B6;
      --cat-nose: #FB7185;
      --cat-eye-color: #38BDF8;
      --cat-shadow: rgba(0, 15, 40, 0.22);
      --cat-bubble-bg: rgba(255, 255, 255, 0.96);
      --cat-bubble-color: #0066FF;
      --cat-bubble-border: rgba(0, 102, 255, 0.18);
    }
    html[data-theme="dark"] #playful-cursor-cat {
      --cat-coat: #FFFFFF;
      --cat-coat-dark: #E2E8F0;
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
    @keyframes catNoteFloat1 {
      0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
      40% { opacity: 1; }
      100% { transform: translate(12px, -24px) scale(1.1); opacity: 0; }
    }
    @keyframes catNoteFloat2 {
      0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
      40% { opacity: 1; }
      100% { transform: translate(-10px, -28px) scale(1.15); opacity: 0; }
    }
    .cat-music-note-a {
      animation: catNoteFloat1 1.8s infinite ease-out;
    }
    .cat-music-note-b {
      animation: catNoteFloat2 2.2s infinite ease-out 0.8s;
    }
  `;
  document.head.appendChild(styleEl);

  // SVG Anatomy: 4 distinct legs, head, ears, studio headphones, animated tail, facial states
  catEl.innerHTML = `
    <div class="cat-wrapper" style="position: relative; width: 100%; height: 100%; transform-origin: 50% 85%;">
      <!-- Cat Ground Shadow -->
      <div class="cat-shadow" style="position: absolute; bottom: 1px; left: 10px; width: 48px; height: 9px; background: var(--cat-shadow); border-radius: 50%; filter: blur(2px); transition: background 0.3s ease;"></div>
      
      <!-- Primary Vector Cat SVG -->
      <svg class="cat-svg" viewBox="0 0 68 56" width="68" height="56" style="overflow: visible;">
        <defs>
          <filter id="cat-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity="0.16"/>
          </filter>
        </defs>

        <!-- Tail (Pivot at Base x=17, y=34) -->
        <g class="cat-tail-group" style="transform-origin: 17px 34px; transition: transform 0.15s ease-out;">
          <path class="cat-tail" d="M 17 34 C 10 33, 5 23, 9 15 C 11 12, 14 15, 12 19 C 9 23, 11 28, 17 31" 
                fill="none" stroke="var(--cat-coat)" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
        </g>

        <!-- Back Leg Far (Quadruped Leg 1 - Left Rear) -->
        <g class="cat-leg-back-far" style="transform-origin: 19px 34px;">
          <path d="M 18 32 C 15 37 13 44 14 50 C 15 52 19 52 20 50 C 21 45 22 39 23 34 Z" fill="var(--cat-coat-dark)"/>
          <ellipse cx="16.5" cy="50.5" rx="3.5" ry="2.2" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Back Leg Near (Quadruped Leg 2 - Right Rear) -->
        <g class="cat-leg-back-near" style="transform-origin: 25px 33px;">
          <path d="M 24 31 C 21 37 18 45 20 51 C 21 53 26 53 27 51 C 28 45 29 38 30 33 Z" fill="var(--cat-coat)"/>
          <ellipse cx="23" cy="51.5" rx="4" ry="2.3" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Main Torso Body -->
        <ellipse class="cat-body" cx="33" cy="34" rx="17" ry="12" fill="var(--cat-coat)" stroke="var(--cat-outline)" stroke-width="0.5" filter="url(#cat-depth-shadow)"/>

        <!-- Chest Fur Patch -->
        <ellipse class="cat-chest" cx="40" cy="35" rx="9" ry="8" fill="var(--cat-belly)"/>

        <!-- Front Leg Far (Quadruped Leg 3 - Left Front) -->
        <g class="cat-leg-front-far" style="transform-origin: 39px 34px;">
          <path d="M 38 33 L 37 49 C 37 51.5 41 51.5 42 49 L 43 34 Z" fill="var(--cat-coat-dark)"/>
          <ellipse cx="39.5" cy="50" rx="3.2" ry="2.2" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Front Leg Near (Quadruped Leg 4 - Right Front - Used for Batting) -->
        <g class="cat-leg-front-near" style="transform-origin: 46px 33px; transition: transform 0.12s ease;">
          <path d="M 45 32 L 45 49 C 45 52 50 52 51 49 L 51 33 Z" fill="var(--cat-coat)"/>
          <ellipse cx="48" cy="50.5" rx="3.6" ry="2.4" fill="var(--cat-paw)" stroke="var(--cat-paw-stroke)" stroke-width="0.5"/>
        </g>

        <!-- Soundriya Brand Royal Blue Collar with Golden Bell -->
        <g class="cat-collar-group">
          <path d="M 37 26 Q 45 31 52 24" fill="none" stroke="#0066FF" stroke-width="2.8" stroke-linecap="round"/>
          <circle cx="45" cy="29" r="2.5" fill="#F59E0B" stroke="#D97706" stroke-width="0.5"/>
          <circle cx="45.6" cy="28.4" r="0.8" fill="#FEF3C7"/>
        </g>

        <!-- Head Group (Pivot at Neck Base x=45, y=20) -->
        <g class="cat-head-group" style="transform-origin: 45px 20px; transition: transform 0.18s ease;">
          <!-- Left Ear -->
          <polygon points="35,16 38,4 45,13" fill="var(--cat-coat)"/>
          <polygon points="37,15 39,7 44,13" fill="var(--cat-ear-inner)"/>

          <!-- Right Ear -->
          <polygon points="48,13 55,4 58,16" fill="var(--cat-coat)"/>
          <polygon points="50,13 54,7 56,15" fill="var(--cat-ear-inner)"/>

          <!-- Head Shape -->
          <ellipse cx="46" cy="19" rx="12" ry="10" fill="var(--cat-coat)" stroke="var(--cat-outline)" stroke-width="0.5" filter="url(#cat-depth-shadow)"/>

          <!-- Whiskers -->
          <g stroke="#94A3B8" stroke-width="0.7" stroke-linecap="round">
            <line x1="38" y1="20" x2="28" y2="18"/>
            <line x1="38" y1="22" x2="27" y2="23"/>
            <line x1="53" y1="20" x2="63" y2="18"/>
            <line x1="53" y1="22" x2="64" y2="23"/>
          </g>

          <!-- Cute Pink Button Nose & Mouth -->
          <polygon points="44.2,21.8 46.8,21.8 45.5,23.2" fill="var(--cat-nose)"/>
          <path d="M 45.5 23.2 L 45.5 24.2 Q 44.2 25.2 42.5 24.5 M 45.5 24.2 Q 46.8 25.2 48.5 24.5" 
                fill="none" stroke="#94A3B8" stroke-width="0.9" stroke-linecap="round"/>

          <!-- 1. Normal Watching Eyes -->
          <g class="cat-eyes-normal">
            <ellipse cx="41.5" cy="17" rx="2.5" ry="3.2" fill="var(--cat-eye-color)"/>
            <circle cx="40.7" cy="15.8" r="1.1" fill="#FFFFFF"/>
            <ellipse cx="49.5" cy="17" rx="2.5" ry="3.2" fill="var(--cat-eye-color)"/>
            <circle cx="48.7" cy="15.8" r="1.1" fill="#FFFFFF"/>
          </g>

          <!-- 2. Happy / Listening Eyes (^ ^ Arcs) -->
          <g class="cat-eyes-happy" style="display: none;">
            <path d="M 39 18 Q 41.5 14.8 44 18" fill="none" stroke="#0066FF" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M 47 18 Q 49.5 14.8 52 18" fill="none" stroke="#0066FF" stroke-width="1.8" stroke-linecap="round"/>
          </g>

          <!-- 3. Sleeping / Shut Eyes -->
          <g class="cat-eyes-sleep" style="display: none;">
            <path d="M 39.5 18 Q 41.5 20.2 43.5 18" fill="none" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M 47.5 18 Q 49.5 20.2 51.5 18" fill="none" stroke="#64748B" stroke-width="1.4" stroke-linecap="round"/>
          </g>

          <!-- 4. Hunting / Stalking Predator Glare -->
          <g class="cat-eyes-hunt" style="display: none;">
            <circle cx="41.5" cy="17" r="3.4" fill="#0284C7"/>
            <circle cx="41.5" cy="17" r="2.2" fill="#0F172A"/>
            <circle cx="40.5" cy="15.8" r="0.8" fill="#FFFFFF"/>
            <circle cx="49.5" cy="17" r="3.4" fill="#0284C7"/>
            <circle cx="49.5" cy="17" r="2.2" fill="#0F172A"/>
            <circle cx="48.5" cy="15.8" r="0.8" fill="#FFFFFF"/>
          </g>

          <!-- Studio Headphones (Puts on when audio plays!) -->
          <g class="cat-headphones" style="display: none; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <!-- Metallic Headband -->
            <path d="M 34 16 C 34 3 58 3 58 16" fill="none" stroke="#0B192C" stroke-width="3.2" stroke-linecap="round"/>
            <path d="M 34 16 C 34 3 58 3 58 16" fill="none" stroke="#0066FF" stroke-width="1.6" stroke-linecap="round"/>
            <!-- Left Earcup with glowing LED indicator -->
            <rect x="32" y="11" width="5.5" height="11" rx="2.75" fill="#0B192C"/>
            <rect x="33" y="12" width="3.5" height="9" rx="1.75" fill="#0066FF"/>
            <circle cx="34.7" cy="16.5" r="1.1" fill="#38BDF8"/>
            <!-- Right Earcup with glowing LED indicator -->
            <rect x="55" y="11" width="5.5" height="11" rx="2.75" fill="#0B192C"/>
            <rect x="56" y="12" width="3.5" height="9" rx="1.75" fill="#0066FF"/>
            <circle cx="57.7" cy="16.5" r="1.1" fill="#38BDF8"/>
          </g>

          <!-- Floating Vector Music Notes -->
          <g class="cat-music-notes" style="display: none;">
            <g class="cat-music-note-a">
              <path d="M 58 4 L 64 2 L 64 7 M 60 7 A 1.8 1.4 0 1 1 58 5.6 A 1.8 1.4 0 0 1 60 7 Z" fill="#0066FF" stroke="#38BDF8" stroke-width="0.5"/>
            </g>
            <g class="cat-music-note-b">
              <path d="M 30 5 L 26 2 L 26 7 M 28 7 A 1.8 1.4 0 1 1 26 5.6 A 1.8 1.4 0 0 1 28 7 Z" fill="#38BDF8" stroke="#0066FF" stroke-width="0.5"/>
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

  // SVG DOM Element References for Micro-Animations
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
  const headphones = catEl.querySelector('.cat-headphones');
  const musicNotes = catEl.querySelector('.cat-music-notes');
  const bubble = catEl.querySelector('.cat-bubble');

  // Eye State Controller
  function setEyes(mode) {
    if (eyesNormal) eyesNormal.style.display = mode === 'normal' ? 'block' : 'none';
    if (eyesHappy) eyesHappy.style.display = mode === 'happy' ? 'block' : 'none';
    if (eyesSleep) eyesSleep.style.display = mode === 'sleep' ? 'block' : 'none';
    if (eyesHunt) eyesHunt.style.display = mode === 'hunt' ? 'block' : 'none';
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

  // Mouse Tracking
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    idleTime = 0;

    if (isAffectionActive) {
      isAffectionActive = false;
      showBubble(':3', 800);
    }

    if (state === 'sleep') {
      state = 'stretch';
      stretchTimer = 25;
      showBubble('!', 600);
    }
  }, { passive: true });

  // Playful Click Interaction: Jump & Pounce
  window.addEventListener('click', () => {
    idleTime = 0;
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
        // Visible in viewport
        if (rect.top < window.innerHeight - 80 && rect.bottom > 80 && rect.left < window.innerWidth && rect.right > 0) {
          return {
            element: el,
            rect: rect,
            targetX: rect.left + Math.min(60, rect.width * 0.25),
            targetY: rect.bottom - 20
          };
        }
      }
    }
    return null;
  }

  // 60 FPS Intelligent Animation Loop
  function animate() {
    frameCount++;

    // 1. Check Audio Status (Voice Demos / Videos)
    const audioPlaying = isAudioActive();
    if (audioPlaying) {
      if (headphones) headphones.style.display = 'block';
      if (musicNotes) musicNotes.style.display = 'block';
    } else {
      if (headphones) headphones.style.display = 'none';
      if (musicNotes) musicNotes.style.display = 'none';
    }

    // Determine target position based on state
    let targetX = mouseX + (facingLeft ? 26 : -26);
    let targetY = mouseY + 18;

    // Check if idle long enough to visit Soundriya's portrait for affection
    if (!audioPlaying && idleTime > 180) { // ~3 seconds idle
      const portrait = findVisiblePortrait();
      if (portrait) {
        affectionTarget = portrait;
        isAffectionActive = true;
        targetX = portrait.targetX;
        targetY = portrait.targetY;
      } else {
        isAffectionActive = false;
      }
    } else if (audioPlaying) {
      isAffectionActive = false;
    }

    const dx = targetX - catX;
    const dy = targetY - catY;
    const distance = Math.hypot(dx, dy);

    // Audio Listening Mode (Cat grooves to the beat!)
    if (audioPlaying && distance < 65) {
      state = 'listening';
      setEyes('happy');

      // Head and body bounce to the rhythm
      const beat = Math.sin(frameCount * 0.16);
      if (headGroup) headGroup.style.transform = `translateY(${beat * 2.8}px) rotate(${beat * 3}deg)`;
      if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.12) * 16}deg)`;

      // Subtle paw tap to tempo
      if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.max(0, -beat * 2.5)}px)`;

      // Gentle drift toward target
      catX += dx * 0.05;
      catY += dy * 0.05;

    } else if (isAffectionActive && distance < 25) {
      // Soundriya Portrait Affection Mode (Cheek rubbing & purring)
      state = 'affection';
      setEyes('happy');

      // Cheek rubbing lean motion against photo frame
      const rub = Math.sin(frameCount * 0.08);
      if (wrapper) {
        wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} rotate(${rub * 6}deg) translateY(${Math.abs(rub) * 2}px)`;
      }
      // Tail curls upward affectionately
      if (tailGroup) tailGroup.style.transform = `rotate(${-28 + rub * 12}deg)`;

      // Occasional purr emote
      if (frameCount % 180 === 0) {
        showBubble('*purr*', 1400);
      }

    } else if (distance > 200 && state === 'sit') {
      // Distance is far: trigger predatory stalk crouch and haunch wiggle before sprinting!
      state = 'stalk';
      stalkTimer = 18;
      setEyes('hunt');
      showBubble('!', 500);

    } else if (state === 'stalk' && stalkTimer > 0) {
      // Cat crouches low, haunches & tail wiggle preparing for hunting pounce!
      stalkTimer--;
      const wiggle = Math.sin(frameCount * 0.8) * 6;
      if (tailGroup) tailGroup.style.transform = `rotate(${wiggle * 3}deg)`;
      if (wrapper) wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(5px) scaleY(0.88)`;
      if (legBackNear) legBackNear.style.transform = `translateX(${wiggle * 0.6}px)`;
      if (legBackFar) legBackFar.style.transform = `translateX(${-wiggle * 0.6}px)`;

    } else if (state === 'stretch' && stretchTimer > 0) {
      // Downward cat stretch on wake-up
      stretchTimer--;
      setEyes('sleep');
      if (wrapper) wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} scaleX(1.15) translateY(4px)`;
      if (legFrontNear) legFrontNear.style.transform = 'translate(6px, -2px)';
      if (legFrontFar) legFrontFar.style.transform = 'translate(6px, -2px)';
      if (tailGroup) tailGroup.style.transform = 'rotate(-25deg)';

    } else if (distance > 16) {
      // Cat is running / hunting towards target!
      state = 'sprint';
      idleTime = 0;
      setEyes(distance > 120 ? 'hunt' : 'normal');

      // Hunting acceleration physics: agile and swift
      const maxSpeed = distance > 220 ? 19 : (distance > 80 ? 13 : 8);
      const speed = Math.min(Math.max(distance * 0.12, 4), maxSpeed);
      
      catX += (dx / distance) * speed;
      catY += (dy / distance) * speed;
      facingLeft = dx < 0;

      // Full 4-Leg Quadruped Gallop Gait Cycle
      const stride = frameCount * 0.44;
      const frontStepL = Math.sin(stride);
      const frontStepR = Math.sin(stride + Math.PI);
      const backStepL = Math.sin(stride + 0.8);
      const backStepR = Math.sin(stride + 0.8 + Math.PI);

      if (legFrontFar) legFrontFar.style.transform = `translateY(${frontStepL * 4}px) rotate(${frontStepL * 14}deg)`;
      if (legFrontNear) legFrontNear.style.transform = `translateY(${frontStepR * 4}px) rotate(${frontStepR * 14}deg)`;
      if (legBackFar) legBackFar.style.transform = `translateY(${backStepL * 4}px) rotate(${backStepL * 16}deg)`;
      if (legBackNear) legBackNear.style.transform = `translateY(${backStepR * 4}px) rotate(${backStepR * 16}deg)`;

      // Aerodynamic running tail swish
      if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(stride * 0.7) * 22}deg)`;
      // Head tilt forward while hunting
      if (headGroup) headGroup.style.transform = `rotate(${facingLeft ? -5 : 5}deg) translateY(-1px)`;

    } else {
      // Reached destination!
      idleTime++;

      // Reset leg positions
      if (legFrontFar) legFrontFar.style.transform = '';
      if (legFrontNear) legFrontNear.style.transform = '';
      if (legBackFar) legBackFar.style.transform = '';
      if (legBackNear) legBackNear.style.transform = '';
      if (headGroup) headGroup.style.transform = '';

      // Playful Batting reaction when first reaching cursor
      if (state === 'sprint' && !audioPlaying) {
        state = 'bat';
        batTimer = 16;
        showBubble(':3', 700);
      }

      if (state === 'bat' && batTimer > 0) {
        batTimer--;
        // Front paw playfully bats at cursor
        const batMotion = Math.sin((16 - batTimer) * 0.45) * 8;
        if (legFrontNear) legFrontNear.style.transform = `translate(4px, -${batMotion}px) rotate(-18deg)`;
      } else if (idleTime < 130) {
        // Sitting & watching cursor
        state = 'sit';
        setEyes('normal');

        // Gentle tail sway
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.08) * 12}deg)`;

        // Occasional cute eye blink
        if (frameCount % 200 > 192) {
          setEyes('sleep');
        }

      } else if (idleTime < 280) {
        // Grooming paw
        state = 'groom';
        setEyes('sleep');
        if (legFrontNear) legFrontNear.style.transform = `translateY(${Math.sin(frameCount * 0.28) * 5}px)`;
        if (tailGroup) tailGroup.style.transform = `rotate(${Math.sin(frameCount * 0.06) * 8}deg)`;

      } else {
        // Sleeping peacefully
        state = 'sleep';
        setEyes('sleep');
        if (tailGroup) tailGroup.style.transform = 'rotate(-10deg)';

        // Floating zZz bubbles
        sleepZTimer++;
        if (sleepZTimer > 160) {
          showBubble('zZz', 1800);
          sleepZTimer = 0;
        }
      }
    }

    // Apply Position & Facing Orientation
    catEl.style.transform = `translate3d(${catX - 34}px, ${catY - 42}px, 0)`;
    if (wrapper && state !== 'affection' && state !== 'stalk' && state !== 'stretch') {
      wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }

    requestAnimationFrame(animate);
  }

  // Start Animation Loop
  requestAnimationFrame(animate);

  // Clean Screen Resize Handler
  window.addEventListener('resize', () => {
    if (!isDesktop()) {
      catEl.style.display = 'none';
    } else {
      catEl.style.display = 'block';
    }
  });

})();
