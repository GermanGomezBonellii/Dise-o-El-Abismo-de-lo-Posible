(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cover = document.querySelector('.cover');
  const framing = document.querySelector('.framing');
  const frame = document.querySelector('.frame-window');
  const maximum = document.querySelector('.maximum');
  const archive = document.querySelector('.archive');
  const archiveTrigger = document.querySelector('.archive-trigger');

  const updateCover = () => cover.classList.toggle('is-past', window.scrollY > 32);
  updateCover();
  window.addEventListener('scroll', updateCover, { passive: true });

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-seen');
    });
  }, { threshold: reduceMotion ? 0 : 0.22 });
  reveal.observe(framing);
  reveal.observe(maximum);

  const revealSignals = () => framing.classList.add('is-exploring');
  framing.addEventListener('pointermove', revealSignals, { once: true });
  framing.addEventListener('touchstart', revealSignals, { once: true, passive: true });

  const changeFrame = () => {
    frame.dataset.frame = String((Number(frame.dataset.frame) + 1) % 3);
    revealSignals();
  };
  frame.addEventListener('click', changeFrame);
  frame.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      changeFrame();
    }
  });

  const setArchive = (open) => {
    archive.classList.toggle('is-open', open);
    archiveTrigger.setAttribute('aria-expanded', String(open));
  };

  const hoverCapable = window.matchMedia('(hover: hover)').matches;
  if (hoverCapable) {
    archive.addEventListener('pointerenter', () => setArchive(true));
    archive.addEventListener('pointerleave', () => setArchive(false));
    archiveTrigger.addEventListener('focus', () => setArchive(true));
    archiveTrigger.addEventListener('blur', () => setArchive(false));
  }

  archiveTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    setArchive(!archive.classList.contains('is-open'));
  });
  document.addEventListener('click', (event) => {
    if (!archive.contains(event.target)) setArchive(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setArchive(false);
      archiveTrigger.focus();
    }
  });
})();
