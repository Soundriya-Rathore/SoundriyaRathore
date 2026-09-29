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
  initScrollProgressBar();
  initScrollReveals();
  initMetricsCounter();
  initFloatingBackToTop();
  initHeroPerspectiveTilt();
  initCardSpotlightHover();
  initAudioPlayers();
  initAudioFilterTabs();
  initYouTubeVideoPlayers();
  initShortsToggle();
  initArticlesAccordion();
  initMicModal();
  initBookingTools();
  initScrollSpy();
  initContactActions();
  autoSyncLiveYouTube();

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
   Mobile Navigation Drawer & Full Backdrop Dimmer
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navBackdrop = document.getElementById('nav-backdrop');
  if (!toggleBtn || !navMenu) return;

  const hamburgerIcon = toggleBtn.querySelector('.hamburger-icon');
  const closeIcon = toggleBtn.querySelector('.close-icon');

  const updateToggleIcons = (isOpen) => {
    if (hamburgerIcon && closeIcon) {
      hamburgerIcon.style.display = isOpen ? 'none' : 'block';
      closeIcon.style.display = isOpen ? 'block' : 'none';
    }
  };

  const closeMenu = () => {
    navMenu.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    updateToggleIcons(false);
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    navMenu.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    updateToggleIcons(true);
    document.body.style.overflow = 'hidden';
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeMenu);
  }

  const navLinks = navMenu.querySelectorAll('.nav-link, .mobile-contact-btn a');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
      closeMenu();
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

  // Universal Close modals
  const closeModal = () => {
    if (videoModal) {
      videoModal.classList.remove('open');
      if (videoModalIframe) videoModalIframe.src = '';
    }
    const micModal = document.getElementById('mic-modal');
    if (micModal) micModal.classList.remove('open');
    document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));

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
    // 3. Mohenjo-daro (Deep historical bass, measured cadence)
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

    // Keyboard Controls: Space to toggle play/pause, Left/Right arrow to seek 5s
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && (e.target === card || e.target === playBtn)) {
        e.preventDefault();
        if (playBtn) playBtn.click();
      } else if (e.code === 'ArrowLeft' && (e.target === card || card.contains(e.target))) {
        e.preventDefault();
        if (rewindBtn) rewindBtn.click();
      } else if (e.code === 'ArrowRight' && (e.target === card || card.contains(e.target))) {
        e.preventDefault();
        if (forwardBtn) forwardBtn.click();
      }
    });

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

      // Mobile Touch support for volume slider
      volSlider.addEventListener('touchstart', (e) => {
        if (!e.touches.length) return;
        isVolDragging = true;
        setVolume(calcVolumeFromEvent(e.touches[0].clientX));
      }, { passive: true });

      volSlider.addEventListener('touchmove', (e) => {
        if (!isVolDragging || !e.touches.length) return;
        setVolume(calcVolumeFromEvent(e.touches[0].clientX));
      }, { passive: true });

      volSlider.addEventListener('touchend', () => {
        isVolDragging = false;
      });
      volSlider.addEventListener('touchcancel', () => {
        isVolDragging = false;
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

/* ==========================================================================
   High-Conversion Booking Tools (Audition Request, Session Booking, EPK)
   ========================================================================== */
function initBookingTools() {
  const auditionModal = document.getElementById('audition-modal');
  const sessionModal = document.getElementById('session-modal');
  const epkModal = document.getElementById('epk-modal');

  // Open Audition Modal triggers
  document.querySelectorAll('[data-open-audition-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (auditionModal) {
        auditionModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Open Session Modal triggers
  document.querySelectorAll('[data-open-session-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (sessionModal) {
        sessionModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Open EPK Modal triggers
  document.querySelectorAll('[data-open-epk-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (epkModal) {
        epkModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // EPK Print / Save as PDF Button
  const epkPrintBtn = document.getElementById('epk-print-btn');
  if (epkPrintBtn) {
    epkPrintBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 1. Audition Form Handling
  const auditionForm = document.getElementById('audition-request-form');
  const auditionSendWa = document.getElementById('audition-send-wa');
  const auditionSuccess = document.getElementById('audition-success-msg');

  const getAuditionData = () => {
    const name = document.getElementById('audition-name')?.value.trim() || 'Client';
    const email = document.getElementById('audition-email')?.value.trim() || '';
    const script = document.getElementById('audition-script')?.value.trim() || '';
    const notes = document.getElementById('audition-notes')?.value.trim() || 'None';
    const selectedTone = document.querySelector('input[name="audition-tone"]:checked')?.value || 'Commercial';
    return { name, email, script, notes, tone: selectedTone };
  };

  if (auditionSendWa) {
    auditionSendWa.addEventListener('click', () => {
      const data = getAuditionData();
      if (!data.script || !data.email) {
        alert('Please enter your email and script excerpt so Soundriya can record your sample.');
        return;
      }
      const message = `*Custom Audition Request for Soundriya Rathore*\n\n*Client / Agency:* ${data.name}\n*Email:* ${data.email}\n*Desired Tone:* ${data.tone}\n*Script Excerpt:*\n"${data.script}"\n\n*Notes:* ${data.notes}\n\n_Sent via soundriyarathore.vercel.app_`;
      const waUrl = `https://wa.me/918107849819?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      if (auditionSuccess) {
        auditionSuccess.style.display = 'block';
        auditionSuccess.textContent = 'Opening WhatsApp with your audition script! Soundriya will deliver your sample within 24 hours.';
      }
    });
  }

  if (auditionForm) {
    auditionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getAuditionData();
      const subject = `Custom 15-Sec Audition Request - ${data.name}`;
      const body = `Hi Soundriya,\n\nI would like to request a complimentary 15-second vocal audition for our project:\n\nClient / Agency: ${data.name}\nEmail for MP3: ${data.email}\nDesired Tone: ${data.tone}\n\nScript Excerpt:\n"${data.script}"\n\nPronunciation/Pacing Notes:\n${data.notes}\n\nThank you!`;
      const mailtoUrl = `mailto:Soundriyarathore221@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      if (auditionSuccess) {
        auditionSuccess.style.display = 'block';
        auditionSuccess.textContent = 'Opening email client! Your audition details are populated. Send the email and Soundriya will reply with your custom sample.';
      }
    });
  }

  // 2. Session Booking Form Handling
  const sessionForm = document.getElementById('session-request-form');
  const sessionSendWa = document.getElementById('session-send-wa');
  const sessionSuccess = document.getElementById('session-success-msg');

  const getSessionData = () => {
    const director = document.getElementById('session-director')?.value.trim() || 'Director';
    const email = document.getElementById('session-email')?.value.trim() || '';
    const date = document.getElementById('session-date')?.value || 'Upcoming';
    const time = document.getElementById('session-time')?.value || 'Afternoon';
    const platform = document.getElementById('session-platform')?.value || 'Cleanfeed';
    const project = document.getElementById('session-project')?.value.trim() || 'Voiceover Session';
    return { director, email, date, time, platform, project };
  };

  if (sessionSendWa) {
    sessionSendWa.addEventListener('click', () => {
      const data = getSessionData();
      if (!data.director || !data.email || !data.date) {
        alert('Please fill in your name, email, and preferred date.');
        return;
      }
      const message = `*Live Directed Session Booking Request*\n\n*Director / Agency:* ${data.director}\n*Email:* ${data.email}\n*Preferred Date:* ${data.date}\n*Time Window:* ${data.time}\n*Remote Platform:* ${data.platform}\n*Project Details:* ${data.project}\n\n_Sent via soundriyarathore.vercel.app_`;
      const waUrl = `https://wa.me/918107849819?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
      if (sessionSuccess) {
        sessionSuccess.style.display = 'block';
        sessionSuccess.textContent = 'Opening WhatsApp with your session details to confirm Soundriya\'s calendar!';
      }
    });
  }

  if (sessionForm) {
    sessionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getSessionData();
      const subject = `Live Directed Session Booking Request - ${data.director}`;
      const body = `Hi Soundriya,\n\nWe would like to book a live directed recording session with you:\n\nDirector / Agency: ${data.director}\nEmail: ${data.email}\nPreferred Date: ${data.date}\nTime Window: ${data.time}\nPlatform: ${data.platform}\nProject: ${data.project}\n\nPlease confirm availability and send the session link.\n\nThank you!`;
      const mailtoUrl = `mailto:Soundriyarathore221@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      if (sessionSuccess) {
        sessionSuccess.style.display = 'block';
        sessionSuccess.textContent = 'Opening email client! Your session booking request is populated.';
      }
    });
  }
}

/* ==========================================================================
   Live Auto-Sync Latest YouTube Uploads via Serverless / Edge API
   (Automatically brings in newly published videos and shorts without editing code)
   ========================================================================== */
async function autoSyncLiveYouTube() {
  const videosGrid = document.getElementById('featured-videos-grid');
  const shortsGrid = document.getElementById('shorts-grid-container');
  if (!videosGrid) return;

  try {
    const res = await fetch('/api/videos');
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.success) return;

    // Collect currently rendered video IDs from iframes and links
    const existingIds = new Set();
    document.querySelectorAll('.video-card iframe, .video-card a[href*="youtu"]').forEach(el => {
      const match = (el.src || el.href || '').match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) existingIds.add(match[1]);
    });

    // Check for newly published featured videos not yet in DOM
    if (data.featuredVideos && data.featuredVideos.length > 0) {
      // Reverse so newest appears first
      [...data.featuredVideos].reverse().forEach(v => {
        if (!existingIds.has(v.id) && v.id !== 'E0j9MgTL14U') {
          existingIds.add(v.id);
          const article = document.createElement('article');
          article.className = 'video-card new-video-entry';
          article.innerHTML = `
            <div class="video-container-16x9">
              <iframe 
                src="https://www.youtube-nocookie.com/embed/${v.id}?rel=0&amp;playsinline=1" 
                title="${v.title} - Soundriya Rathore" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen 
                loading="lazy">
              </iframe>
            </div>
            <div class="video-card-info">
              <span class="video-card-badge" style="background: var(--blue-primary); color: #FFFFFF; font-weight: 700;">
                <span class="pulse-dot" style="background: #FFFFFF; width: 6px; height: 6px;" aria-hidden="true"></span>
                Latest Report
              </span>
              <h4 class="video-card-name">${v.title}</h4>
              <div class="video-card-footer">
                <span>In-Page Player</span>
                <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="watch-link">
                  YouTube &rarr;
                </a>
              </div>
            </div>
          `;
          videosGrid.prepend(article);
        }
      });
    }

    // Check for newly published shorts not yet in DOM
    if (shortsGrid && data.shorts && data.shorts.length > 0) {
      const existingShortIds = new Set();
      shortsGrid.querySelectorAll('iframe, a').forEach(el => {
        const match = (el.src || el.href || '').match(/(?:embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
        if (match) existingShortIds.add(match[1]);
      });

      [...data.shorts].reverse().forEach(s => {
        if (!existingShortIds.has(s.id)) {
          existingShortIds.add(s.id);
          const article = document.createElement('article');
          article.className = 'short-card new-short-entry';
          article.innerHTML = `
            <div class="short-media-9x16">
              <iframe 
                src="https://www.youtube-nocookie.com/embed/${s.id}?rel=0&amp;playsinline=1" 
                title="${s.title} - Soundriya Rathore" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen 
                loading="lazy">
              </iframe>
            </div>
            <div class="short-info">
              <span class="short-label" style="color: var(--blue-primary); font-weight: 700;">Latest Short</span>
              <h4 class="short-name">${s.title}</h4>
            </div>
          `;
          shortsGrid.prepend(article);
        }
      });
    }
  } catch (err) {
    // Graceful silent fallback for local file:// mode or network offline
    console.debug('Live YouTube sync running in offline/static mode');
  }
}

/* ==========================================================================
   Modern Cinematic Motion & Interactive Enhancements
   ========================================================================== */

/**
 * 1. Precision Top Scroll / Reading Progress Bar
 */
function initScrollProgressBar() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  let ticking = false;
  const updateProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / totalHeight)) : 0;
    bar.style.transform = `scaleX(${progress})`;
    bar.setAttribute('aria-valuenow', Math.round(progress * 100));
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 2. Fluid Scroll-Driven Staggered Reveals
 */
function initScrollReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  // Auto-register key sections and card groups
  const targets = [
    '.section-title-wrap',
    '.showreel-featured-card',
    '.about-grid',
    '.about-brands-block',
    '.articles-sheet-container',
    '.contact-hub-card'
  ];

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('reveal-on-scroll'));
  });

  // Stagger grid children
  const grids = [
    { container: '.demos-grid', items: '.demo-card' },
    { container: '#featured-videos-grid', items: '.video-card' },
    { container: '.specs-grid-wrapper', items: '.spec-card' },
    { container: '.services-grid', items: '.service-card' },
    { container: '.square-cards-row', items: '.square-exp-card' },
    { container: '.contact-channels-grid', items: '.contact-channel-card' }
  ];

  grids.forEach(({ container, items }) => {
    const parent = document.querySelector(container);
    if (!parent) return;
    const childList = parent.querySelectorAll(items);
    childList.forEach((child, idx) => {
      child.classList.add('reveal-on-scroll');
      child.style.transitionDelay = `${(idx % 6) * 0.08}s`;
    });
  });

  // Intersection Observer for scroll triggers
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

/**
 * 3. Animated Career Metrics & Experience Counters
 */
function initMetricsCounter() {
  const metricItems = document.querySelectorAll('.metric-item');
  if (!metricItems.length) return;

  const animateNumber = (el, target, duration = 1400) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl = entry.target.querySelector('.metric-number');
        if (numEl) {
          const target = parseInt(numEl.getAttribute('data-target'), 10) || 0;
          animateNumber(numEl, target);
        }
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.25
  });

  metricItems.forEach(item => observer.observe(item));
}

/**
 * 4. Floating Glassmorphic Back to Top Action
 */
function initFloatingBackToTop() {
  const btn = document.getElementById('floating-back-to-top');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 5. Hero Portrait 3D Micro-Perspective Tilt
 */
function initHeroPerspectiveTilt() {
  const card = document.querySelector('.hero-image-card');
  if (!card || window.matchMedia('(hover: none)').matches) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Max 3.5 deg tilt
    const rotateX = -(y / (rect.height / 2)) * 3.5;
    const rotateY = (x / (rect.width / 2)) * 3.5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

/**
 * 6. Dynamic Card Spotlight Cursor Hover
 */
function initCardSpotlightHover() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.demo-card, .video-card, .service-card, .spec-card, .metric-item');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}


