/* ============================================================
   KRISHISHETRA — MAIN SCRIPT
   Cinematic animations, scroll-driven effects, and interactions
   ============================================================ */

// ── Wait for DOM ──
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  initLenis();
  initGSAP();
  initNavbar();
  initAuthenticatedLandingNav();
  initLoginModal();
  initChart();
  initCounters();
  initBuyerCards();
  initFloatingParticles();
  initMouseParallax();
  initMagneticButtons();
  initSectionLabels();
});

/* ============================================================
   LENIS SMOOTH SCROLL
   ============================================================ */
let lenis;

function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  // Connect Lenis to GSAP ticker
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ============================================================
   GSAP ANIMATIONS
   ============================================================ */
function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Show everything immediately
    gsap.set('.hero__headline .line-inner, .hero__subtitle, .hero__actions, .hero__trust, .hero__intel, .hero__scroll', { opacity: 1, y: 0, x: 0, clearProps: 'transform' });
    return;
  }

  heroAnimation();
  scrollTransitionAnimation();
  problemAnimation();
  solutionAnimation();
  intelligenceAnimation();
  aiDecisionAnimation();
  buyerAnimation();
  transactionAnimation();
  fpoAnimation();
  finalCtaAnimation();
  heroParallax();
}

/* ── HERO SEQUENCE ── */
function heroAnimation() {
  const tl = gsap.timeline({ delay: 0.3 });

  // Background Ken Burns zoom with blur-to-clear
  gsap.fromTo('#hero-bg-img',
    { scale: 1.2, opacity: 0, filter: 'blur(8px)' },
    { scale: 1.08, opacity: 1, filter: 'blur(0px)', duration: 2.5, ease: 'power2.out' }
  );

  // Headline reveal — each line from below with blur
  tl.to('.hero__headline .line-inner', {
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.18,
    ease: 'power3.out'
  }, 0.8)

  // Subtitle with blur reveal
  .fromTo('#hero-subtitle',
    { opacity: 0, y: 30, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
    '-=0.4'
  )

  // CTA buttons with scale-in
  .fromTo('#hero-actions',
    { opacity: 0, y: 25, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  )

  // Trust bar items stagger in
  .fromTo('.hero__trust-item',
    { opacity: 0, x: -15 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
    '-=0.3'
  )

  // Floating intelligence card with dramatic entrance
  .fromTo('#hero-intel',
    { opacity: 0, x: 60, scale: 0.9, filter: 'blur(10px)' },
    {
      opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
      duration: 1.2, ease: 'power3.out',
      onComplete: () => {
        document.getElementById('hero-intel')?.classList.add('animated');
      }
    },
    '-=0.6'
  )

  // Scroll indicator
  .to('#hero-scroll', {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.3');
}

/* ── HERO PARALLAX ── */
function heroParallax() {
  gsap.to('#hero-bg-img', {
    y: 80,
    scale: 1.12,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    }
  });
}

/* ── SCROLL TRANSITION ── */
function scrollTransitionAnimation() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scroll-transition',
      start: 'top 80%',
      end: 'center center',
      scrub: false,
      toggleActions: 'play none none reverse',
    }
  });

  // Background fades in with scale
  tl.fromTo('#transition-bg',
    { opacity: 0, scale: 1.1 },
    { opacity: 1, scale: 1, duration: 1, ease: 'power2.inOut' }
  )

  // Flow steps stagger in with blur
  .fromTo('.flow-step',
    { opacity: 0, y: 40, scale: 0.8, filter: 'blur(4px)' },
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)' },
    0.3
  )

  // Arrows with scale
  .fromTo('.flow-arrow',
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' },
    0.4
  );
}

/* ── PROBLEM SECTION ── */
function problemAnimation() {
  // Section title
  gsap.fromTo('.section-problem__title',
    { opacity: 0, y: 40, filter: 'blur(6px)' },
    {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.section-problem__header', start: 'top 80%', toggleActions: 'play none none reverse' }
    }
  );

  // Cards with staggered blur+scale reveal
  gsap.fromTo('.problem-card',
    { opacity: 0, y: 50, scale: 0.95, filter: 'blur(5px)' },
    {
      opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
      duration: 0.8, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: '#problem-grid', start: 'top 78%', toggleActions: 'play none none reverse' }
    }
  );
}

/* ── SOLUTION SECTION ── */
function solutionAnimation() {
  // Title
  gsap.fromTo('.section-solution__title',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.section-solution__header', start: 'top 80%', toggleActions: 'play none none reverse' }
    }
  );

  // Steps with back-bounce
  gsap.fromTo('.solution-step',
    { opacity: 0, y: 50, scale: 0.9 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.7, stagger: 0.12, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: '#solution-journey', start: 'top 78%', toggleActions: 'play none none reverse' }
    }
  );
}

