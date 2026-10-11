/* ==========================================================
   MADA CRAFT BH — Main JavaScript
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ============ 1. PRELOADER ============ */
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('is-hidden');
            document.body.classList.remove('no-scroll');
            initHeroAnimations();
        }, 2200);
    });
    document.body.classList.add('no-scroll');

    /* ============ 2. CUSTOM CURSOR ============ */
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateFollower = () => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateFollower);
    };
    animateFollower();

    // Cursor hover interactions
    document.querySelectorAll('[data-cursor="hover"], a, button, .filter-btn, .portfolio-item')
        .forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
        });

    /* ============ 3. LENIS SMOOTH SCROLL ============ */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor links with smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80, duration: 1.4 });
                // close mobile menu
                navMenu.classList.remove('open');
                menuToggle.classList.remove('active');
            }
        });
    });

    /* ============ 4. GSAP + SCROLLTRIGGER ============ */
    gsap.registerPlugin(ScrollTrigger);

    // Hero parallax
    gsap.to('.hero__bg-img', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        }
    });

    // Hero content fade on scroll
    gsap.to('.hero__content', {
        y: 100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        }
    });

    // Section titles subtle parallax
    gsap.utils.toArray('.section__title').forEach((title) => {
        gsap.from(title, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 85%' }
        });
    });

    /* ============ 5. NAVBAR ============ */
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 60);
        backToTop.classList.toggle('visible', y > 600);
    });

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        menuToggle.classList.toggle('active');
    });

    /* ============ 6. INTERSECTION OBSERVER (REVEAL) ============ */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    /* ============ 7. HERO INTRO ANIMATION ============ */
    function initHeroAnimations() {
        gsap.timeline({ defaults: { ease: 'power4.out' } })
            .from('.hero__eyebrow', { y: 30, opacity: 0, duration: 1 })
            .from('.hero__title .line', { yPercent: 100, duration: 1.2, stagger: 0.15 }, '-=0.6')
            .from('.hero__desc', { y: 30, opacity: 0, duration: 0.9 }, '-=0.7')
            .from('.hero__cta .btn', { y: 20, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.6')
            .from('.hero__stat', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')
            .from('.hero__scroll-hint', { opacity: 0, duration: 0.8 }, '-=0.4');

        // Number counters
        animateCounters();
    }

    /* ============ 8. COUNTERS ============ */
    function animateCounters() {
        document.querySelectorAll('[data-count]').forEach(el => {
            const target = +el.dataset.count;
            let current = 0;
            const step = target / 60;
            const tick = () => {
                current += step;
                if (current < target) {
                    el.textContent = Math.floor(current);
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target;
                }
            };
            tick();
        });
    }

    // Counters for About section on scroll
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    aboutObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        aboutObserver.observe(aboutSection);
    }

    /* ============ 9. 3D TILT (SERVICES) ============ */
    document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    /* ============ 10. PORTFOLIO FILTER ============ */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            portfolioItems.forEach(item => {
                const cat = item.dataset.cat;
                if (filter === 'all' || cat === filter) {
                    item.classList.remove('is-hidden');
                    gsap.fromTo(item,
                        { opacity: 0, scale: 0.85, y: 30 },
                        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
                    );
                } else {
                    item.classList.add('is-hidden');
                }
            });
        });
    });

    // Lightbox (simple)
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4').textContent;

            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position:fixed; inset:0; background:rgba(15,54,38,.95);
                backdrop-filter:blur(20px); z-index:9999;
                display:grid; place-items:center; padding:2rem;
                opacity:0; transition:opacity .4s ease;
                cursor:pointer;
            `;
            lightbox.innerHTML = `
                <div style="max-width:900px; width:100%; text-align:center;">
                    <img src="${img.src}" style="width:100%; border-radius:16px; box-shadow:0 40px 80px rgba(0,0,0,.5);" />
                    <p style="color:#C5A059; margin-top:1.5rem; font-size:1.25rem; font-weight:600;">${title}</p>
                    <p style="color:rgba(244,241,234,.6); font-size:.85rem; margin-top:.5rem;">انقر في أي مكان للإغلاق</p>
                </div>
            `;
            document.body.appendChild(lightbox);
            requestAnimationFrame(() => lightbox.style.opacity = '1');
            lightbox.addEventListener('click', () => {
                lightbox.style.opacity = '0';
                setTimeout(() => lightbox.remove(), 400);
            });
        });
    });

    /* ============ 11. SWIPER TESTIMONIALS ============ */
    new Swiper('.testimonials__swiper', {
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        effect: 'slide',
        speed: 1000,
        spaceBetween: 40,
        breakpoints: {
            768: { slidesPerView: 1 }
        }
    });

    /* ============ 12. BACK TO TOP ============ */
    backToTop.addEventListener('click', () => {
        lenis.scrollTo(0, { duration: 1.5 });
    });

    /* ============ 13. LANGUAGE TOGGLE (Simple Demo) ============ */
    const langToggle = document.getElementById('langToggle');
    let isArabic = true;
    langToggle.addEventListener('click', () => {
        isArabic = !isArabic;
        const html = document.documentElement;
        html.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
        html.setAttribute('lang', isArabic ? 'ar' : 'en');
        langToggle.textContent = isArabic ? 'EN' : 'AR';
    });

    /* ============ 14. CONTACT FORM ============ */
    const contactForm = document.getElementById('contactForm');
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = '✓ تم الإرسال بنجاح';
        btn.style.background = 'linear-gradient(135deg, #2d7a52, #0F3626)';
        btn.style.color = '#C5A059';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
            contactForm.reset();
        }, 3000);
    });

    /* ============ 15. LAZY LOADING (Native) ============ */
    // Images already have loading="lazy" attribute

    console.log('%c✦ Mada Craft BH ✦', 'color:#C5A059; font-size:24px; font-weight:bold;');
    console.log('%cموقع فاخر بتصميم سينمائي', 'color:#0F3626; font-size:14px;');
});
