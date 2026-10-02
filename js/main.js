(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cover = document.querySelector('.cover');
  const framing = document.querySelector('.framing');
  const frame = document.querySelector('.frame-window');
  const maximum = document.querySelector('.maximum');
  const trajectory = document.querySelector('.trajectory');
  const terrainPath = document.querySelector('.terrain-path');
  const explorerDot = document.querySelector('.explorer-dot');
  const summitMarkers = [...document.querySelectorAll('.summit-marker')];
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

  if (terrainPath && explorerDot) {
    const length = terrainPath.getTotalLength();
    const clamp = (value) => Math.max(0, Math.min(1, value));
    const smooth = (value) => value * value * (3 - 2 * value);
    const nearestPathPosition = (marker) => {
      const targetX = Number(marker.getAttribute('cx'));
      const targetY = Number(marker.getAttribute('cy'));
      let nearest = 0;
      let distance = Infinity;
      for (let step = 0; step <= 600; step += 1) {
        const progress = step / 600;
        const point = terrainPath.getPointAtLength(length * progress);
        const currentDistance = (point.x - targetX) ** 2 + (point.y - targetY) ** 2;
        if (currentDistance < distance) {
          nearest = progress;
          distance = currentDistance;
        }
      }
      return nearest;
    };
    const [firstPeak, secondPeak, thirdPeak] = summitMarkers.map(nearestPathPosition);
    const travel = (progress) => {
      if (progress < .22) return firstPeak * smooth(progress / .22);
      if (progress < .38) return firstPeak;
      if (progress < .72) return firstPeak + (secondPeak - firstPeak) * smooth((progress - .38) / .34);
      if (progress < .84) return secondPeak;
      return secondPeak + (thirdPeak - secondPeak) * smooth((progress - .84) / .16);
    };
    const moveExplorer = (progress) => {
      const point = terrainPath.getPointAtLength(length * travel(progress));
      explorerDot.setAttribute('cx', point.x.toFixed(2));
      explorerDot.setAttribute('cy', point.y.toFixed(2));
      explorerDot.style.opacity = progress > .01 ? '1' : '0';
      summitMarkers.forEach((marker, index) => {
        const reached = progress >= [.22, .72, .98][index];
        marker.classList.toggle('is-visited', reached);
      });
    };
    const updateTerrain = () => {
      if (reduceMotion) {
        moveExplorer(1);
        summitMarkers.forEach((marker) => marker.classList.add('is-visited'));
        return;
      }
      const rect = trajectory.getBoundingClientRect();
      const progress = clamp((window.innerHeight * .86 - rect.top) / (window.innerHeight * .62));
      moveExplorer(progress);
    };
    updateTerrain();
    if (!reduceMotion) window.addEventListener('scroll', updateTerrain, { passive: true });
    window.addEventListener('resize', updateTerrain);
  }
})();