/* ── INTELLIGENCE DASHBOARD ── */
function intelligenceAnimation() {
  gsap.to('#dashboard-preview', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#dashboard-preview',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        animateCounters('#dashboard-metrics');
        animateChart();
      }
    }
  });
}

/* ── AI DECISION ── */
function aiDecisionAnimation() {
  // Title
  gsap.fromTo('.section-ai__title',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.section-ai__header', start: 'top 80%', toggleActions: 'play none none reverse' }
    }
  );

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#ai-flow',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    }
  });

  tl.fromTo('.ai-flow__step',
    { opacity: 0, y: 40, scale: 0.9, filter: 'blur(4px)' },
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.7, stagger: 0.18, ease: 'power2.out' }
  )
  .fromTo('.ai-flow__connector',
    { opacity: 0, scale: 0 },
    { opacity: 1, scale: 1, duration: 0.35, stagger: 0.1, ease: 'back.out(2)' },
    0.3
  )
  .fromTo('#ai-confidence',
    { opacity: 0, y: 20, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  );
}

/* ── BUYER CARDS ── */
function buyerAnimation() {
  gsap.to('.buyer-card', {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#buyer-grid',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        // Animate reliability bars
        setTimeout(() => {
          document.querySelectorAll('.buyer-card__reliability-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
          });
        }, 400);
      }
    }
  });
}

/* ── TRANSACTION FLOW ── */
function transactionAnimation() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#transaction-flow',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    }
  });

  tl.to('.txn-step', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out'
  })
  .to('.txn-connector', {
    opacity: 1,
    duration: 0.3,
    stagger: 0.08,
    ease: 'power2.out'
  }, 0.15)
  .to('#txn-note', {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.2');
}

/* ── FPO SECTION ── */
function fpoAnimation() {
  gsap.to('#fpo-showcase', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#fpo-showcase',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        animateCounters('#fpo-showcase');
        // FPO workflow steps
        gsap.to('.fpo-workflow__step', {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
          delay: 0.3
        });
      }
    }
  });
}

/* ── FINAL CTA ── */
function finalCtaAnimation() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#final-cta',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    }
  });

  tl.fromTo('#final-title',
    { opacity: 0, y: 50, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' }
  )
  .fromTo('.section-final__actions',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    '-=0.4'
  );

  // Sunset parallax
  gsap.to('.section-final__bg img', {
    y: -60,
    scale: 1.08,
    ease: 'none',
    scrollTrigger: {
      trigger: '#final-cta',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    }
  });
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!navbar || !toggle || !menu) return;

  // Scroll-based transparency
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--solid');
    } else {
      navbar.classList.remove('navbar--solid');
      navbar.classList.add('navbar--transparent');
    }
  });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // Close menu on link click
  menu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -60 });
      }
    });
  });
}

/* ============================================================
   LOGIN MODAL
   ============================================================ */
function initLoginModal() {
  const overlay = document.getElementById('login-overlay');
  if (!overlay) return;
  const closeBtn = document.getElementById('login-close');
  const bgOverlay = document.getElementById('login-overlay-bg');
  const form = document.getElementById('login-form');
  const roleSelect = document.getElementById('role-select');

  // Direct navigation
  const loginNavBtn = document.getElementById('btn-login-nav');
  if (loginNavBtn) {
    loginNavBtn.addEventListener('click', (e) => {
      // Allow default href or enforce login page
      // window.location.href = 'login.html';
    });
  }

  const enterTriggers = ['btn-enter-nav', 'btn-enter-final'];
  enterTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'dashboard.html';
      });
    }
  });

  // Close modal
  const closeModal = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  bgOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Role selection
  roleSelect.addEventListener('click', (e) => {
    const role = e.target.closest('.login-card__role');
    if (role) {
      roleSelect.querySelectorAll('.login-card__role').forEach(r => r.classList.remove('active'));
      role.classList.add('active');
    }
  });

  // Form submit (demo)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('login-submit');
    submitBtn.textContent = 'Entering…';
    submitBtn.style.opacity = '0.7';
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
  });
}

/* ============================================================
   ANIMATED PRICE CHART (SVG)
   ============================================================ */
