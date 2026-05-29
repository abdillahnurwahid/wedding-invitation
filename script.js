/* ============================================================
   WEDDING INVITATION — script.js
   ============================================================ */

/* ============================================================
   1. URL PARAMETER — Guest Name Personalisation
   Format URL: https://ruhillah-ramadhan.vercel.app/Bapak-Budi
   ============================================================ */
function getGuestNameFromPath() {
  try {
    const url = new URL(window.location.href);
    let path = url.pathname;
    if (path.endsWith("/")) path = path.slice(0, -1);
    const segments = path.split("/").filter(Boolean);
    const last = segments.pop() || "";
    if (!last) return "";
    let decoded = decodeURIComponent(last);
    decoded = decoded.replace(/-/g, " ");
    return decoded;
  } catch (e) {
    return "";
  }
}

const guestName      = getGuestNameFromPath();
const guestNameEl    = document.getElementById("guestName");
const guestLabelEl   = document.getElementById("guestLabel");

if (guestName && guestNameEl) {
  guestNameEl.textContent = guestName;
} else if (guestNameEl) {
  guestNameEl.textContent = "Tamu Undangan";
}

/* ============================================================
   2. FALLING PETALS
   ============================================================ */
(function createPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  const count = window.innerWidth < 600 ? 12 : 22;

  for (let i = 0; i < count; i++) {
    const p        = document.createElement('div');
    p.className    = 'petal';
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
   3. COVER PARALLAX
   ============================================================ */
const coverBg = document.getElementById('coverBg');

if (coverBg) {
  setTimeout(() => coverBg.classList.add('zoomed'), 100);

  document.addEventListener('mousemove', (e) => {
    const xPct = (e.clientX / window.innerWidth  - 0.5) * 8;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 8;
    coverBg.style.transform = `translate(${xPct}px, ${yPct}px) scale(1.08)`;
  });

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      const x = Math.min(Math.max(e.gamma || 0, -20), 20) * 0.2;
      const y = Math.min(Math.max(e.beta  || 0, -20), 20) * 0.2;
      coverBg.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
    });
  }
}

/* ============================================================
   4. OPEN INVITATION BUTTON
   ============================================================ */
const cover   = document.getElementById('cover');
const main    = document.getElementById('main');
const openBtn = document.getElementById('openBtn');
const audio   = document.getElementById('audio');

openBtn.addEventListener('click', () => {
  cover.classList.add('hide');

  setTimeout(() => {
    cover.style.display = 'none';
  }, 950);

  main.classList.remove('hidden');
  void main.offsetHeight;
  main.style.opacity = '1';

  attemptPlay();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Tunggu animasi cover selesai (950ms) baru init observer
  setTimeout(initObserver, 1000);
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
  if (!audio) return;
  const promise = audio.play();
  if (promise !== undefined) {
    promise
      .then(() => setPlayState(true))
      .catch(() => setPlayState(false));
  }
}

function setPlayState(playing) {
  isPlaying = playing;
  if (iconPlay)  iconPlay.style.display  = playing ? 'none'  : 'block';
  if (iconPause) iconPause.style.display = playing ? 'block' : 'none';
  if (musicWave) {
    playing ? musicWave.classList.add('playing') : musicWave.classList.remove('playing');
  }
}

if (musicBtn) {
  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      setPlayState(false);
    } else {
      audio.play().then(() => setPlayState(true)).catch(() => {});
    }
  });
}

if (audio) {
  audio.addEventListener('pause', () => setPlayState(false));
  audio.addEventListener('play',  () => setPlayState(true));
}

/* ============================================================
   6. COUNTDOWN TIMER
   ============================================================ */
const WEDDING_DATE = new Date('2026-06-07T09:00:00');

const daysEl        = document.getElementById('days');
const hoursEl       = document.getElementById('hours');
const minutesEl     = document.getElementById('minutes');
const secondsEl     = document.getElementById('seconds');
const countdownEl   = document.getElementById('countdown');
const countdownDone = document.getElementById('countdownDone');

function pad(n) { return String(n).padStart(2, '0'); }

function tickFlip(el, newVal) {
  if (!el) return;
  if (el.textContent !== newVal) {
    el.textContent = newVal;
    el.classList.add('tick');
    setTimeout(() => el.classList.remove('tick'), 300);
  }
}

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  if (diff <= 0) {
    if (countdownEl)   countdownEl.classList.add('hidden');
    if (countdownDone) countdownDone.classList.remove('hidden');
    return;
  }
  tickFlip(daysEl,    pad(Math.floor(diff / 86400000)));
  tickFlip(hoursEl,   pad(Math.floor((diff % 86400000) / 3600000)));
  tickFlip(minutesEl, pad(Math.floor((diff % 3600000) / 60000)));
  tickFlip(secondsEl, pad(Math.floor((diff % 60000) / 1000)));
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
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
);

function initObserver() {
  document.querySelectorAll('#main .fade-in').forEach((el) => observer.observe(el));
}

// Jika main sudah visible (misal refresh saat dev)
if (main && !main.classList.contains('hidden')) {
  initObserver();
}

/* ============================================================
   8. COUNTDOWN SECTION observer
   ============================================================ */
const countdownSection = document.querySelector('.countdown-section');
if (countdownSection) {
  const cdObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countdownSection.classList.add('visible');
        cdObs.unobserve(countdownSection);
      }
    });
  }, { threshold: 0.15 });
  cdObs.observe(countdownSection);
}

/* ============================================================
   9. SMOOTH SCROLL
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
   10. GALLERY LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(30,15,5,0.92);
    display:none;align-items:center;justify-content:center;
    cursor:zoom-out;opacity:0;
    transition:opacity 0.35s ease;
    padding:1rem;
    backdrop-filter:blur(8px);
  `;

  const lightImg = document.createElement('img');
  lightImg.style.cssText = `
    max-width:90vw;max-height:88vh;
    border-radius:8px;
    box-shadow:0 20px 80px rgba(0,0,0,0.5);
    object-fit:contain;
    transform:scale(0.92);
    transition:transform 0.35s ease;
    pointer-events:none;
  `;

  const closeHint = document.createElement('p');
  closeHint.textContent = 'Klik di mana saja untuk menutup';
  closeHint.style.cssText = `
    position:fixed;bottom:1.5rem;left:50%;
    transform:translateX(-50%);
    color:rgba(255,255,255,0.45);
    font-family:'Jost',sans-serif;
    font-size:0.72rem;letter-spacing:0.15em;
    text-transform:uppercase;pointer-events:none;
  `;

  overlay.appendChild(lightImg);
  overlay.appendChild(closeHint);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    lightImg.src = src;
    lightImg.alt = alt;
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
})();