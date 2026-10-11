/* ==========================================================
   MADA CRAFT BH v2.2 — Final Complete
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
  let mx = 0, my = 0, cx = 0, cy = 0;

  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
    });
    const raf = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
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

  /* ============ 3. LENIS SMOOTH SCROLL ============ */
  const lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.8,
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  /* ============ 4. GSAP SETUP ============ */
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);

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

  /* ============ 8. HERO INTRO ============ */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero__title .word', {
        y: 0, duration: 1.15, stagger: 0.09,
      })
      .from('.hero__eyebrow', { y: 20, opacity: 0, duration: .8 }, '-=1')
      .from('.hero__desc', { y: 20, opacity: 0, duration: .8 }, '-=0.7')
      .from('.hero__cta > *', { y: 20, opacity: 0, duration: .7, stagger: .1 }, '-=0.6')
      .from('.hero__stat', { y: 20, opacity: 0, duration: .7, stagger: .1 }, '-=0.5')
      .from('.hero__scroll', { opacity: 0, duration: .6 }, '-=0.3');

    $$('.hero__stat .num').forEach(el => {
      const target = +el.dataset.count;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => el.textContent = Math.floor(obj.val),
      });
    });
  }

  /* ============ 9. HERO PARALLAX ============ */
  gsap.to('.hero__bg-img', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  gsap.to('.hero__content', {
    yPercent: -15,
    opacity: 0.3,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  /* ============ 10. ORBS PARALLAX ============ */
  $$('.orb').forEach((orb, i) => {
    gsap.to(orb, {
      yPercent: -30 - i * 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

  /* ============ 11. SERVICES — Reveal (CSS-based, يعمل دائماً) ============ */
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

    // Fallback: إذا ما اشتغل الـ observer لأي سبب، أظهر كل الكروت بعد 3 ثواني
    setTimeout(() => {
      $$('.scard').forEach(c => c.classList.add('is-in'));
    }, 3000);
  }

  /* ============ 12. PORTFOLIO FILTER ============ */
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

  /* ============ 13. PORTFOLIO LIGHTBOX ============ */
  pcards.forEach(card => {
    card.addEventListener('click', () => {
      if (isTouch) return;
      const img = card.querySelector('img');
      const title = card.querySelector('h3')?.textContent || '';
      const cat = card.querySelector('.pcard__info span')?.textContent || '';

      const lb = document.createElement('div');
      lb.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(10,31,22,.96);
        backdrop-filter:blur(20px);
        display:grid; place-items:center;
        padding:1.5rem; opacity:0;
        transition:opacity .4s ease;
        cursor:pointer;
      `;
      lb.innerHTML = `
        <div style="max-width:900px; width:100%;">
          <img src="${img.src}" alt="${title}"
            style="width:100%; border-radius:20px; box-shadow:0 40px 80px rgba(0,0,0,.6);" />
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.25rem; color:#F4F1EA; gap:1rem; flex-wrap:wrap;">
            <div>
              <h3 style="font-size:1.25rem; color:#F4F1EA; margin-bottom:.25rem; font-family:'IBM Plex Sans Arabic', sans-serif;">${title}</h3>
              <span style="font-size:.75rem; color:#C5A059; letter-spacing:.2em; text-transform:uppercase; font-family:'Outfit', sans-serif;">${cat}</span>
            </div>
            <span style="color:#C5A059; font-size:.85rem; letter-spacing:.1em; font-family:'IBM Plex Sans Arabic', sans-serif;">إغلاق ✕</span>
          </div>
        </div>
      `;
      document.body.appendChild(lb);
      requestAnimationFrame(() => lb.style.opacity = '1');

      const close = () => {
        lb.style.opacity = '0';
        setTimeout(() => lb.remove(), 400);
      };
      lb.addEventListener('click', close);
      document.addEventListener('keydown', e => e.key === 'Escape' && close(), { once: true });
    });
  });

  /* ============ 14. TESTIMONIALS SWIPER ============ */
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

  /* ============ 15. PROCESS — Line Progress + Reveal ============ */
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

  // Fallback: إظهار كل الخطوات بعد 3 ثواني إذا ما اشتغل السكرول
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

  /* ============ 16. ABOUT MEDIA PARALLAX ============ */
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

  /* ============ 17. ABOUT STATS COUNTER ============ */
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

  /* ============ 18. CONTACT FORM ============ */
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

  /* ============ 19. MAGNETIC BUTTONS ============ */
  if (!isTouch) {
    $$('.btn, .nav__cta, .nav__brand').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ============ 20. REFRESH ON LOAD ============ */
  window.addEventListener('load', () => {
    setTimeout(() => ScrollTrigger.refresh(), 500);
  });

  console.log('%c✦ Mada Craft BH ✦', 'color:#C5A059;font-size:22px;font-weight:bold;font-family:Georgia;');
  console.log('%cv2.2 — Final Complete', 'color:#0F3626;font-size:12px;');

})();
