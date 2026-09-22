/**
 * Soundriya Rathore - Official Portfolio JavaScript
 * Video Cinema Modal, YouTube Dynamic Thumbnails, Audio Player,
 * Mic Inspector Modal & Interactivity
 * Zero-Emoji | Pure Modern ES6+
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initPreviewTip();
  initHeader();
  initMobileMenu();
  initAudioPlayers();
  initAudioFilterTabs();
  initYouTubeVideoPlayers();
  initShortsToggle();
  initArticlesAccordion();
  initMicModal();
  initScrollSpy();
  initContactActions();

  // Dynamic Year in Footer
  const yr = document.getElementById('current-year');
  if (yr) yr.textContent = new Date().getFullYear();
});

/* ==========================================================================
   Theme Switcher (Studio Light & Dark Mode with LocalStorage)
   ========================================================================== */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Soundriya Rathore Portfolio defaults strictly to clean White (Light) mode.
  // Dark mode only activates if user explicitly chose it previously.
  const savedTheme = localStorage.getItem('sr_theme');
  const currentTheme = savedTheme === 'dark' ? 'dark' : 'light';
  if (currentTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }

  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      localStorage.setItem('sr_theme', 'light');
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('sr_theme', 'dark');
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    }
  });
}

/* ==========================================================================
   Local File Protocol Warning (For YouTube Error 153 mitigation)
   ========================================================================== */
function initPreviewTip() {
  if (window.location.protocol === 'file:') {
    const tip = document.getElementById('local-preview-tip');
    if (tip) tip.classList.add('active');
  }
}

/* ==========================================================================
   Header Scroll State
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  const navLinks = navMenu.querySelectorAll('.nav-link, .mobile-contact-btn');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   YouTube Dynamic Thumbnails & Cinema Video Lightbox
   (Fixes YouTube Error 153 and keeps thumbnails synced with YouTube Studio)
   ========================================================================== */
