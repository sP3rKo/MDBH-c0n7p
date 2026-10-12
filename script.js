/* ==========================================================
   MADA CRAFT BH v3.3 — Interactive Hero Studio
   (Fixed: Arabic letters + Lightbox mobile + Touch scroll)
   ========================================================== */

(() => {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const isTouch = matchMedia('(hover: none)').matches;

  document.body.classList.add('is-locked');

  /* ============ 1. PRELOADER ============ */
  const loader = $('#loader');
  const loaderTitle = $('#loaderTitle');
  const loaderBar = $('#loaderBar');
  const loaderCount = $('#loaderCount');
  const letters = 'MADACRAFT'.split('');
  loaderTitle.innerHTML = letters.map(l => `<span>${l}</span>`).join('');
  $$('#loaderTitle span').forEach((s, i) => {
    s.style.animationDelay = (i * 0.06) + 's';
  });

  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      setTimeout(finish, 500);
    }
    loaderBar.style.width = progress + '%';
    loaderCount.textContent = Math.floor(progress);
  }, 130);

  function finish() {
    loader.classList.add('is-hidden');
    document.body.classList.remove('is-locked');
    heroIntro();
  }

  /* ============ 2. CURSOR ============ */
  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  const cursorTrail = $('#cursorTrail');
  let mx = 0, my = 0, cx = 0, cy = 0, tx = 0, ty = 0;

  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursorTrail.classList.add('is-active');
    });

    const raf = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;

      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;
      cursorTrail.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;

      requestAnimationFrame(raf);
    };
    raf();

    $$('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const type = el.dataset.cursor;
        cursor.classList.add(`is-${type}`);
        if (type === 'view') cursorLabel.textContent = 'عرض';
        else if (type === 'drag') cursorLabel.textContent = 'اسحب';
      });
      el.addEventListener('mouseleave', () => {
        cursor.className = 'cursor';
        cursorLabel.textContent = '';
      });
    });
  }

  /* ============ 3. LENIS SMOOTH SCROLL (Desktop only) ============ */
  const isDesktop = window.matchMedia('(min-width: 769px)').matches && !isTouch;

  let lenis = null;

  if (isDesktop) {
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } else {
    // Mock لـ Lenis على الجوال عشان باقي الأكواد ما تتعطل
    lenis = {
      scrollTo: (target, opts = {}) => {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
          window.scrollTo({ top, behavior: 'smooth' });
        }
      },
      stop: () => { document.body.style.overflow = 'hidden'; },
      start: () => { document.body.style.overflow = ''; },
      raf: () => {},
      on: () => {},
    };
  }

  /* ============ 4. GSAP SETUP ============ */
  gsap.registerPlugin(ScrollTrigger);
  if (isDesktop) {
    lenis.on('scroll', ScrollTrigger.update);
  }

  /* ============ 5. NAVBAR ============ */
  const nav = $('#nav');
  const burger = $('#burger');
  const mmenu = $('#mmenu');
  const navProgress = $('#navProgress');
  const totop = $('#totop');

  window.addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    totop.classList.toggle('is-in', y > 600);
    const h = document.documentElement.scrollHeight - innerHeight;
    navProgress.style.width = Math.min(100, (y / h) * 100) + '%';
  }, { passive: true });

  burger.addEventListener('click', () => {
    burger.classList.toggle('is-active');
    mmenu.classList.toggle('is-open');
    document.body.classList.toggle('is-locked', mmenu.classList.contains('is-open'));
  });

  $$('.mmenu__link').forEach(l => l.addEventListener('click', () => {
    burger.classList.remove('is-active');
    mmenu.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }));

  totop.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.4 }));

  /* ============ 6. SMOOTH ANCHOR SCROLL ============ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -70, duration: 1.3 });
    });
  });

  /* ============ 7. REVEAL OBSERVER ============ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('is-in'), i * 70);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  $$('[data-reveal], .manifesto__text').forEach(el => io.observe(el));

  /* ============ 8. HERO PARTICLES CANVAS ============ */
  const canvas = $('#heroCanvas');
  if (canvas && !isTouch) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }

    let mouseX = -1000, mouseY = -1000;
    document.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * window.devicePixelRatio;
      mouseY = (e.clientY - rect.top) * window.devicePixelRatio;
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 * window.devicePixelRatio) {
          const force = (150 * window.devicePixelRatio - dist) / (150 * window.devicePixelRatio);
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ============ 9. HERO — 3D STAGE MOUSE TRACKING ============ */
  const heroStage = $('#heroStage');
  const heroSection = $('[data-hero]');

  if (heroStage && !isTouch) {
    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;

    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = x * 18;
      targetRX = -y * 12;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetRX = 0; targetRY = 0;
    });

    const animateStage = () => {
      currentRX += (targetRX - currentRX) * 0.08;
      currentRY += (targetRY - currentRY) * 0.08;

      $$('[data-hero-card]').forEach(card => {
        const depth = parseFloat(card.dataset.depth) || 1;
        const rx = currentRX * depth;
        const ry = currentRY * depth;
        const z = depth * 20;
        card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${z}px)`;
      });

      $$('.hero__card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const shineX = ((mx - rect.left) / rect.width) * 100;
        const shineY = ((my - rect.top) / rect.height) * 100;
        card.style.setProperty('--shine-x', shineX + '%');
        card.style.setProperty('--shine-y', shineY + '%');
      });

      requestAnimationFrame(animateStage);
    };
    animateStage();
  }

  /* ============ 10. HERO INTRO ANIMATION ============ */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero__title .word', {
        y: 0, duration: 1.15, stagger: 0.09,
      })
      .from('.hero__eyebrow', { y: 20, opacity: 0, duration: .8 }, '-=1')
      .from('.hero__desc', { y: 20, opacity: 0, duration: .8 }, '-=0.7')
      .from('.hero__cta > *', { y: 20, opacity: 0, duration: .7, stagger: .1 }, '-=0.6')
      .from('.hero__trust', { y: 20, opacity: 0, duration: .7 }, '-=0.5')
      .from('.hero__card--main', { y: 60, opacity: 0, scale: 0.9, duration: 1.2 }, '-=1.2')
      .from('.hero__card--small', { y: 40, opacity: 0, scale: 0.8, duration: 1, stagger: .15 }, '-=0.9')
      .from('.hero__float-stat', { y: 20, opacity: 0, duration: .8 }, '-=0.6')
      .from('.hero__signature', { scale: 0.5, opacity: 0, duration: 1.2 }, '-=0.8')
      .from('.hero__bottom-item', { y: 20, opacity: 0, duration: .7, stagger: .1 }, '-=0.6')
      .from('.hero__scroll', { opacity: 0, duration: .6 }, '-=0.4');

    gsap.to('.hero__signature-circle', {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: 'power2.inOut',
      delay: 0.8,
    });

    $$('.hero__bottom-num, .hero__float-stat .num, .hero__stat .num').forEach(el => {
      const target = +el.dataset.count;
      if (!target) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        delay: 0.6,
        onUpdate: () => el.textContent = Math.floor(obj.val),
      });
    });
  }

  /* ============ 11. HERO PARALLAX ON SCROLL ============ */
  gsap.to('.hero__text', {
    yPercent: -12,
    opacity: 0.4,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  gsap.to('.hero__card--small', {
    yPercent: -20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  gsap.to('.hero__float-stat', {
    yPercent: -25,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  gsap.to('.hero__bg-text', {
    xPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  /* ============ 12. SERVICES — Reveal ============ */
  const servicesGrid = document.querySelector('.services__grid');
  if (servicesGrid) {
    const scardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.scard');
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('is-in'), i * 100);
          });
          scardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
    scardObserver.observe(servicesGrid);

    setTimeout(() => {
      $$('.scard').forEach(c => c.classList.add('is-in'));
    }, 3000);
  }

  /* ============ 13. PORTFOLIO FILTER ============ */
  const chips = $$('.chip');
  const pcards = $$('.pcard');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;

      pcards.forEach(card => {
        const cat = card.dataset.cat;
        const show = f === 'all' || cat === f;
        if (show) {
          card.classList.remove('is-hidden');
          gsap.fromTo(card,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
          );
        } else {
          gsap.to(card, {
            opacity: 0, scale: 0.9, duration: 0.3,
            onComplete: () => card.classList.add('is-hidden')
          });
        }
      });
    });
  });

  /* ============ 14. PORTFOLIO LIGHTBOX (Responsive) ============ */
  pcards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('h3')?.textContent || '';
      const cat = card.querySelector('.pcard__info span')?.textContent || '';

      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <div class="lightbox__inner">
          <button class="lightbox__close" aria-label="إغلاق">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div class="lightbox__img-wrap">
            <img src="${img.src}" alt="${title}" />
          </div>
          <div class="lightbox__caption">
            <div>
              <h3>${title}</h3>
              <span>${cat}</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(lb);
      document.body.classList.add('is-locked');
      lenis.stop();
      requestAnimationFrame(() => lb.classList.add('is-open'));

      const close = () => {
        lb.classList.remove('is-open');
        document.body.classList.remove('is-locked');
        lenis.start();
        setTimeout(() => lb.remove(), 400);
      };
      lb.querySelector('.lightbox__close').addEventListener('click', close);
      lb.addEventListener('click', e => {
        if (e.target === lb) close();
      });
      document.addEventListener('keydown', e => e.key === 'Escape' && close(), { once: true });
    });
  });

  /* ============ 15. TESTIMONIALS SWIPER ============ */
  new Swiper('.testi__swiper', {
    loop: true,
    speed: 900,
    spaceBetween: 24,
    autoplay: { delay: 5500, disableOnInteraction: false },
    pagination: { el: '.testi .swiper-pagination', clickable: true },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 1 },
      1024: { slidesPerView: 2 }
    }
  });

  /* ============ 16. PROCESS ============ */
  const processList = document.querySelector('.process__list');
  const psteps = $$('.pstep');

  psteps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        setTimeout(() => step.classList.add('is-in'), i * 120);
      }
    });
  });

  setTimeout(() => {
    psteps.forEach(s => s.classList.add('is-in'));
  }, 3000);

  if (processList && innerWidth > 768) {
    ScrollTrigger.create({
      trigger: processList,
      start: 'top 70%',
      end: 'bottom 80%',
      onUpdate: (self) => {
        processList.style.setProperty('--progress', (self.progress * 100) + '%');
      }
    });
  }

  psteps.forEach(step => {
    const num = step.querySelector('.pstep__num');
    step.addEventListener('mouseenter', () => {
      gsap.to(num, { scale: 1.15, duration: .4, ease: 'back.out(2)' });
    });
    step.addEventListener('mouseleave', () => {
      gsap.to(num, { scale: 1, duration: .4, ease: 'power2.out' });
    });
  });

  /* ============ 17. ABOUT PARALLAX ============ */
  gsap.to('.about__media img', {
    yPercent: -8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about__media',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });

  /* ============ 18. ABOUT STATS COUNTER ============ */
  $$('.astat .num').forEach(el => {
    const target = +el.dataset.count;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => el.textContent = Math.floor(obj.val) + '+'
        });
      }
    });
  });

  /* ============ 19. CONTACT FORM ============ */
  const contactForm = $('#contactForm');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"] span');
    const orig = btn.textContent;
    btn.textContent = '✓ تم الإرسال بنجاح';
    contactForm.style.pointerEvents = 'none';
    setTimeout(() => {
      btn.textContent = orig;
      contactForm.reset();
      contactForm.style.pointerEvents = '';
    }, 2500);
  });

  /* ============ 20. MAGNETIC BUTTONS ============ */
  if (!isTouch) {
    $$('[data-magnetic], .btn, .nav__cta, .nav__brand').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;

        if (el.classList.contains('btn--solid')) {
          const shineX = ((e.clientX - r.left) / r.width) * 100;
          const shineY = ((e.clientY - r.top) / r.height) * 100;
          el.style.setProperty('--mx', shineX + '%');
          el.style.setProperty('--my', shineY + '%');
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ============ 21. REFRESH ON LOAD ============ */
  window.addEventListener('load', () => {
    setTimeout(() => ScrollTrigger.refresh(), 500);
  });

  console.log('%c✦ Mada Craft BH v3.3 ✦', 'color:#C5A059;font-size:22px;font-weight:bold;font-family:Georgia;');
  console.log('%cInteractive Hero Studio — All Fixed', 'color:#0F3626;font-size:12px;');

})();
