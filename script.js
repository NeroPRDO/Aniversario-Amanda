/*
  ==========================================================
  CONFIGURAÇÕES PRINCIPAIS DO SITE
  ==========================================================
  Altere aqui os links, caminhos e mensagem do WhatsApp.
*/

const CONFIG = {
  coverImagePath: './assets/convite-capa.jpg',
  introVideoPath: './assets/abertura-amanda.mp4',
  backgroundImagePath: './assets/fundo-geral.jpg',

  mapsLink:
    'https://www.google.com/maps/place/Campo+Verde+Festas+e+Eventos/@-25.3487474,-49.5089495,17z/data=!4m6!3m5!1s0x94dd236a73d05c59:0x5b82aa65365ffb58!8m2!3d-25.3489704!4d-49.5081448!16s%2Fg%2F11cllkbhhd?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D',

  mapEmbed:
    'https://www.google.com/maps?q=-25.3489704,-49.5081448&z=17&output=embed',

  whatsappPhoneDigits: '554184321632',

  whatsappMessage:
    'Olá! Gostaria de confirmar minha presença na festa de 15 anos da Amanda Bortolan.',

  videoEndDelay: 700,
};

/*
  ==========================================================
  ELEMENTOS DA PÁGINA
  ==========================================================
*/

const body = document.body;

const coverScreen = document.getElementById('coverScreen');
const videoOverlay = document.getElementById('videoOverlay');
const siteShell = document.getElementById('siteShell');

const coverImage = document.getElementById('coverImage');
const watchIntroButton = document.getElementById('watchIntroButton');
const skipIntroButton = document.getElementById('skipIntroButton');

const introVideo = document.getElementById('introVideo');
const videoFallback = document.getElementById('videoFallback');
const fallbackEnterButton = document.getElementById('fallbackEnterButton');
const fallbackBackButton = document.getElementById('fallbackBackButton');

const mapsButton = document.getElementById('mapsButton');
const rsvpButton = document.getElementById('rsvpButton');
const eventMap = document.getElementById('eventMap');

let rsvpLink = '';

/*
  ==========================================================
  LINKS E CONFIGURAÇÕES DINÂMICAS
  ==========================================================
*/

function createWhatsAppLink(phoneDigits, message) {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneDigits}?text=${encodedMessage}`;
}

function applyConfig() {
  if (coverImage && CONFIG.coverImagePath) {
    coverImage.src = CONFIG.coverImagePath;
  }

  const videoSource = introVideo?.querySelector('source');
  if (videoSource && CONFIG.introVideoPath) {
    videoSource.src = CONFIG.introVideoPath;
    introVideo.load();
  }

  if (mapsButton) {
    mapsButton.href = CONFIG.mapsLink;
  }

  if (eventMap) {
    eventMap.src = CONFIG.mapEmbed;
  }

  if (rsvpButton) {
    rsvpLink = createWhatsAppLink(
      CONFIG.whatsappPhoneDigits,
      CONFIG.whatsappMessage
    );
    rsvpButton.href = rsvpLink;
  }
}


function handleRsvpClick(event) {
  if (!rsvpLink) return;

  const isTouchDevice =
    window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) return;

  event.preventDefault();
  window.location.href = rsvpLink;
}

/*
  ==========================================================
  ABERTURA DA CAPA / VÍDEO / SITE
  ==========================================================
*/

function revealSite() {
  coverScreen.classList.remove('is-active');
  videoOverlay.classList.remove('is-active');

  body.classList.remove('is-locked');
  siteShell.classList.add('is-visible');

  runRevealAnimation();
}

function showCover() {
  videoOverlay.classList.remove('is-active');
  coverScreen.classList.add('is-active');
}

function openVideoIntro() {
  coverScreen.classList.remove('is-active');
  videoOverlay.classList.add('is-active');
  videoFallback.style.display = 'none';

  const hasVideoSource = introVideo?.querySelector('source')?.getAttribute('src');

  if (!hasVideoSource) {
    videoFallback.style.display = 'block';
    return;
  }

  const playAttempt = introVideo.play();

  if (playAttempt && typeof playAttempt.then === 'function') {
    playAttempt.catch(() => {
      videoFallback.style.display = 'block';
    });
  }
}

/*
  ==========================================================
  ANIMAÇÃO DE REVEAL DOS BLOCOS
  ==========================================================
*/

function runRevealAnimation() {
  const revealItems = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

/*
  ==========================================================
  EVENTOS
  ==========================================================
*/

watchIntroButton?.addEventListener('click', openVideoIntro);
skipIntroButton?.addEventListener('click', revealSite);

fallbackEnterButton?.addEventListener('click', revealSite);
fallbackBackButton?.addEventListener('click', showCover);
rsvpButton?.addEventListener('click', handleRsvpClick);

introVideo?.addEventListener('ended', () => {
  setTimeout(revealSite, CONFIG.videoEndDelay);
});

introVideo?.addEventListener('error', () => {
  videoFallback.style.display = 'block';
});

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
});
