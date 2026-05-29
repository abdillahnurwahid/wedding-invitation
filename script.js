/* ============================================================
   WEDDING INVITATION — script.js
   Aryan & Sekar | Premium Digital Wedding Card
   ============================================================ */

/* ============================================================
   1. URL PARAMETER — Guest Name Personalisation
   ============================================================ */
function getGuestNameFromPath() {
  try {
    const url = new URL(window.location.href);
    let path = url.pathname; // contoh: "/Bapak-Budi"
    // Hilangkan trailing slash
    if (path.endsWith("/")) path = path.slice(0, -1);
    // Ambil segmen terakhir
    const segments = path.split("/").filter(Boolean);
    const last = segments.pop() || "";
    if (!last) return "";

    // Decode dari URL (Bapak-Budi%20Sutanto → Bapak-Budi Sutanto)
    let decoded = decodeURIComponent(last);

    // Opsional: ubah tanda "-" jadi spasi, biar lebih manusiawi
    decoded = decoded.replace(/-/g, " ");

    return decoded;
  } catch (e) {
    return "";
  }
}

// Set nama tamu di cover & main
const guestName = getGuestNameFromPath();
const guestNameCoverEl = document.getElementById("guest-name-cover");
const guestNameMainEl = document.getElementById("guest-name-main");
const guestLineEl = document.getElementById("guest-line");

if (guestName && guestNameCoverEl && guestNameMainEl) {
  guestNameCoverEl.textContent = guestName;
  guestNameMainEl.textContent = guestName;
} else if (guestLineEl) {
  // Kalau tidak ada nama di URL, bisa tetap ditampilkan "Tamu Undangan"
  guestLineEl.classList.add("hidden");
}

/* ============================================================
   2. FALLING PETALS (purely decorative)
   ============================================================ */
