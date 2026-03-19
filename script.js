/*
  ==========================================================
  CONFIGURAÇÕES PRINCIPAIS DO SITE
  ==========================================================
  Altere aqui os links, caminhos, mensagem do WhatsApp e a música.
*/

const CONFIG = {
  coverImagePath: 'assets/convite-capa.jpg',
  introVideoDesktopPath: 'assets/abertura-amanda-desktop.mp4',
  introVideoMobilePath: 'assets/abertura-amanda-mobile.mp4',
  backgroundImagePath: 'assets/fundo-geral.jpg',
  backgroundAudioPath: 'assets/trilha-site.mp3',

  mapsLink:
    'https://www.google.com/maps/place/Campo+Verde+Festas+e+Eventos/@-25.3487474,-49.5089495,17z/data=!4m6!3m5!1s0x94dd236a73d05c59:0x5b82aa65365ffb58!8m2!3d-25.3489704!4d-49.5081448!16s%2Fg%2F11cllkbhhd?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D',

  mapEmbed:
    'https://www.google.com/maps?q=-25.3489704,-49.5081448&z=17&output=embed',

  whatsappPhoneDigits: '554184321632',

  whatsappMessage:
    'Olá! Gostaria de confirmar minha presença na festa de 15 anos da Amanda Bortolan.',

  videoEndDelay: 700,
  videoFadeOutDuration: 850,
  siteRevealDelay: 120,
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

const introVideoDesktop = document.getElementById('introVideoDesktop');
const introVideoMobile = document.getElementById('introVideoMobile');
const videoFallback = document.getElementById('videoFallback');
const fallbackEnterButton = document.getElementById('fallbackEnterButton');
const fallbackBackButton = document.getElementById('fallbackBackButton');

const backgroundAudio = document.getElementById('backgroundAudio');
const audioToggleButton = document.getElementById('audioToggleButton');
const audioToggleLabel = audioToggleButton?.querySelector('.audio-toggle__label');

const mapsButton = document.getElementById('mapsButton');
const rsvpButton = document.getElementById('rsvpButton');
const eventMap = document.getElementById('eventMap');

let activeIntroVideo = null;
let isRevealingSite = false;
let revealObserverInitialized = false;
let audioHasBeenUnlocked = false;
let audioShouldBePlaying = true;

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

  const desktopSource = introVideoDesktop?.querySelector('source');
  if (desktopSource && CONFIG.introVideoDesktopPath) {
    desktopSource.src = CONFIG.introVideoDesktopPath;
    introVideoDesktop.load();
  }

  const mobileSource = introVideoMobile?.querySelector('source');
  if (mobileSource && CONFIG.introVideoMobilePath) {
    mobileSource.src = CONFIG.introVideoMobilePath;
    introVideoMobile.load();
  }

  const audioSource = backgroundAudio?.querySelector('source');
  if (audioSource && CONFIG.backgroundAudioPath) {
    audioSource.src = CONFIG.backgroundAudioPath;
    backgroundAudio.load();
  }

  if (mapsButton) {
    mapsButton.href = CONFIG.mapsLink;
  }

  if (eventMap) {
    eventMap.src = CONFIG.mapEmbed;
  }

  if (rsvpButton) {
    rsvpButton.href = createWhatsAppLink(
      CONFIG.whatsappPhoneDigits,
      CONFIG.whatsappMessage
    );
  }

  updateAudioToggleUI();
}

/*
  ==========================================================
  CONTROLE DE ROLAGEM / TOPO DA PÁGINA
  ==========================================================
  O navegador pode tentar restaurar a rolagem anterior quando a página abre.
  Como a capa é fixa e o site real já está por trás dela, isso pode dar a
  impressão de que o conteúdo abre "um pouco scrollado". Por isso forçamos
  o topo sempre que a experiência muda de etapa.
*/

function forceScrollTop() {
  document.activeElement?.blur?.();
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });

  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 120);
}

/*
  ==========================================================
  ÁUDIO DO SITE
  ==========================================================
  GitHub Pages suporta áudio normalmente em um site estático.
  O ideal é usar um arquivo local em /assets, como MP3.
  YouTube e Spotify não são a melhor opção aqui por autoplay,
  embed, privacidade e controle visual.
*/

function updateAudioToggleUI() {
  if (!audioToggleButton) return;

  const isPlaying = !!backgroundAudio && !backgroundAudio.paused && !backgroundAudio.ended;
  audioToggleButton.classList.toggle('is-paused', !isPlaying);
  audioToggleButton.setAttribute('aria-pressed', String(isPlaying));
  audioToggleButton.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Tocar música');
  audioToggleButton.title = isPlaying ? 'Pausar música' : 'Tocar música';

  if (audioToggleLabel) {
    audioToggleLabel.textContent = isPlaying ? 'Pausar música' : 'Tocar música';
  }
}

function showAudioToggle() {
  audioToggleButton?.classList.add('is-visible');
}

function hideAudioToggle() {
  audioToggleButton?.classList.remove('is-visible');
}

