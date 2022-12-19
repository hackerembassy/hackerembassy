const easingOutQuint = (x, t, b, c, d) =>
  c * ((t = t / d - 1) * t * t * t * t + 1) + b;

function smoothScrollPolyfill (node, key, target) {
  const startTime = Date.now();
  const offset = node[key];
  const gap = target - offset;
  const duration = 1000;
  let interrupt = false;

  const step = () => {
    const elapsed = Date.now() - startTime;
    const percentage = elapsed / duration;

    if (interrupt) {
      return;
    }

    if (percentage > 1) {
        cleanup();
        return;
      }
  
      node[key] = easingOutQuint(0, elapsed, offset, gap, duration);
      requestAnimationFrame(step);
    }
  
    const cancel = () => {
      interrupt = true;
      cleanup();
    }
  
    const cleanup = () => {
      node.removeEventListener('wheel', cancel);
      node.removeEventListener('touchstart', cancel);
    }
  
    node.addEventListener('wheel', cancel, { passive: true });
    node.addEventListener('touchstart', cancel, { passive: true });
  
    step();
  
    return cancel;
  }
  
  function testSupportsSmoothScroll () {
    let supports = false;
    try {
      let div = document.createElement('div');
      div.scrollTo({
        top: 0,
        get behavior () {
          supports = true;
          return 'smooth';
        }
      })
    } catch (err) {}; // Edge throws an error
    return supports;
  }
  
  const hasNativeSmoothScroll = testSupportsSmoothScroll();
  
  function smoothScroll (node, topOrLeft, horizontal) {
    if (hasNativeSmoothScroll) {
      return node.scrollTo({
        [horizontal ? 'left' : 'top']: topOrLeft,
        behavior: 'smooth'
      })
    } else {
      return smoothScrollPolyfill(node, horizontal ? 'scrollLeft' : 'scrollTop', topOrLeft);
    }
  }
  
  function debounce(func, ms) {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null
        func()
      }, ms)
    }
  }
  
  const indicators = document.querySelectorAll('.indicator-button');
  const scroller = document.querySelector('.scroll');
  
  function setAriaLabels() {
    indicators.forEach((indicator, i) => {
      indicator.setAttribute('aria-label', `Scroll to item #${i + 1}`);
    })
  }
  
  function setAriaPressed(index) {
    indicators.forEach((indicator, i) => {
      indicator.setAttribute('aria-pressed', !!(i === index));
    })
  }
  
  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      setAriaPressed(i);
      const scrollLeft = Math.floor(scroller.scrollWidth * (i / 6));
      smoothScroll(scroller, scrollLeft, true);
    })
  })
  
  scroller.addEventListener('scroll', debounce(() => {
    let index = Math.round((scroller.scrollLeft / scroller.scrollWidth) * 6);
    setAriaPressed(index);
  }, 200))
  
  setAriaLabels();