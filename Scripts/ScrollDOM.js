import TyperDOM from "./TyperDOM.js";

class ScrollDOM {
  static hasNativeSmoothScroll = this.testSupportsSmoothScroll();
  static indicators = document.querySelectorAll(".indicator-button");
  static scroller = document.querySelector(".scroll");
  static scrollElements = document.querySelectorAll(".scroll-item-outer");
  static scrollNamePlacement = document.querySelector("#scroll-name-placement");

  static easingOutQuint = (elapsed, offset, gap, duration) => {
    elapsed = elapsed / duration - 1;
    return gap * (Math.pow(elapsed, 5) + 1) + offset;
  };

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

      node[key] = this.easingOutQuint(elapsed, offset, gap, duration);
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
      indicator.setAttribute("aria-pressed", i === index);
    });
  }

  static convertToImageCommand(text) {
    return `display /home/user/images/${text}.png`;
  }

  static init() {
    this.scrollNamePlacement.dataset.type = `["${this.convertToImageCommand(
      this.scrollElements[0].dataset.name
    )}"]`;
    this.indicators.forEach((indicator, i) => {
      indicator.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.setAriaPressed(i);
        TyperDOM.StopTypingAll();
        this.scrollNamePlacement.dataset.type = `["${this.convertToImageCommand(
          this.scrollElements[i].dataset.name
        )}"]`;
        TyperDOM.StartTypingAll();

        const scrollTop = this.scroller.scrollHeight * (i / 8);
        this.smoothScroll(this.scroller, scrollTop, false);
      });
    });

    this.scroller.addEventListener(
      "scroll",
      this.debounce(() => {
        let index = Math.round(
          (this.scroller.scrollTop / this.scroller.scrollHeight) * 8
        );
        this.setAriaPressed(index);
      }, 200)
    );

    this.setAriaLabels();
  }
}

export default ScrollDOM;