function initChart() {
  const chartLine = document.getElementById('chart-line');
  const chartArea = document.getElementById('chart-area');
  const chartForecast = document.getElementById('chart-forecast');
  if (!chartLine || !chartArea || !chartForecast) return;

  // Generate realistic-looking price data
  const points = 30;
  const basePrice = 2500;
  const priceData = [];
  const forecastData = [];

  for (let i = 0; i < points; i++) {
    const variation = Math.sin(i * 0.3) * 150 + Math.sin(i * 0.7) * 80 + (Math.random() - 0.5) * 60;
    priceData.push(basePrice + variation + (i * 8));
  }

  // Forecast (last 8 points, slightly higher trend)
  for (let i = points - 8; i < points + 5; i++) {
    const variation = Math.sin(i * 0.3) * 120 + Math.sin(i * 0.7) * 60;
    forecastData.push(basePrice + variation + (i * 12) + 50);
  }

  const svgWidth = 900;
  const svgHeight = 200;
  const padding = 10;

  const allPrices = [...priceData, ...forecastData];
  const minPrice = Math.min(...allPrices) - 50;
  const maxPrice = Math.max(...allPrices) + 50;

  const toSvgX = (i, total) => padding + (i / (total - 1)) * (svgWidth - 2 * padding);
  const toSvgY = (val) => svgHeight - padding - ((val - minPrice) / (maxPrice - minPrice)) * (svgHeight - 2 * padding);

  // Build price line path
  let linePath = `M ${toSvgX(0, points)} ${toSvgY(priceData[0])}`;
  for (let i = 1; i < points; i++) {
    const x = toSvgX(i, points);
    const y = toSvgY(priceData[i]);
    // Smooth curve
    const prevX = toSvgX(i - 1, points);
    const prevY = toSvgY(priceData[i - 1]);
    const cpX = (prevX + x) / 2;
    linePath += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
  }

  // Build area path (line + close to bottom)
  const areaPath = linePath + ` L ${toSvgX(points - 1, points)} ${svgHeight} L ${toSvgX(0, points)} ${svgHeight} Z`;

  // Build forecast path
  let forecastPath = `M ${toSvgX(points - 8, points)} ${toSvgY(forecastData[0])}`;
  for (let i = 1; i < forecastData.length; i++) {
    const x = toSvgX(points - 8 + i, points + 5);
    const y = toSvgY(forecastData[i]);
    const prevX = toSvgX(points - 8 + i - 1, points + 5);
    const prevY = toSvgY(forecastData[i - 1]);
    const cpX = (prevX + x) / 2;
    forecastPath += ` C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y}`;
  }

  document.getElementById('chart-line').setAttribute('d', linePath);
  document.getElementById('chart-area').setAttribute('d', areaPath);
  document.getElementById('chart-forecast').setAttribute('d', forecastPath);
}

function animateChart() {
  const chartLine = document.getElementById('chart-line');
  const chartArea = document.getElementById('chart-area');
  const chartForecast = document.getElementById('chart-forecast');

  if (!chartLine) return;

  // Get actual path length
  const pathLength = chartLine.getTotalLength();
  chartLine.style.strokeDasharray = pathLength;
  chartLine.style.strokeDashoffset = pathLength;

  // Animate line drawing
  gsap.to(chartLine, {
    strokeDashoffset: 0,
    duration: 2,
    ease: 'power2.inOut'
  });

  // Fade in area
  gsap.to(chartArea, {
    opacity: 0.6,
    duration: 1.5,
    delay: 0.5,
    ease: 'power2.out'
  });

  // Fade in forecast
  gsap.to(chartForecast, {
    opacity: 0.8,
    duration: 1,
    delay: 1.5,
    ease: 'power2.out'
  });
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters() {
  // Counters are triggered by scroll animations in GSAP
}

function animateCounters(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = prefix + Math.round(obj.val).toLocaleString('en-IN') + suffix;
      }
    });
  });
}

/* ============================================================
   BUYER CARD RELIABILITY BARS
   ============================================================ */
function initBuyerCards() {
  // Reliability bars are animated via CSS transition triggered by scroll
}

/* ============================================================
   FLOATING DATA UPDATE (subtle micro-interaction)
   ============================================================ */
function startDataPulse() {
  setInterval(() => {
    const priceEl = document.getElementById('intel-price');
    const forecastEl = document.getElementById('intel-forecast');
    if (!priceEl || !forecastEl) return;

    // Subtle price fluctuation
    const prices = ['₹2,640', '₹2,650', '₹2,660', '₹2,655', '₹2,670', '₹2,645'];
    const forecasts = ['₹2,840', '₹2,850', '₹2,860', '₹2,845', '₹2,855'];

    const randomPrice = prices[Math.floor(Math.random() * prices.length)];
    const randomForecast = forecasts[Math.floor(Math.random() * forecasts.length)];

    gsap.to(priceEl, {
      opacity: 0.5,
      duration: 0.2,
      onComplete: () => {
        priceEl.textContent = randomPrice;
        gsap.to(priceEl, { opacity: 1, duration: 0.3 });
      }
    });

    gsap.to(forecastEl, {
      opacity: 0.5,
      duration: 0.2,
      delay: 0.1,
      onComplete: () => {
        forecastEl.textContent = randomForecast;
        gsap.to(forecastEl, { opacity: 1, duration: 0.3 });
      }
    });
  }, 4000);
}

