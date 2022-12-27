class ScrollDOM {
  static hasNativeSmoothScroll = this.testSupportsSmoothScroll();
  static indicators = document.querySelectorAll(".indicator-button");
  static scroller = document.querySelector(".scroll");
  static easingOutQuint = (x, t, b, c, d) =>
    c * ((t = t / d - 1) * t * t * t * t + 1) + b;

  static smoothScrollPolyfill(node, key, target) {
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

      node[key] = this.easingOutQuint(0, elapsed, offset, gap, duration);
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

  static testSupportsSmoothScroll() {
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

  static smoothScroll(node, topOrLeft, horizontal) {
    if (this.hasNativeSmoothScroll) {
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

  static debounce(func, ms) {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        func();
      }, ms);
    };
  }

  static setAriaLabels() {
    this.indicators.forEach((indicator, i) => {
      indicator.setAttribute("aria-label", `Scroll to item #${i + 1}`);
    });
  }

  static setAriaPressed(index) {
    this.indicators.forEach((indicator, i) => {
      indicator.setAttribute("aria-pressed", !!(i === index));
    });
  }

  static init() {
    this.indicators.forEach((indicator, i) => {
      indicator.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setAriaPressed(i);
        const scrollLeft = Math.floor(this.scroller.scrollWidth * (i / 6));
        this.smoothScroll(this.scroller, scrollLeft, true);
      });
    });

    this.scroller.addEventListener(
      "scroll",
      this.debounce(() => {
        let index = Math.round(
          (this.scroller.scrollLeft / this.scroller.scrollWidth) * 6
        );
        this.setAriaPressed(index);
      }, 200)
    );

    this.setAriaLabels();
  }
}

export default ScrollDOM;
