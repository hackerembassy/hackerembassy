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

class TyperDOM {
  constructor(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = "";
  }

  static typers;

  static {
    let css = document.createElement("style");
    css.innerHTML = ".typed > .wrap { border-right: 0.08em solid #fff}";
    document.body.appendChild(css);
  }

  static *GetAllTypers() {
    let elements = document.getElementsByClassName("typed");
    for (let i = 0; i < elements.length; i++) {
      let toRotate = elements[i].getAttribute("data-type");
      let period = elements[i].getAttribute("data-period");
      if (toRotate) {
        yield new TyperDOM(elements[i], JSON.parse(toRotate), period);
      }
    }
  }

  static StartTypingAll() {
    this.typers = [...this.GetAllTypers()];
    for (const typer of this.typers) {
      typer.StartTyping();
    }
  }

  static StopTypingAll() {
    for (const typer of this.typers) {
      typer.StopTyping();
    }
  }

  typingTimeout;

  StartTyping() {
    this.tick();
    this.isDeleting = false;
  }

  StopTyping() {
    clearTimeout(this.typingTimeout);
  }

  tick() {
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

    this.typingTimeout = setTimeout(function () {
      that.tick();
    }, delta);
  }
}


class DOMHelpers {
  static displayElement(element, displayType = "block") {
    element.style.display = displayType;
  }

  static hideElement(element) {
    element.style.display = "none";
  }

  static addMultipleEventListeners(events, func) {
    events.forEach((event) => {
      window.addEventListener(event, func);
    });
  }

  static removeMultipleEventListeners(events, func) {
    events.forEach((event) => {
      window.removeEventListener(event, func);
    });
  }

  static getSelectionText() {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  static openFullscreen(elem = document.documentElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  }
}

// Achievments functions
class AchievementsDOM {
  static AllAchievements = {
    bsod: "Я сломаль :O",
    dogs: "Ой, я, наверное, позже зайду",
    alive: "Уснул за компом",
    ass: "Yes",
  };
  static AchievementPopup;
  static AchievementPlaceholder;
  static DefaultShortAchievementDelay = 500;
  static DefaultMediumAchievementDelay = 2000;
  static DefaultLongAchievementDelay = 5000;
  static AchievementPopupDuration = 8000;
  static AchievementTriggeredClass = "triggered";
  static AchievementStorageKey = "achievements";

  static {
    this.AchievementPopup = document.getElementById("achievement");
    this.AchievementPlaceholder = document.getElementById(
      "achievement-placeholder"
    );
  }

  static triggerAchievmentPopup(text, delay = 0) {
    setTimeout(() => {
      this.AchievementPlaceholder.innerHTML = text;
      this.AchievementPopup.classList.toggle(this.AchievementTriggeredClass);
      setTimeout(
        () =>
          this.AchievementPopup.classList.toggle(
            this.AchievementTriggeredClass
          ),
        this.AchievementPopupDuration
      );
    }, delay);
  }

  static earnAchievment(key) {
    let value = this.AllAchievements[key];
    let achievementsString = localStorage.getItem(this.AchievementStorageKey);
    let achievements = achievementsString ? JSON.parse(achievementsString) : {};

    if (achievements[key]) return false;

    achievements[key] = value;
    localStorage.setItem(
      this.AchievementStorageKey,
      JSON.stringify(achievements)
    );

    return true;
  }

  static hasAchievment(key) {
    let achievementsString = localStorage.getItem(this.AchievementStorageKey);
    let achievements = achievementsString ? JSON.parse(achievementsString) : {};

    if (achievements[key]) return true;

    return false;
  }
}

class MemesDOM {
  static fullscreenMode = false;
  static clickCount = 0;
  static idleTimeout;
  static maximizeButton = document.getElementById("maximize");
  static minimizeButtom = document.getElementById("minimize");
  static closeButton = document.getElementById("close");
  static bsodImage = document.getElementById("bsod");
  static mobileBsodImage = document.getElementById("mobile-bsod");
  static siteStubImage = document.getElementById("site");
  static desktopImage = document.getElementById("screenshot");
  static menuTabImage = document.getElementById("tab");
  static barkAudio = new Audio("/Sounds/bark.mp3");
  static subheading = document.getElementById("subheading");
  static IdleTimeout = 10000;
  static ActivityEvents = [
    "mousemove",
    "mousedown",
    "touchstart",
    "touchmove",
    "click",
    "keydown",
    "scroll",
  ];

  static maximizeHandler=()=> {
    if (!this.fullscreenMode) {
      DOMHelpers.openFullscreen();
    } else {
      document.exitFullscreen();
    }
    this.fullscreenMode = !this.fullscreenMode;
  }