async function tryStartBackgroundAudio() {
  if (!backgroundAudio || !audioShouldBePlaying) {
    updateAudioToggleUI();
    return;
  }

  try {
    backgroundAudio.volume = 1;
    await backgroundAudio.play();
    audioHasBeenUnlocked = true;
  } catch (error) {
    // Alguns navegadores exigem gesto explícito do usuário para liberar áudio.
  }

  updateAudioToggleUI();
}

function prepareAudioFromUserGesture() {
  audioHasBeenUnlocked = true;
  audioShouldBePlaying = true;
  showAudioToggle();
  tryStartBackgroundAudio();
}

function toggleBackgroundAudio() {
  if (!backgroundAudio) return;

  showAudioToggle();

  if (backgroundAudio.paused) {
    audioShouldBePlaying = true;
    tryStartBackgroundAudio();
    return;
  }

  audioShouldBePlaying = false;
  backgroundAudio.pause();
  updateAudioToggleUI();
}

/*
  ==========================================================
  ABERTURA DA CAPA / VÍDEO / SITE
  ==========================================================
*/

function getActiveIntroVideo() {
  return window.matchMedia('(max-width: 767px)').matches
    ? introVideoMobile
    : introVideoDesktop;
}

function resetIntroVideos() {
  [introVideoDesktop, introVideoMobile].forEach((video) => {
    if (!video) return;

    video.pause();

    try {
      video.currentTime = 0;
    } catch (error) {
      // Alguns navegadores móveis podem reclamar se o metadata ainda não carregou.
    }
  });
}

function finishVideoOverlayTransition() {
  videoOverlay.classList.remove('is-finishing');
  videoOverlay.classList.remove('is-active');
  activeIntroVideo = null;
  resetIntroVideos();
  isRevealingSite = false;
  forceScrollTop();
}

function revealSite() {
  if (isRevealingSite) return;

  const overlayWasActive = videoOverlay.classList.contains('is-active');
  isRevealingSite = true;

  forceScrollTop();
  coverScreen.classList.remove('is-active');
  body.classList.remove('is-locked');
  showAudioToggle();

  setTimeout(() => {
    forceScrollTop();
    siteShell.classList.add('is-visible');
    runRevealAnimation();
  }, CONFIG.siteRevealDelay);

  if (!overlayWasActive) {
    isRevealingSite = false;
    forceScrollTop();
    return;
  }

  videoOverlay.classList.add('is-finishing');

  setTimeout(finishVideoOverlayTransition, CONFIG.videoFadeOutDuration);
}

function showCover() {
  activeIntroVideo = null;
  isRevealingSite = false;
  resetIntroVideos();
  videoOverlay.classList.remove('is-finishing');
  videoOverlay.classList.remove('is-active');
  siteShell.classList.remove('is-visible');
  coverScreen.classList.add('is-active');
  body.classList.add('is-locked');
  hideAudioToggle();
  forceScrollTop();
}

function openVideoIntro() {
  forceScrollTop();
  coverScreen.classList.remove('is-active');
  videoOverlay.classList.remove('is-finishing');
  videoOverlay.classList.add('is-active');
  videoFallback.style.display = 'none';

  resetIntroVideos();

  activeIntroVideo = getActiveIntroVideo();
  const hasVideoSource = activeIntroVideo?.querySelector('source')?.getAttribute('src');

  if (!hasVideoSource) {
    videoFallback.style.display = 'block';
    showAudioToggle();
    return;
  }

  const playAttempt = activeIntroVideo.play();

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
  if (revealObserverInitialized) return;

  revealObserverInitialized = true;
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

watchIntroButton?.addEventListener('click', () => {
  prepareAudioFromUserGesture();
  openVideoIntro();
});

skipIntroButton?.addEventListener('click', () => {
  prepareAudioFromUserGesture();
  revealSite();
});

fallbackEnterButton?.addEventListener('click', () => {
  prepareAudioFromUserGesture();
  revealSite();
});

fallbackBackButton?.addEventListener('click', showCover);

audioToggleButton?.addEventListener('click', toggleBackgroundAudio);

backgroundAudio?.addEventListener('play', updateAudioToggleUI);
backgroundAudio?.addEventListener('pause', updateAudioToggleUI);
backgroundAudio?.addEventListener('ended', updateAudioToggleUI);

[introVideoDesktop, introVideoMobile].forEach((video) => {
  video?.addEventListener('ended', () => {
    if (video !== activeIntroVideo) return;
    setTimeout(revealSite, CONFIG.videoEndDelay);
  });

  video?.addEventListener('error', () => {
    if (video !== activeIntroVideo && activeIntroVideo !== null) return;
    videoFallback.style.display = 'block';
  });
});

window.addEventListener('pageshow', forceScrollTop);
window.addEventListener('load', forceScrollTop);
window.addEventListener('resize', () => {
  if (coverScreen.classList.contains('is-active') || videoOverlay.classList.contains('is-active')) {
    forceScrollTop();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  applyConfig();
  hideAudioToggle();
  forceScrollTop();
});