(function createPetals() {
  const container = document.getElementById('petals');
  const count     = window.innerWidth < 600 ? 12 : 22;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'petal';

    const size     = 8 + Math.random() * 10;
    const left     = Math.random() * 100;
    const duration = 6 + Math.random() * 10;
    const delay    = Math.random() * 12;
    const hue      = Math.random() > 0.5 ? '255,200,180' : '230,170,150';

    p.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 1.4}px;
      background: rgba(${hue}, ${0.3 + Math.random() * 0.35});
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      border-radius: ${Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%'};
      transform: rotate(${Math.random() * 360}deg);
    `;
    container.appendChild(p);
  }
})();

/* ============================================================
   3. COVER PARALLAX on mouse / device tilt
   ============================================================ */
const coverBg = document.getElementById('coverBg');

// Kick off subtle zoom animation
setTimeout(() => coverBg.classList.add('zoomed'), 100);

// Mouse parallax (desktop)
document.addEventListener('mousemove', (e) => {
  const xPct = (e.clientX / window.innerWidth  - 0.5) * 8;  // ±4 %
  const yPct = (e.clientY / window.innerHeight - 0.5) * 8;
  coverBg.style.transform = `translate(${xPct}px, ${yPct}px) scale(1.08)`;
});

// Device tilt parallax (mobile)
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (e) => {
    const x = Math.min(Math.max(e.gamma || 0, -20), 20) * 0.2;
    const y = Math.min(Math.max(e.beta  || 0, -20), 20) * 0.2;
    coverBg.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
  });
}

/* ============================================================
   4. OPEN INVITATION BUTTON — show main, start music
   ============================================================ */
const cover    = document.getElementById('cover');
const main     = document.getElementById('main');
const openBtn  = document.getElementById('openBtn');
const audio    = document.getElementById('audio');

openBtn.addEventListener('click', () => {
  // 1. Animate cover out
  cover.classList.add('hide');

  // 2. After transition, remove from flow (still accessible for screen readers)
  setTimeout(() => {
    cover.style.display = 'none';
  }, 950);

  // 3. Show main content
  main.classList.remove('hidden');
  // Force reflow before transition
  void main.offsetHeight;
  main.style.opacity = '1';

  // 4. Play music
  attemptPlay();

  // 5. Scroll to top of main
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   5. MUSIC PLAYER
   ============================================================ */
const musicBtn  = document.getElementById('musicBtn');
const iconPlay  = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const musicWave = document.querySelector('.music-wave');

let isPlaying = false;

function attemptPlay() {
  const promise = audio.play();
  if (promise !== undefined) {
    promise
      .then(() => { setPlayState(true); })
      .catch(() => { setPlayState(false); }); // Autoplay blocked — user must tap
  }
}

function setPlayState(playing) {
  isPlaying = playing;
  iconPlay.style.display  = playing ? 'none'  : 'block';
  iconPause.style.display = playing ? 'block' : 'none';
  if (playing) {
    musicWave.classList.add('playing');
  } else {
    musicWave.classList.remove('playing');
  }
}

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    audio.pause();
    setPlayState(false);
  } else {
    audio.play().then(() => setPlayState(true)).catch(() => {});
  }
});

// Sync state if audio is paused externally (e.g. by OS)
audio.addEventListener('pause', () => setPlayState(false));
audio.addEventListener('play',  () => setPlayState(true));

/* ============================================================
   6. COUNTDOWN TIMER
   ============================================================ */
const WEDDING_DATE = new Date('2026-06-07T08:00:00');  // ← Ganti tanggal di sini

const daysEl    = document.getElementById('days');
const hoursEl   = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const countdownEl   = document.getElementById('countdown');
const countdownDone = document.getElementById('countdownDone');

function pad(n) { return String(n).padStart(2, '0'); }

function tickFlip(el, newVal) {
  if (el.textContent !== newVal) {
    el.textContent = newVal;
    el.classList.add('tick');
    setTimeout(() => el.classList.remove('tick'), 300);
  }
}

function updateCountdown() {
  const now  = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    countdownEl.classList.add('hidden');
    countdownDone.classList.remove('hidden');
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  tickFlip(daysEl,    pad(days));
  tickFlip(hoursEl,   pad(hours));
  tickFlip(minutesEl, pad(minutes));
  tickFlip(secondsEl, pad(seconds));
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ============================================================
   7. INTERSECTION OBSERVER — fade-in on scroll
   ============================================================ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after first trigger for performance
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  }
);

// Observe all fade-in elements inside #main
function initObserver() {
  document.querySelectorAll('#main .fade-in').forEach((el) => observer.observe(el));
}

// Run after cover is dismissed (main becomes visible)
openBtn.addEventListener('click', () => {
  setTimeout(initObserver, 1000);
});

// Also trigger immediately if somehow already visible (dev/refresh)
if (!main.classList.contains('hidden')) {
  initObserver();
}

/* ============================================================
   8. SMOOTH SCROLL (fallback for old browsers)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   9. GALLERY — simple lightbox (click to enlarge)
   ============================================================ */
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(30,15,5,0.92);
    display: flex; align-items: center; justify-content: center;
    cursor: zoom-out; opacity: 0;
    transition: opacity 0.35s ease;
    padding: 1rem;
    backdrop-filter: blur(8px);
  `;

  const lightImg = document.createElement('img');
  lightImg.style.cssText = `
    max-width: 90vw; max-height: 88vh;
    border-radius: 8px;
    box-shadow: 0 20px 80px rgba(0,0,0,0.5);
    object-fit: contain;
    transform: scale(0.92);
    transition: transform 0.35s ease;
    pointer-events: none;
  `;

  const closeHint = document.createElement('p');
  closeHint.textContent = 'Klik di mana saja untuk menutup';
  closeHint.style.cssText = `
    position: fixed; bottom: 1.5rem; left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.45);
    font-family: 'Jost', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    pointer-events: none;
  `;

  overlay.appendChild(lightImg);
  overlay.appendChild(closeHint);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    lightImg.src  = src;
    lightImg.alt  = alt;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    void overlay.offsetHeight;
    overlay.style.opacity = '1';
    lightImg.style.transform = 'scale(1)';
  }

  function closeLightbox() {
    overlay.style.opacity = '0';
    lightImg.style.transform = 'scale(0.92)';
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 350);
  }

  items.forEach((item) => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
  });

  overlay.addEventListener('click', closeLightbox);

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ============================================================
   10. COUNTDOWN SECTION visibility trigger  
       (so numbers animate in correctly on first view)
   ============================================================ */
const countdownSection = document.querySelector('.countdown-section');
if (countdownSection) {
  const cdObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countdownSection.classList.add('visible');
        cdObserver.unobserve(countdownSection);
      }
    });
  }, { threshold: 0.15 });
  cdObserver.observe(countdownSection);
}