  static closeHandler=()=> {
    DOMHelpers.openFullscreen();

    if (window.screen.width > 600) DOMHelpers.displayElement(this.bsodImage);
    else DOMHelpers.displayElement(this.mobileBsodImage);

    document.documentElement.style.cursor = "none";

    if (AchievementsDOM.earnAchievment("bsod"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["bsod"],
        AchievementsDOM.DefaultLongAchievementDelay
      );
  }

  static minimizeHandler=()=> {
    DOMHelpers.displayElement(this.siteStubImage);
    DOMHelpers.displayElement(this.desktopImage);
    DOMHelpers.displayElement(this.menuTabImage);
    this.siteStubImage.style.animation =
      "minimize 0.5s ease 0.05s 1 normal both";

    if (AchievementsDOM.earnAchievment("dogs"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["dogs"],
        AchievementsDOM.DefaultMediumAchievementDelay
      );
  }

  static menuTabHandler=()=> {
    this.siteStubImage.style.animation = "minimize 0.5s ease 1s 1 reverse";
    setTimeout(() => {
      DOMHelpers.hideElement(this.siteStubImage);
      DOMHelpers.hideElement(this.desktopImage);
      DOMHelpers.hideElement(this.menuTabImage);
    }, 350);
  }

  static desktopClickHandler=()=> {
    this.barkAudio.play();
    setTimeout(
      () =>
        alert("NO! You shouldn't fuck around here! Unminimize the console!"),
      500
    );
  }

  static AddBsodImageHandlers=(bsod)=> {
    bsod.addEventListener("click", ()=>this.bsodImageClickHandler());
  }

  static bsodImageClickHandler=()=> {
    this.clickCount++;
    if (this.clickCount > 2) alert("LOL!");
  }

  static resetIdleTimer = ()=>{
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.idleHandler();
    }, this.IdleTimeout);
  }

  static idleHandler =()=> {
    DOMHelpers.removeMultipleEventListeners(
      this.ActivityEvents,
      this.resetIdleTimer
    );
    DOMHelpers.addMultipleEventListeners(
      this.ActivityEvents,
      this.heIsAliveHandler
    );

    TyperDOM.StopTypingAll();
    this.subheading.dataset.type =
      '[ "Эй", "Ты там живой?", "Я волнуюсь", "Проснись, пожалуйста", "Я всё прощу", "Не умирай!", "Нам было так хорошо вместе" ]';
    TyperDOM.StartTypingAll();
  }

  static heIsAliveHandler = ()=>{
    DOMHelpers.removeMultipleEventListeners(
      this.ActivityEvents,
      this.heIsAliveHandler
    );
    TyperDOM.StopTypingAll();
    this.subheading.dataset.type =
      '[ "Ура", "Он проснулся", "Я уже собирался в скорую звонить", "Пронесло..." ]';
    TyperDOM.StartTypingAll();

    if (AchievementsDOM.earnAchievment("alive"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["alive"],
        AchievementsDOM.DefaultMediumAchievementDelay
      );
  }

  static startListeningForTextSelections=()=> {
    setInterval(() => {
      let selectedText = DOMHelpers.getSelectionText();
      if (selectedText === "ass") {
        if (AchievementsDOM.earnAchievment("ass"))
          AchievementsDOM.triggerAchievmentPopup(
            AchievementsDOM.AllAchievements["ass"],
            AchievementsDOM.DefaultShortAchievementDelay
          );
      }
    }, 500);
  }

  static initDogs() {
    this.minimizeButtom.addEventListener("click", this.minimizeHandler);

    this.menuTabImage.addEventListener("click", this.menuTabHandler);

    this.desktopImage.addEventListener("click", this.desktopClickHandler);
  }

  static initBsod() {
    this.closeButton.addEventListener("click", this.closeHandler);

    document
      .querySelectorAll(".bsod-image")
      .forEach((bsod) => this.AddBsodImageHandlers(bsod));
  }

  static initIdle() {
    if (!AchievementsDOM.hasAchievment("alive")) {
      DOMHelpers.addMultipleEventListeners(
        this.ActivityEvents,
        ()=>this.resetIdleTimer()
      );

      this.resetIdleTimer();
    }
  }

  static initAss() {
    this.startListeningForTextSelections();
  }

  // Not technically a meme now, but I have some plans for it :)
  static initMaximize() {
    this.maximizeButton.addEventListener("click", this.maximizeHandler);
  }

  static init() {
    this.initMaximize();
    this.initDogs();
    this.initBsod();
    this.initIdle();
    this.initAss();
  }
}

TyperDOM.StartTypingAll();
MemesDOM.init();
