/*
  ==========================================================
  CONTROLE DAS PARTÍCULAS / ESTRELINHAS
  ==========================================================
  Arquivo separado para facilitar manutenção.

  OS PRINCIPAIS AJUSTES FICAM AQUI:
  - mobileCount / tabletCount / desktopCount  -> quantidade de partículas
  - sizeMin / sizeMax                         -> tamanho
  - speedMin / speedMax                       -> velocidade de queda
  - swayStrength                              -> quanto balançam lateralmente
  - colors                                    -> cores das partículas
*/

const PARTICLE_CONFIG = {
  mobileCount: 52,
  tabletCount: 88,
  desktopCount: 112,

  sizeMin: 1.5,
  sizeMax: 3.5,

  speedMin: 0.18,
  speedMax: 0.58,

  swayStrength: 0.22,

  glowMultiplier: 3.4,

  colors: [
    'rgba(230, 201, 121, 0.88)',
    'rgba(232, 199, 195, 0.82)',
    'rgba(255, 255, 255, 0.86)',
    'rgba(201, 162, 74, 0.72)',
  ],
};

(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];

  function getParticleCount() {
    if (window.innerWidth < 560) return PARTICLE_CONFIG.mobileCount;
    if (window.innerWidth < 920) return PARTICLE_CONFIG.tabletCount;
    return PARTICLE_CONFIG.desktopCount;
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeParticle(startAnywhere = true) {
    return {
      x: Math.random() * width,
      y: startAnywhere ? Math.random() * height : -10,
      size: randomBetween(PARTICLE_CONFIG.sizeMin, PARTICLE_CONFIG.sizeMax),
      speedY: randomBetween(PARTICLE_CONFIG.speedMin, PARTICLE_CONFIG.speedMax),
      speedX: (Math.random() - 0.5) * PARTICLE_CONFIG.swayStrength,
      opacity: randomBetween(0.22, 0.86),
      twinkle: Math.random() * Math.PI * 2,
      color:
        PARTICLE_CONFIG.colors[
          Math.floor(Math.random() * PARTICLE_CONFIG.colors.length)
        ],
    };
  }

  function rebuildParticles() {
    particles = Array.from(
      { length: getParticleCount() },
      () => makeParticle(true)
    );
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    rebuildParticles();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.y += particle.speedY;
      particle.x += particle.speedX + Math.sin(particle.twinkle) * 0.06;
      particle.twinkle += 0.02;

      if (
        particle.y > height + 16 ||
        particle.x < -16 ||
        particle.x > width + 16
      ) {
        Object.assign(particle, makeParticle(false), {
          x: Math.random() * width,
        });
      }

      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha =
        particle.opacity * (0.68 + Math.sin(particle.twinkle) * 0.22);
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.globalAlpha = particle.opacity * 0.26;
      ctx.arc(
        particle.x,
        particle.y,
        particle.size * PARTICLE_CONFIG.glowMultiplier,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resizeCanvas();
  draw();

  window.addEventListener('resize', resizeCanvas);
})();
