const easingOutQuint = (x, t, b, c, d) =>
  c * ((t = t / d - 1) * t * t * t * t + 1) + b;

function smoothScrollPolyfill(node, key, target) {
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
  };

  const cancel = () => {
    interrupt = true;
    cleanup();
  };

  const cleanup = () => {
    node.removeEventListener("wheel", cancel);
    node.removeEventListener("touchstart", cancel);
  };

  node.addEventListener("wheel", cancel, { passive: true });
  node.addEventListener("touchstart", cancel, { passive: true });

  step();

  return cancel;
}

function testSupportsSmoothScroll() {
  let supports = false;
  try {
    let div = document.createElement("div");
    div.scrollTo({
      top: 0,
      get behavior() {
        supports = true;
        return "smooth";
      },
    });
  } catch (err) {} // Edge throws an error
  return supports;
}

const hasNativeSmoothScroll = testSupportsSmoothScroll();

function smoothScroll(node, topOrLeft, horizontal) {
  if (hasNativeSmoothScroll) {
    return node.scrollTo({
      [horizontal ? "left" : "top"]: topOrLeft,
      behavior: "smooth",
    });
  } else {
    return smoothScrollPolyfill(
      node,
      horizontal ? "scrollLeft" : "scrollTop",
      topOrLeft
    );
  }
}

function debounce(func, ms) {
  let timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func();
    }, ms);
  };
}

const indicators = document.querySelectorAll(".indicator-button");
const scroller = document.querySelector(".scroll");

function setAriaLabels() {
  indicators.forEach((indicator, i) => {
    indicator.setAttribute("aria-label", `Scroll to item #${i + 1}`);
  });
}

function setAriaPressed(index) {
  indicators.forEach((indicator, i) => {
    indicator.setAttribute("aria-pressed", !!(i === index));
  });
}

indicators.forEach((indicator, i) => {
  indicator.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAriaPressed(i);
    const scrollLeft = Math.floor(scroller.scrollWidth * (i / 6));
    smoothScroll(scroller, scrollLeft, true);
  });
});

scroller.addEventListener(
  "scroll",
  debounce(() => {
    let index = Math.round((scroller.scrollLeft / scroller.scrollWidth) * 6);
    setAriaPressed(index);
  }, 200)
);

setAriaLabels();

function Typing (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = "";
  this.tick();
  this.isDeleting = false;
};

Typing.prototype.tick = function () {
  let i = this.loopNum % this.toRotate.length;
  let fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + "</span>";

  let that = this;
  let delta = 120 - Math.random() * 100;

  if (this.isDeleting) {
    delta /= 2;
  }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === "") {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};

window.onload = function () {
  let elements = document.getElementsByClassName("typed");
  for (let i = 0; i < elements.length; i++) {
    let toRotate = elements[i].getAttribute("data-type");
    let period = elements[i].getAttribute("data-period");
    if (toRotate) {
      new Typing(elements[i], JSON.parse(toRotate), period);
    }
  }

  let css = document.createElement("style");
  css.innerHTML = ".typed > .wrap { border-right: 0.08em solid #fff}";
  document.body.appendChild(css);
};
