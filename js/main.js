(() => {
  const section = document.querySelector('.framing');
  const windowEl = document.querySelector('.frame-window');
  const frames = ['close', 'wide', 'split'];
  const nextFrame = () => {
    const current = frames.indexOf(windowEl.dataset.frameState);
    windowEl.dataset.frameState = frames[(current + 1) % frames.length];
  };
  windowEl.addEventListener('click', nextFrame);
  windowEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      nextFrame();
    }
  });

  const revealSignals = () => section.classList.add('is-exploring');
  section.addEventListener('pointermove', revealSignals, { once: true });
  section.addEventListener('touchstart', revealSignals, { once: true, passive: true });
})();