function initYouTubeVideoPlayers() {
  const videoCards = document.querySelectorAll('[data-youtube-id]');
  const videoModal = document.getElementById('video-modal');
  const videoModalIframe = document.getElementById('video-modal-iframe');
  const modalCloseBtns = document.querySelectorAll('[data-close-modal]');

  // Load dynamic thumbnails directly from YouTube's CDN
  videoCards.forEach(card => {
    const ytid = card.getAttribute('data-youtube-id');
    const thumbImg = card.querySelector('img.yt-thumb-img, img.video-thumb');

    if (ytid && thumbImg) {
      // Try high-resolution maxresdefault first with fallback to hqdefault
      const highResUrl = `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
      const fallbackUrl = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;

      const testImg = new Image();
      testImg.onload = () => {
        // YouTube returns a 120px wide placeholder if maxresdefault doesn't exist
        if (testImg.naturalWidth > 120) {
          thumbImg.src = highResUrl;
        } else {
          thumbImg.src = fallbackUrl;
        }
      };
      testImg.onerror = () => {
        thumbImg.src = fallbackUrl;
      };
      testImg.src = highResUrl;
    }

    // Click on video card to open cinema player modal
    card.addEventListener('click', (e) => {
      // If clicking directly on external watch link, let it open normally
      if (e.target.closest('.watch-link') || e.target.closest('a[target="_blank"]')) {
        return;
      }
      e.preventDefault();
      if (videoModal && videoModalIframe && ytid) {
        // Embed with autoplay
        videoModalIframe.src = `https://www.youtube-nocookie.com/embed/${ytid}?autoplay=1&rel=0`;
        const directLink = document.getElementById('video-modal-direct-link');
        if (directLink) {
          directLink.href = `https://www.youtube.com/watch?v=${ytid}`;
        }
        videoModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close modals
  const closeModal = () => {
    if (videoModal) {
      videoModal.classList.remove('open');
      if (videoModalIframe) videoModalIframe.src = '';
    }
    const micModal = document.getElementById('mic-modal');
    if (micModal) micModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ==========================================================================
   Collapsible "View More" Shorts Drawer
   ========================================================================== */
function initShortsToggle() {
  const toggleBtn = document.getElementById('toggle-shorts-btn');
  const drawer = document.getElementById('shorts-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    const labelSpan = toggleBtn.querySelector('.btn-label');
    const iconSvg = toggleBtn.querySelector('svg');

    if (isOpen) {
      if (labelSpan) labelSpan.textContent = 'Hide Content (Shorts)';
      if (iconSvg) iconSvg.style.transform = 'rotate(180deg)';
      // Smooth scroll to shorts if needed
      drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      if (labelSpan) labelSpan.textContent = 'View More Content (Shorts)';
      if (iconSvg) iconSvg.style.transform = 'rotate(0deg)';
    }
  });
}

/* ==========================================================================
   Collapsible Articles Accordion (Hidden by default, expands on click)
   ========================================================================== */
function initArticlesAccordion() {
  const toggleBtn = document.getElementById('articles-toggle-btn');
  const articlesList = document.getElementById('articles-list-content');
  if (!toggleBtn || !articlesList) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = articlesList.classList.toggle('open');
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

/* ==========================================================================
   Interactive Microphone Inspection Modal
   ========================================================================== */
function initMicModal() {
  const micBtns = document.querySelectorAll('[data-mic-key]');
  const micModal = document.getElementById('mic-modal');
  if (!micBtns.length || !micModal) return;

  const micTitle = document.getElementById('mic-modal-title');
  const micType = document.getElementById('mic-modal-type');
  const micCapsule = document.getElementById('mic-modal-capsule');
  const micPolar = document.getElementById('mic-modal-polar');
  const micFreq = document.getElementById('mic-modal-freq');
  const micOutput = document.getElementById('mic-modal-output');
  const micDesc = document.getElementById('mic-modal-desc');

  const configMics = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.microphones) || {
    "wright-wr-800": {
      name: "Wright WR 800",
      type: "Large Diaphragm Studio Condenser Microphone",
      capsule: "34mm Gold-Sputtered Dual Diaphragm",
      polarPattern: "Cardioid Directional",
      frequencyResponse: "20 Hz – 20,000 Hz",
      connectivity: "Standard Balanced XLR Output",
      description: "Soundriya's primary microphone for commercial voiceovers, documentary narration, and nuanced vocal delivery with rich low-end presence and crystal-clear top-end air."
    },
    "fifine-am8": {
      name: "FIFINE AMPLIGAME AM8",
      type: "Dynamic Broadcast & Podcasting Microphone",
      capsule: "Precision Dynamic Capsule with Integrated Pop Filter",
      polarPattern: "Cardioid Off-Axis Rejection",
      connectivity: "Dual XLR & USB-C Output",
      frequencyResponse: "50 Hz – 16,000 Hz",
      description: "Soundriya's broadcast and live directed session mic, engineered for high rejection of room reflections, warm broadcast tone, and rapid remote client turnaround."
    }
  };

  micBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-mic-key');
      const mic = configMics[key];
      if (!mic) return;

      if (micTitle) micTitle.textContent = mic.name;
      if (micType) micType.textContent = mic.type;
      if (micCapsule) micCapsule.textContent = mic.capsule;
      if (micPolar) micPolar.textContent = mic.polarPattern;
      if (micFreq) micFreq.textContent = mic.frequencyResponse;
      if (micOutput) micOutput.textContent = mic.connectivity || 'Professional XLR Output';
      if (micDesc) micDesc.textContent = mic.description;

      micModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
}

/* ==========================================================================
   Voice Demos Interactive Player
   ========================================================================== */
function initAudioPlayers() {
  const demoCards = document.querySelectorAll('.demo-card');
  const allAudios = [];

  // Calibrated vocal waveform profiles for 32 bars per demo
  const waveformProfiles = [
    // 1. Bella Tavola (Warm, upscale commercial delivery)
    [28, 42, 60, 78, 55, 72, 92, 65, 48, 82, 98, 74, 58, 88, 82, 45, 62, 94, 82, 58, 72, 88, 68, 48, 78, 62, 45, 68, 52, 38, 26, 18],
    // 2. Cart Pop (Punchy, energetic retail commercial bursts)
    [32, 58, 92, 75, 88, 100, 82, 64, 96, 78, 54, 86, 98, 68, 48, 74, 92, 86, 64, 78, 96, 100, 72, 52, 82, 68, 48, 64, 42, 32, 22, 16],
    // 3. Mohan Judaro (Deep historical bass, measured cadence)
    [22, 38, 58, 76, 88, 74, 56, 72, 84, 94, 82, 68, 88, 98, 76, 62, 82, 92, 72, 58, 76, 86, 92, 72, 52, 66, 52, 42, 32, 26, 20, 16],
    // 4. Tiger Sharks (Atmospheric, predatory suspense crescendos)
    [26, 52, 72, 94, 86, 62, 82, 92, 98, 76, 62, 86, 96, 72, 58, 76, 92, 86, 66, 82, 96, 72, 62, 86, 66, 52, 42, 56, 42, 32, 22, 16]
  ];

  demoCards.forEach((card, cardIndex) => {
    const audioSrc = card.getAttribute('data-audio');
    if (!audioSrc) return;

    const audio = new Audio();
    audio.preload = 'auto';
    allAudios.push({ card, audio });

    // Preload audio into memory via Blob URL for instant zero-lag seeks & no server byte-range constraints
    fetch(audioSrc)
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.blob();
      })
      .then(blob => {
        audio.src = URL.createObjectURL(blob);
        audio.load();
      })
      .catch(() => {
        audio.src = audioSrc;
        audio.load();
      });

    const playBtn = card.querySelector('.demo-play-btn');
    const waveformBarsWrap = card.querySelector('.waveform-bars-wrap');
    const progressBar = card.querySelector('.demo-progress-bar');
    const progressFill = card.querySelector('.demo-progress-fill');
    const currentTimeEl = card.querySelector('.current-time');
    const totalDurationEl = card.querySelector('.total-duration');

    // Volume Control Elements
    const volWrap = card.querySelector('.demo-vol-wrap');
    const volBtn = card.querySelector('.demo-vol-btn');
    const volSlider = card.querySelector('.demo-vol-slider');
    const volFill = card.querySelector('.demo-vol-fill');

    let currentVolume = 1.0;
    let isMuted = false;

    // Generate 32 Calibrated Waveform Bars
    const profile = waveformProfiles[cardIndex % waveformProfiles.length];
    if (waveformBarsWrap) {
      waveformBarsWrap.innerHTML = '';
      profile.forEach((height, i) => {
        const bar = document.createElement('span');
        bar.className = 'wave-bar';
        bar.style.height = `${height}%`;
        bar.style.animationDelay = `${(i % 8) * 0.12}s`;
        bar.setAttribute('data-bar-index', i);
        waveformBarsWrap.appendChild(bar);
      });
    }

    const waveBars = waveformBarsWrap ? waveformBarsWrap.querySelectorAll('.wave-bar') : [];

    const formatTime = (seconds) => {
      if (isNaN(seconds) || seconds < 0) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Instant synchronous UI update function
    const updateUI = (time) => {
      if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(time);
      }
      const dur = audio.duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        const percent = Math.min(100, Math.max(0, (time / dur) * 100));
        if (progressFill) progressFill.style.width = `${percent}%`;

        // Progressive wave bar color fill
        const activeBarThreshold = (time / dur) * waveBars.length;
        waveBars.forEach((bar, i) => {
          if (i <= activeBarThreshold) {
            bar.classList.add('played');
          } else {
            bar.classList.remove('played');
          }
        });
      }
    };

    // Metadata loaded
    audio.addEventListener('loadedmetadata', () => {
      if (totalDurationEl && !isNaN(audio.duration) && isFinite(audio.duration)) {
        totalDurationEl.textContent = formatTime(audio.duration);
      }
      updateUI(audio.currentTime);
    });

    audio.addEventListener('canplay', () => {
      if (totalDurationEl && !isNaN(audio.duration) && isFinite(audio.duration)) {
        totalDurationEl.textContent = formatTime(audio.duration);
      }
    });

    // Time update: animate progress fill & wave bars
    audio.addEventListener('timeupdate', () => {
      if (!isScrubbing) {
        updateUI(audio.currentTime);
      }
    });

    audio.addEventListener('seeked', () => {
      updateUI(audio.currentTime);
    });

    // Playback Ended
    audio.addEventListener('ended', () => {
      card.classList.remove('playing');
      waveBars.forEach(b => {
        b.classList.remove('played', 'active-dance');
      });
      if (progressFill) progressFill.style.width = '0%';
      if (currentTimeEl) currentTimeEl.textContent = '0:00';
    });

    // Play/Pause Button Toggle
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (audio.paused) {
          // Pause all other audio tracks
          allAudios.forEach(item => {
            if (item.audio !== audio) {
              item.audio.pause();
              item.card.classList.remove('playing');
              const otherBars = item.card.querySelectorAll('.wave-bar');
              otherBars.forEach(b => b.classList.remove('active-dance'));
            }
          });

          audio.play().then(() => {
            card.classList.add('playing');
            waveBars.forEach(b => b.classList.add('active-dance'));
          }).catch(err => {
            console.warn('Audio playback error:', err);
          });
        } else {
          audio.pause();
          card.classList.remove('playing');
          waveBars.forEach(b => b.classList.remove('active-dance'));
        }
      });
    }

    // Rewind -5 seconds button (Instant seek with zero reset)
    const rewindBtn = card.querySelector('.rewind-btn');
    if (rewindBtn) {
      rewindBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const current = audio.currentTime || 0;
        const target = Math.max(0, current - 5);
        audio.currentTime = target;
        updateUI(target);
      });
    }

    // Forward +5 seconds button (Instant seek with zero reset)
    const forwardBtn = card.querySelector('.forward-btn');
    if (forwardBtn) {
      forwardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const current = audio.currentTime || 0;
        const duration = (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) ? audio.duration : 0;
        const target = duration > 0 ? Math.min(duration, current + 5) : current + 5;
        audio.currentTime = target;
        updateUI(target);
      });
    }

    // Direct Seek & Real-Time Scrub Dragging Controller (Mouse & Touch)
    let isScrubbing = false;

    const attachSeekScrubber = (element) => {
      if (!element) return;

      const calcSeekTime = (clientX) => {
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0) return 0;
        const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const ratio = offsetX / rect.width;
        const duration = (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) ? audio.duration : 0;
        return ratio * duration;
      };

      // Mouse Drag & Click
      element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isScrubbing = true;
        let pendingTime = calcSeekTime(e.clientX);
        updateUI(pendingTime);

        const onMouseMove = (moveEvent) => {
          if (!isScrubbing) return;
          moveEvent.preventDefault();
          pendingTime = calcSeekTime(moveEvent.clientX);
          updateUI(pendingTime);
        };

        const onMouseUp = (upEvent) => {
          if (isScrubbing) {
            isScrubbing = false;
            pendingTime = calcSeekTime(upEvent.clientX);
            audio.currentTime = pendingTime;
            updateUI(pendingTime);
          }
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      // Touch Drag & Tap (Mobile / Tablet)
      let lastTouchTime = 0;
      element.addEventListener('touchstart', (e) => {
        if (!e.touches.length) return;
        isScrubbing = true;
        lastTouchTime = calcSeekTime(e.touches[0].clientX);
        updateUI(lastTouchTime);
      }, { passive: true });

      element.addEventListener('touchmove', (e) => {
        if (!isScrubbing || !e.touches.length) return;
        lastTouchTime = calcSeekTime(e.touches[0].clientX);
        updateUI(lastTouchTime);
      }, { passive: true });

      element.addEventListener('touchend', () => {
        if (isScrubbing) {
          isScrubbing = false;
          audio.currentTime = lastTouchTime;
          updateUI(lastTouchTime);
        }
      });
      element.addEventListener('touchcancel', () => {
        isScrubbing = false;
      });
    };

    attachSeekScrubber(progressBar);
    attachSeekScrubber(waveformBarsWrap);

    // Volume Control Implementation
    const setVolume = (val, userAction = true) => {
      const clamped = Math.max(0, Math.min(1, val));
      audio.volume = clamped;
      if (userAction && clamped > 0) {
        currentVolume = clamped;
        isMuted = false;
      }
      if (clamped === 0) {
        isMuted = true;
        if (volWrap) volWrap.classList.add('muted');
        if (volFill) volFill.style.width = '0%';
        if (volSlider) volSlider.setAttribute('aria-valuenow', '0');
      } else {
        if (volWrap) volWrap.classList.remove('muted');
        if (volFill) volFill.style.width = `${Math.round(clamped * 100)}%`;
        if (volSlider) volSlider.setAttribute('aria-valuenow', Math.round(clamped * 100));
      }
    };

    if (volBtn) {
      volBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMuted || audio.volume === 0) {
          setVolume(currentVolume > 0.05 ? currentVolume : 1.0, false);
          isMuted = false;
          if (volWrap) volWrap.classList.remove('muted');
        } else {
          currentVolume = audio.volume;
          setVolume(0, false);
          isMuted = true;
          if (volWrap) volWrap.classList.add('muted');
        }
      });
    }

    if (volSlider) {
      let isVolDragging = false;

      const calcVolumeFromEvent = (clientX) => {
        const rect = volSlider.getBoundingClientRect();
        if (rect.width <= 0) return 0;
        const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        return offsetX / rect.width;
      };

      volSlider.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isVolDragging = true;
        setVolume(calcVolumeFromEvent(e.clientX));

        const onVolMouseMove = (moveEvent) => {
          if (!isVolDragging) return;
          setVolume(calcVolumeFromEvent(moveEvent.clientX));
        };

        const onVolMouseUp = () => {
          isVolDragging = false;
          window.removeEventListener('mousemove', onVolMouseMove);
          window.removeEventListener('mouseup', onVolMouseUp);
        };

        window.addEventListener('mousemove', onVolMouseMove);
        window.addEventListener('mouseup', onVolMouseUp);
      });

      // Keyboard support for accessibility
      volSlider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          setVolume(audio.volume + 0.1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          setVolume(audio.volume - 0.1);
        }
      });
    }
  });
}

/* ==========================================================================
   Voice Demos Category Filter Tabs
   ========================================================================== */
function initAudioFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-tab-btn');
  const demoCards = document.querySelectorAll('.demo-card');
  if (!filterBtns.length || !demoCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      demoCards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        if (filter === 'all' || cardType === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Active Navigation Scroll Spy
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   Contact Copy Actions
   ========================================================================== */
function initContactActions() {
  const copyElements = document.querySelectorAll('[data-copy]');
  copyElements.forEach(el => {
    el.addEventListener('click', () => {
      const textToCopy = el.getAttribute('data-copy');
      if (textToCopy && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalTitle = el.getAttribute('title') || '';
          el.setAttribute('title', 'Copied to clipboard');
          
          const tooltip = document.createElement('span');
          tooltip.className = 'copy-tooltip-toast';
          tooltip.textContent = 'Copied!';
          tooltip.style.cssText = `
            position: absolute;
            top: -28px;
            right: 10px;
            background: #0066FF;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            pointer-events: none;
            z-index: 10;
          `;
          el.style.position = 'relative';
          el.appendChild(tooltip);

          setTimeout(() => {
            if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
            el.setAttribute('title', originalTitle);
          }, 1500);
        });
      }
    });
  });
}