/* ============================================================
   FLOATING PARTICLES
   Adds ambient floating particles to dark sections
   ============================================================ */
function initFloatingParticles() {
  const sections = document.querySelectorAll('.section-solution, .section-ai, .section-transaction');

  sections.forEach(section => {
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;';
    section.style.position = 'relative';
    section.appendChild(particleContainer);

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = Math.random() * 10 + 12;
      const driftX = (Math.random() - 0.5) * 200;
      const driftY = -(Math.random() * 300 + 100);

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(74, 157, 110, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        --drift-x: ${driftX}px;
        --drift-y: ${driftY}px;
        animation: particle-drift ${duration}s ${delay}s ease-in-out infinite;
        pointer-events: none;
      `;
      particleContainer.appendChild(particle);
    }
  });
}

/* ============================================================
   MOUSE PARALLAX ON HERO
   Subtle movement of intel card based on mouse position
   ============================================================ */
function initMouseParallax() {
  const hero = document.getElementById('hero');
  const intel = document.getElementById('hero-intel');
  if (!hero || !intel) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(intel, {
      x: x * 20,
      y: y * 15,
      rotateY: x * 3,
      rotateX: -y * 3,
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  hero.addEventListener('mouseleave', () => {
    gsap.to(intel, {
      x: 0, y: 0, rotateY: 0, rotateX: 0,
      duration: 0.6, ease: 'power2.out'
    });
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   Subtle magnetic pull effect on CTA buttons
   ============================================================ */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn--primary, .btn--gold');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0, y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });
}

/* ============================================================
   SECTION LABEL ANIMATIONS
   Animated underline on section labels when they enter viewport
   ============================================================ */
function initSectionLabels() {
  const labels = document.querySelectorAll('.t-label, .section-solution__label, .section-intelligence__label, .section-fpo__label');

  labels.forEach(label => {
    gsap.fromTo(label,
      { opacity: 0, y: 10, letterSpacing: '0.2em' },
      {
        opacity: 1, y: 0, letterSpacing: label.style.letterSpacing || '0.12em',
        duration: 0.6, ease: 'power2.out',
        scrollTrigger: {
          trigger: label,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
}

/* ============================================================
   AUTHENTICATED USER LANDING NAVIGATION
   ============================================================ */
function getDashboardUrlByRole(r) {
  switch (r) {
    case 'buyer': return 'buyer.html';
    case 'transporter': return 'transporter/dashboard.html';
    case 'fpo': return 'fpo-dashboard.html';
    case 'admin': return 'admin/dashboard.html';
    case 'farmer':
    default: return 'dashboard.html';
  }
}

function initAuthenticatedLandingNav() {
  const token = localStorage.getItem('krishi_token');
  const storedRole = (localStorage.getItem('krishi_user_role') || 'farmer').toLowerCase();

  if (token) {
    const dashUrl = getDashboardUrlByRole(storedRole);
    const navCta = document.getElementById('btn-login-nav');
    const heroBtn = document.getElementById('btn-explore');
    const navLogo = document.getElementById('nav-logo');

    if (navCta) {
      navCta.textContent = 'Go to Dashboard';
      navCta.href = dashUrl;
      navCta.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = dashUrl;
      });
    }
    if (heroBtn) {
      heroBtn.innerHTML = `Go to Dashboard <span class="btn-arrow">→</span>`;
      heroBtn.href = dashUrl;
      heroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = dashUrl;
      });
    }
    if (navLogo) {
      navLogo.href = dashUrl;
      navLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = dashUrl;
      });
    }
  }
}

/* ============================================================
   LOGIN MODAL
   ============================================================ */
function initLoginModal() {
  const overlay = document.getElementById('login-overlay');
  const closeBtn = document.getElementById('login-close');
  const bg = document.getElementById('login-overlay-bg');
  const form = document.getElementById('login-form');
  const roleButtons = document.querySelectorAll('.login-card__role');

  if (!overlay) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  }
  if (bg) {
    bg.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
  }

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const token = localStorage.getItem('krishi_token');
      if (token) {
        const storedRole = (localStorage.getItem('krishi_user_role') || 'farmer').toLowerCase();
        window.location.href = getDashboardUrlByRole(storedRole);
        return;
      }
      const activeRole = document.querySelector('.login-card__role.active');
      const role = activeRole ? activeRole.dataset.role : 'farmer';
      window.location.href = `login.html?role=${role}`;
    });
  }
}

// Start data pulse after hero animation
setTimeout(startDataPulse, 3000);
