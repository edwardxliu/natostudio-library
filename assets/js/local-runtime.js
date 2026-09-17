(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const revealPage = () => {
    const root = $('.root');
    root?.classList.remove('hide', 'hidden', 'disable-all');
    document.documentElement.classList.remove('no-scrollbar');
    document.body.style.backgroundColor = '';
    $$('.hero__text.hidden, .hero__stripes.hidden, .work-item.hidden').forEach(el => el.classList.remove('hidden'));
  };

  const runPreloader = () => {
    const preloader = $('.main-preloader');
    if (!preloader) return revealPage();
    preloader.classList.remove('hide');
    const words = $$('.main-preloader__word, .main-preloader__text', preloader);
    const images = $$('.main-preloader__images img', preloader);
    words.forEach((word, index) => setTimeout(() => word.classList.add('show'), index * 320));
    images.forEach((image, index) => {
      image.style.opacity = '0';
      image.style.transform = `translate3d(0,0,${-80 * index}px) scale(.7)`;
      setTimeout(() => {
        image.style.opacity = '1';
        image.style.transform = 'translate3d(0,0,0) scale(1)';
      }, 420 + index * 115);
    });
    const finish = () => {
      revealPage();
      preloader.classList.add('local-exit');
      setTimeout(() => preloader.remove(), 800);
    };
    setTimeout(finish, reduceMotion ? 700 : 3100);
  };

  const setupCanvas = () => {
    const canvas = $('.hero__bg canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, pointerX = .68, pointerY = .48, time = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth || innerWidth;
      height = canvas.clientHeight || innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      time += reduceMotion ? 0 : .009;
      ctx.clearRect(0, 0, width, height);
      const x = width * (pointerX + Math.sin(time) * .035);
      const y = height * (pointerY + Math.cos(time * .8) * .025);
      const radius = Math.max(width, height) * .64;
      const gradient = ctx.createRadialGradient(x - radius * .16, y - radius * .18, radius * .02, x, y, radius);
      gradient.addColorStop(0, 'rgba(255,255,255,.96)');
      gradient.addColorStop(.18, 'rgba(195,198,194,.88)');
      gradient.addColorStop(.48, 'rgba(84,89,87,.72)');
      gradient.addColorStop(.78, 'rgba(15,18,17,.28)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * .86, radius, time * .08, 0, Math.PI * 2);
      ctx.fill();
      requestAnimationFrame(draw);
    };
    addEventListener('resize', resize, { passive: true });
    addEventListener('pointermove', event => {
      pointerX += (event.clientX / innerWidth - pointerX) * .16;
      pointerY += (event.clientY / innerHeight - pointerY) * .16;
    }, { passive: true });
    resize();
    draw();
  };

  const setupReveal = () => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-inview', 'show');
      entry.target.style.removeProperty('opacity');
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-anim], .text-anim, .case-card, .about__content__fig, .about__awards__item').forEach(el => observer.observe(el));
  };

  const setupCursor = () => {
    if (matchMedia('(pointer: coarse)').matches) return;
    const cursor = $('.cursor--main');
    const hoverCursor = $('.cursor--hovers');
    if (!cursor) return;
    document.documentElement.classList.add('local-custom-cursor');
    addEventListener('pointermove', event => {
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      if (hoverCursor) hoverCursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    }, { passive: true });
    $$('[data-cursor="discover"]').forEach(el => {
      el.addEventListener('pointerenter', () => document.body.classList.add('local-discover'));
      el.addEventListener('pointerleave', () => document.body.classList.remove('local-discover'));
    });
  };

  const setupNavigation = () => {
    const navbar = $('.navbar');
    $('.navbar__toggle')?.addEventListener('click', () => navbar?.classList.toggle('local-menu-open'));
    $$('.navbar__link').forEach(link => link.addEventListener('click', () => navbar?.classList.remove('local-menu-open')));
    $$('[data-component="copy-mail"]').forEach(el => el.addEventListener('click', async () => {
      const mail = el.dataset.mail;
      if (mail) await navigator.clipboard?.writeText(mail);
      el.classList.add('local-copied');
      setTimeout(() => el.classList.remove('local-copied'), 1200);
    }));
  };

  const setupProjects = () => {
    const details = $('.work-details');
    const projects = $$('.work-details .work');
    $$('.case-card > a').forEach((link, index) => link.addEventListener('click', event => {
      if (!details || !projects[index]) return;
      event.preventDefault();
      projects.forEach(project => project.classList.add('hide'));
      projects[index].classList.remove('hide');
      details.classList.remove('hide');
      document.documentElement.classList.add('no-scrollbar');
    }));
    $('.work-details__close-bt')?.addEventListener('click', () => {
      details?.classList.add('hide');
      document.documentElement.classList.remove('no-scrollbar');
    });
    $$('.work-item__header').forEach(header => header.addEventListener('click', () => {
      const item = header.closest('.work-item');
      const panel = $('.work-item__details', item);
      panel?.classList.toggle('hide');
      item?.classList.toggle('local-open');
    }));
  };

  const boot = () => {
    if (window.main?.scroller) {
      document.documentElement.classList.add('original-runtime-ready');
      return;
    }
    document.documentElement.classList.add('local-runtime-ready');
    document.documentElement.style.setProperty('--vh', `${innerHeight}px`);
    document.documentElement.style.setProperty('--svh', `${innerHeight}px`);
    runPreloader();
    setupCanvas();
    setupReveal();
    setupCursor();
    setupNavigation();
    setupProjects();
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1800), { once: true })
    : setTimeout(boot, 1800);
})();
