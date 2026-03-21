/* ================================================
   ONE FOTO — Landing Page Script
   Effects: Bokeh canvas, Film perfs, Cursor glow,
            Parallax, Entrance animations
   ================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCursorGlow();
  initBokehCanvas();
  initFilmPerforations();
  initParallax();
  initBannerEntrance();
});

/* ─────────────────────────────────────────────────
   1. CURSOR GLOW
   ───────────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let animId;

  // Smooth lerp follow
  function tick() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    animId = requestAnimationFrame(tick);
  }

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;

    // Change glow color based on hovered banner
    const target = e.target.closest('.banner');
    if (target && target.classList.contains('banner--film')) {
      glow.style.background = 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)';
    } else {
      glow.style.background = 'radial-gradient(circle, rgba(78,201,122,0.05) 0%, transparent 70%)';
    }
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    glow.style.opacity = '1';
  });

  tick();
}

/* ─────────────────────────────────────────────────
   2. BOKEH CANVAS (animated blurred circles)
   ───────────────────────────────────────────────── */
function initBokehCanvas() {
  const canvas = document.querySelector('.bokeh-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const GREEN = { r: 78, g: 201, b: 122 };

  // Resize canvas to match banner
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
  }

  resize();
  window.addEventListener('resize', resize);

  // Create bokeh particles
  const particles = [];
  const count = 18;

  for (let i = 0; i < count; i++) {
    particles.push(createParticle(canvas));
  }

  function createParticle(c) {
    const size = 30 + Math.random() * 120;
    return {
      x:       Math.random() * c.width,
      y:       Math.random() * c.height,
      size:    size,
      opacity: 0.05 + Math.random() * 0.2,
      speed:   0.2 + Math.random() * 0.4,
      angle:   Math.random() * Math.PI * 2,
      drift:   (Math.random() - 0.5) * 0.008,
      pulse:   Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    };
  }

  function drawParticle(p) {
    p.pulse  += p.pulseSpeed;
    p.angle  += p.drift;
    p.x      += Math.cos(p.angle) * p.speed;
    p.y      += Math.sin(p.angle) * p.speed * 0.6;

    // Wrap around edges
    const pad = p.size;
    if (p.x < -pad) p.x = canvas.width  + pad;
    if (p.x > canvas.width  + pad) p.x = -pad;
    if (p.y < -pad) p.y = canvas.height + pad;
    if (p.y > canvas.height + pad) p.y = -pad;

    const alpha  = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
    const radius = p.size    * (0.9 + 0.1 * Math.sin(p.pulse * 0.7));

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    grad.addColorStop(0,   `rgba(${GREEN.r},${GREEN.g},${GREEN.b},${alpha})`);
    grad.addColorStop(0.4, `rgba(${GREEN.r},${GREEN.g},${GREEN.b},${alpha * 0.4})`);
    grad.addColorStop(1,   `rgba(${GREEN.r},${GREEN.g},${GREEN.b},0)`);

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  let rafId;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(drawParticle);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  // Pause animation when tab hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });
}

/* ─────────────────────────────────────────────────
   3. FILM PERFORATIONS (dynamic generation)
   ───────────────────────────────────────────────── */
function initFilmPerforations() {
  ['perfsLeft', 'perfsRight'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    function populate() {
      el.innerHTML = '';
      const h = el.offsetHeight;
      const spacing = 22;
      const count = Math.max(4, Math.floor((h - 36) / spacing));
      for (let i = 0; i < count; i++) {
        const perf = document.createElement('div');
        perf.className = 'film-perf';
        el.appendChild(perf);
      }
    }

    populate();

    // Re-populate on resize
    const ro = new ResizeObserver(populate);
    ro.observe(el);
  });
}

/* ─────────────────────────────────────────────────
   4. MOUSE PARALLAX on banner backgrounds
   ───────────────────────────────────────────────── */
function initParallax() {
  const banners = document.querySelectorAll('.banner');
  const glows   = document.querySelectorAll('.banner-glow');

  let mouseX = 0.5, mouseY = 0.5;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function updateParallax() {
    const dx = (mouseX - 0.5) * 2; // -1 to 1
    const dy = (mouseY - 0.5) * 2;

    banners.forEach((banner, i) => {
      // Alternate direction for each panel
      const dirX = i % 2 === 0 ? 1 : -1;
      const glow  = glows[i];
      if (glow) {
        const tx = dx * dirX * 18;
        const ty = dy * 12;
        glow.style.transform = `translate(${tx}px, ${ty}px)`;
      }
    });

    requestAnimationFrame(updateParallax);
  }

  updateParallax();
}

/* ─────────────────────────────────────────────────
   5. ENTRANCE ANIMATIONS (stagger reveal)
   ───────────────────────────────────────────────── */
function initBannerEntrance() {
  const elements = document.querySelectorAll('.banner, .site-header, .site-footer');

  // Intersection Observer for subtle reveal
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach((el, i) => {
      el.style.transition = `opacity 0.7s ease ${i * 0.08}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`;
      io.observe(el);
    });
  }

  // Aperture entrance: slow to full speed
  const aperture = document.querySelector('.aperture-svg');
  if (aperture) {
    // Start slow, accelerate to normal
    aperture.style.animationDuration = '4s';
    setTimeout(() => {
      aperture.style.transition = 'animation-duration 3s ease';
      aperture.style.animationDuration = '18s';
    }, 1200);
  }
}

/* ─────────────────────────────────────────────────
   6. Keyboard accessibility (Enter = click link)
   ───────────────────────────────────────────────── */
document.querySelectorAll('.banner').forEach(banner => {
  banner.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      banner.click();
    }
  });
});
