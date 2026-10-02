(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cover = document.querySelector('.cover');
  const possibleTrigger = document.querySelector('.cover-possible');
  const framing = document.querySelector('.framing');
  const frame = document.querySelector('.frame-window');
  const maximum = document.querySelector('.maximum');
  const transformWord = document.querySelector('.word-transform');
  const transformLetters = transformWord ? [...transformWord.querySelectorAll('span')] : [];
  const trajectory = document.querySelector('.trajectory');
  const terrainPath = document.querySelector('.terrain-path');
  const explorerDot = document.querySelector('.explorer-dot');
  const summitMarkers = [...document.querySelectorAll('.summit-marker')];
  const ending = document.querySelector('.ending');

  const updateCover = () => cover.classList.toggle('is-past', window.scrollY > 32);
  updateCover();
  window.addEventListener('scroll', updateCover, { passive: true });

  if (possibleTrigger) {
    possibleTrigger.addEventListener('click', () => {
      if (cover.classList.contains('is-fallen')) return;
      cover.classList.add('is-fallen');
      possibleTrigger.disabled = true;
    });
  }

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

  if (ending) {
    const updateEnding = () => {
      if (reduceMotion) {
        ending.dataset.stage = '4';
        return;
      }
      const rect = ending.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * .82 - rect.top) / (window.innerHeight * .76)));
      const stage = progress < .15 ? 0 : progress < .36 ? 1 : progress < .57 ? 2 : progress < .79 ? 3 : 4;
      ending.dataset.stage = String(stage);
    };
    updateEnding();
    window.addEventListener('scroll', updateEnding, { passive: true });
    window.addEventListener('resize', updateEnding);
  }

  if (transformWord) {
    const letterOffsets = [-.02, .045, -.035, .07, -.055, .035, -.065, .04, -.025, .05, -.015];
    const updateTransformWord = () => {
      const maximumRect = maximum.getBoundingClientRect();
      const rawProgress = reduceMotion
        ? 1
        : Math.max(0, Math.min(1, (window.innerHeight * .82 - maximumRect.top) / (window.innerHeight * 1.04)));
      const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      const fontSize = Number.parseFloat(getComputedStyle(transformWord).fontSize);
      const originalLeft = maximumRect.left + Number.parseFloat(getComputedStyle(maximum).paddingLeft);
      const scaleX = 1 + progress * .12;
      const estimatedTracking = fontSize * .16 * 10 * progress;
      const availableShift = Math.max(0, window.innerWidth - originalLeft - transformWord.offsetWidth * scaleX - estimatedTracking - window.innerWidth * .06);
      const desiredShift = window.innerWidth > 700 ? window.innerWidth * .31 : window.innerWidth * .015;
      const shift = Math.min(desiredShift, availableShift) * progress;
      transformWord.style.transform = `translate3d(${shift.toFixed(2)}px, ${(-fontSize * .075 * progress).toFixed(2)}px, 0) scaleX(${scaleX.toFixed(3)})`;
      transformWord.style.letterSpacing = `${(.16 * progress).toFixed(3)}em`;
      transformLetters.forEach((letter, index) => {
        const offset = letterOffsets[index] || 0;
        letter.style.transform = `translateY(${(offset * progress).toFixed(3)}em) scaleY(${(1 + Math.abs(offset) * progress * .18).toFixed(3)})`;
      });
    };
    updateTransformWord();
    if (!reduceMotion) window.addEventListener('scroll', updateTransformWord, { passive: true });
    window.addEventListener('resize', updateTransformWord);
  }

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
