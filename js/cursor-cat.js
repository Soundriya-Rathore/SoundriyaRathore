/**
 * Soundriya Rathore - Playful Cursor Cat Companion
 * Desktop PC Only | Zero-Lag Hardware Accelerated
 * Non-intrusive (pointer-events: none) | Playful interactions
 */

(function () {
  'use strict';

  // Strict PC check: Desktop with fine pointer (mouse) and widescreen
  const isDesktop = () => {
    return window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 992px)').matches;
  };

  if (!isDesktop()) return;

  // Cat State
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let catX = mouseX - 60;
  let catY = mouseY + 40;
  let catSpeed = 0;
  let isMoving = false;
  let idleCounter = 0;
  let currentAction = 'sit'; // 'run', 'sit', 'wash', 'sleep', 'pounce'
  let facingLeft = false;
  let frameCount = 0;
  let sleepZTimer = 0;

  // Create Cat Container
  const catEl = document.createElement('div');
  catEl.id = 'playful-cursor-cat';
  catEl.setAttribute('aria-hidden', 'true');
  catEl.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 44px;
    height: 44px;
    pointer-events: none;
    user-select: none;
    z-index: 9990;
    will-change: transform;
    transform: translate3d(-100px, -100px, 0);
    transition: opacity 0.4s ease;
  `;

  // Inline SVG Cat with dynamic parts: tail, paws, eyes, ears, collar
  catEl.innerHTML = `
    <div class="cat-wrapper" style="position: relative; width: 100%; height: 100%; transform-origin: 50% 80%;">
      <!-- Cat Shadow -->
      <div class="cat-shadow" style="position: absolute; bottom: 2px; left: 6px; width: 32px; height: 7px; background: rgba(0, 15, 40, 0.16); border-radius: 50%; filter: blur(1.5px);"></div>
      
      <!-- Cat SVG -->
      <svg class="cat-svg" viewBox="0 0 44 44" width="44" height="44" style="overflow: visible;">
        <defs>
          <filter id="cat-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-opacity="0.12" flood-color="#0B192C"/>
          </filter>
        </defs>

        <!-- Tail -->
        <path class="cat-tail" d="M12 28 C6 28 4 18 10 16 C12 15 13 18 11 20 C9 22 10 26 14 26" fill="none" stroke="#1E293B" stroke-width="3" stroke-linecap="round" style="transform-origin: 12px 28px; transition: transform 0.2s ease;"/>

        <!-- Back Paws -->
        <ellipse class="cat-paw-back-l" cx="13" cy="35" rx="3.5" ry="3" fill="#0F172A" />
        <ellipse class="cat-paw-back-r" cx="21" cy="35" rx="3.5" ry="3" fill="#0F172A" />

        <!-- Body -->
        <ellipse class="cat-body" cx="20" cy="26" rx="12" ry="10" fill="#1E293B" filter="url(#cat-soft-shadow)" />
        
        <!-- White Chest Fur Patch -->
        <ellipse cx="23" cy="27" rx="5.5" ry="6.5" fill="#F8FAFC" />

        <!-- Front Paws -->
        <ellipse class="cat-paw-front-l" cx="18" cy="36" rx="3" ry="3" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.5" style="transform-origin: 18px 34px;" />
        <ellipse class="cat-paw-front-r" cx="27" cy="36" rx="3" ry="3" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="0.5" style="transform-origin: 27px 34px;" />

        <!-- Head Group -->
        <g class="cat-head" style="transform-origin: 28px 18px; transition: transform 0.2s ease;">
          <!-- Left Ear -->
          <polygon points="21,14 24,6 28,12" fill="#1E293B" />
          <polygon points="22.5,13 24.5,8 27,12" fill="#F472B6" opacity="0.8" />

          <!-- Right Ear -->
          <polygon points="30,13 35,7 36,15" fill="#1E293B" />
          <polygon points="31,13 34,9 35,14" fill="#F472B6" opacity="0.8" />

          <!-- Head Base -->
          <circle cx="28" cy="18" r="9" fill="#1E293B" filter="url(#cat-soft-shadow)" />

          <!-- Cute Royal Blue Collar (Soundriya Brand Blue with Gold Bell) -->
          <path d="M21 23 Q28 26 34 22" fill="none" stroke="#0066FF" stroke-width="2" stroke-linecap="round" />
          <circle cx="28" cy="25" r="1.8" fill="#F59E0B" />

          <!-- Eyes: Open (Default) -->
          <g class="cat-eyes-open">
            <ellipse cx="26" cy="17" rx="2" ry="2.5" fill="#38BDF8" />
            <circle cx="25.5" cy="16.2" r="0.8" fill="#FFFFFF" />
            <ellipse cx="31.5" cy="17" rx="2" ry="2.5" fill="#38BDF8" />
            <circle cx="31" cy="16.2" r="0.8" fill="#FFFFFF" />
          </g>

          <!-- Eyes: Closed (Blink / Sleeping) -->
          <g class="cat-eyes-sleep" style="display: none;">
            <path d="M24 18 Q26 19.5 28 18" fill="none" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round" />
            <path d="M30 18 Q32 19.5 34 18" fill="none" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round" />
          </g>

          <!-- Cute Pink Nose & Mouth -->
          <polygon points="28.5,19.5 27.5,20.5 29.5,20.5" fill="#F472B6" />
          <path d="M28.5 20.5 L28.5 21.5 Q27.5 22.5 26.5 21.8 M28.5 21.5 Q29.5 22.5 30.5 21.8" fill="none" stroke="#94A3B8" stroke-width="0.8" stroke-linecap="round" />

          <!-- Whiskers -->
          <line x1="21" y1="19" x2="16" y2="18" stroke="#94A3B8" stroke-width="0.6" stroke-linecap="round" />
          <line x1="21" y1="21" x2="16" y2="22" stroke="#94A3B8" stroke-width="0.6" stroke-linecap="round" />
          <line x1="34" y1="19" x2="39" y2="18" stroke="#94A3B8" stroke-width="0.6" stroke-linecap="round" />
          <line x1="34" y1="21" x2="39" y2="22" stroke="#94A3B8" stroke-width="0.6" stroke-linecap="round" />
        </g>
      </svg>

      <!-- Emote / Mood Bubble (Zzz, Heart, Alert) -->
      <div class="cat-bubble" style="
        position: absolute;
        top: -16px;
        right: -6px;
        font-family: var(--font-display, sans-serif);
        font-size: 11px;
        font-weight: 700;
        color: #0066FF;
        background: rgba(255, 255, 255, 0.95);
        padding: 1px 5px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        opacity: 0;
        transform: translateY(4px) scale(0.8);
        transition: opacity 0.25s ease, transform 0.25s ease;
        pointer-events: none;
      ">zzz</div>
    </div>
  `;

  document.body.appendChild(catEl);

  // SVG Elements for micro-animations
  const wrapper = catEl.querySelector('.cat-wrapper');
  const tail = catEl.querySelector('.cat-tail');
  const frontPawL = catEl.querySelector('.cat-paw-front-l');
  const frontPawR = catEl.querySelector('.cat-paw-front-r');
  const eyesOpen = catEl.querySelector('.cat-eyes-open');
  const eyesSleep = catEl.querySelector('.cat-eyes-sleep');
  const head = catEl.querySelector('.cat-head');
  const bubble = catEl.querySelector('.cat-bubble');

  // Track Mouse Position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    idleCounter = 0;
    if (currentAction === 'sleep') {
      showBubble('!', '#0066FF', 800);
      currentAction = 'sit';
    }
  }, { passive: true });

  // Playful interaction: On Click, cat does a happy little jump / pounce!
  window.addEventListener('click', (e) => {
    idleCounter = 0;
    showBubble(':3', '#0066FF', 900);
    
    // Quick pounce hop
    if (wrapper) {
      wrapper.style.transition = 'transform 0.18s ease-out';
      wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(-14px) scale(1.1)`;
      setTimeout(() => {
        wrapper.style.transform = `${facingLeft ? 'scaleX(-1)' : 'scaleX(1)'} translateY(0) scale(1)`;
        setTimeout(() => {
          wrapper.style.transition = '';
        }, 180);
      }, 180);
    }
  });

  function showBubble(text, color = '#0066FF', duration = 1200) {
    if (!bubble) return;
    bubble.textContent = text;
    bubble.style.color = color;
    bubble.style.opacity = '1';
    bubble.style.transform = 'translateY(0) scale(1)';
    clearTimeout(bubble._timeout);
    bubble._timeout = setTimeout(() => {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(4px) scale(0.8)';
    }, duration);
  }

  // Animation Loop (60fps requestAnimationFrame)
  function animate() {
    frameCount++;

    // Calculate distance to mouse cursor
    // Cat stays slightly below and to the side of the cursor so it never covers the cursor pointer
    const targetX = mouseX + (facingLeft ? 22 : -22);
    const targetY = mouseY + 18;

    const dx = targetX - catX;
    const dy = targetY - catY;
    const distance = Math.hypot(dx, dy);

    // Speed smoothly accelerates with distance (playful pounce feel)
    if (distance > 18) {
      isMoving = true;
      idleCounter = 0;
      currentAction = 'run';

      // Ease cat toward cursor smoothly
      const speed = Math.min(Math.max(distance * 0.12, 3), 14);
      catX += (dx / distance) * speed;
      catY += (dy / distance) * speed;

      // Facing orientation
      facingLeft = dx < 0;

      // Running paw step oscillation
      const step = Math.sin(frameCount * 0.45);
      if (frontPawL) frontPawL.style.transform = `translateY(${step * 3.5}px)`;
      if (frontPawR) frontPawR.style.transform = `translateY(${-step * 3.5}px)`;

      // Tail swish while running
      if (tail) tail.style.transform = `rotate(${Math.sin(frameCount * 0.3) * 22}deg)`;

      // Head tilts forward slightly while running
      if (head) head.style.transform = `rotate(${facingLeft ? -4 : 4}deg)`;

      // Eyes open
      if (eyesOpen) eyesOpen.style.display = 'block';
      if (eyesSleep) eyesSleep.style.display = 'none';

    } else {
      // Cat reached cursor!
      isMoving = false;
      idleCounter++;

      // Reset paw positions
      if (frontPawL) frontPawL.style.transform = 'translateY(0)';
      if (frontPawR) frontPawR.style.transform = 'translateY(0)';

      // Gentle tail sway while resting
      if (tail) tail.style.transform = `rotate(${Math.sin(frameCount * 0.08) * 12}deg)`;
      if (head) head.style.transform = 'rotate(0deg)';

      // Idle behaviors
      if (idleCounter < 120) {
        // Just sitting, watching cursor (eyes open)
        currentAction = 'sit';
        if (eyesOpen) eyesOpen.style.display = 'block';
        if (eyesSleep) eyesSleep.style.display = 'none';

        // Occasional cute blink
        if (frameCount % 180 > 170) {
          if (eyesOpen) eyesOpen.style.display = 'none';
          if (eyesSleep) eyesSleep.style.display = 'block';
        }
      } else if (idleCounter < 260) {
        // Grooming / Washing paw
        currentAction = 'wash';
        if (frontPawL) frontPawL.style.transform = `translateY(${Math.sin(frameCount * 0.25) * 4}px)`;
      } else {
        // Asleep!
        currentAction = 'sleep';
        if (eyesOpen) eyesOpen.style.display = 'none';
        if (eyesSleep) eyesSleep.style.display = 'block';

        // Floating "zzz" every 2.5 seconds
        sleepZTimer++;
        if (sleepZTimer > 150) {
          showBubble('zZz', '#64748B', 1600);
          sleepZTimer = 0;
        }
      }
    }

    // Apply smooth position and horizontal flip
    catEl.style.transform = `translate3d(${catX - 22}px, ${catY - 32}px, 0)`;
    if (wrapper) {
      wrapper.style.transform = facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }

    requestAnimationFrame(animate);
  }

  // Start companion loop
  requestAnimationFrame(animate);

})();
