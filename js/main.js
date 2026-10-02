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
  const closingSphere = document.querySelector('.closing-sphere');

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

  if (closingSphere) {
    const context = closingSphere.getContext('2d');
    let angle = .42;
    let frameId = null;
    let isVisible = false;

    const resizeSphere = () => {
      const rect = closingSphere.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (closingSphere.width !== width || closingSphere.height !== height) {
        closingSphere.width = width;
        closingSphere.height = height;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      return rect;
    };

    const drawSphere = () => {
      const rect = resizeSphere();
      const width = rect.width;
      const height = rect.height;
      const centerX = width * .5;
      const centerY = height * .5;
      const radius = Math.min(width, height) * .43;
      const yaw = angle;
      const pitch = -.16;
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      context.lineCap = 'round';

      const project = (x, y, z) => {
        const rotatedX = x * Math.cos(yaw) - z * Math.sin(yaw);
        const rotatedZ = x * Math.sin(yaw) + z * Math.cos(yaw);
        const rotatedY = y * Math.cos(pitch) - rotatedZ * Math.sin(pitch);
        const depth = y * Math.sin(pitch) + rotatedZ * Math.cos(pitch);
        const perspective = 1 / (1 - depth * .25);
        return [centerX + rotatedX * radius * perspective, centerY + rotatedY * radius * perspective, depth];
      };

      const stroke = (points, alpha) => {
        context.beginPath();
        points.forEach((point, index) => {
          if (index === 0) context.moveTo(point[0], point[1]);
          else context.lineTo(point[0], point[1]);
        });
        context.strokeStyle = `rgba(244,243,239,${alpha})`;
        context.stroke();
      };

      [-1.16, -.86, -.53, -.18, .18, .53, .86, 1.16].forEach((latitude) => {
        const points = [];
        for (let step = 0; step <= 42; step += 1) {
          const longitude = step / 42 * Math.PI * 2;
          const radiusAtLatitude = Math.cos(latitude);
          points.push(project(radiusAtLatitude * Math.cos(longitude), Math.sin(latitude), radiusAtLatitude * Math.sin(longitude)));
        }
        stroke(points, .34);
      });

      for (let meridian = 0; meridian < 12; meridian += 1) {
        const points = [];
        const longitude = meridian / 12 * Math.PI * 2;
        for (let step = 0; step <= 32; step += 1) {
          const latitude = -Math.PI / 2 + step / 32 * Math.PI;
          points.push(project(Math.cos(latitude) * Math.cos(longitude), Math.sin(latitude), Math.cos(latitude) * Math.sin(longitude)));
        }
        stroke(points, meridian % 3 === 0 ? .48 : .27);
      }
    };

    const renderSphere = () => {
      frameId = null;
      if (!isVisible) return;
      drawSphere();
      if (!reduceMotion) {
        angle += .0022;
        frameId = window.requestAnimationFrame(renderSphere);
      }
    };

    const sphereObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (!isVisible && frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
      if (isVisible && frameId === null) renderSphere();
    }, { threshold: 0 });
    sphereObserver.observe(closingSphere);
    window.addEventListener('resize', () => {
      if (isVisible) drawSphere();
    });
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
      const compactLayout = window.innerWidth <= 700;
      const scaleX = 1 + progress * (compactLayout ? .05 : .12);
      const tracking = compactLayout ? .09 : .16;
      const estimatedTracking = fontSize * tracking * 10 * progress;
      const availableShift = Math.max(0, window.innerWidth - originalLeft - transformWord.offsetWidth * scaleX - estimatedTracking - window.innerWidth * (compactLayout ? .14 : .06));
      const desiredShift = compactLayout ? 0 : window.innerWidth * .31;
      const shift = Math.min(desiredShift, availableShift) * progress;
      transformWord.style.transform = `translate3d(${shift.toFixed(2)}px, ${(-fontSize * .075 * progress).toFixed(2)}px, 0) scaleX(${scaleX.toFixed(3)})`;
      transformWord.style.letterSpacing = `${(tracking * progress).toFixed(3)}em`;
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
