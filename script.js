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

let typingTimeout;

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

  typingTimeout = setTimeout(function () {
    that.tick();
  }, delta);
};

function StartTyping() {
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

function StopTyping(){
  clearTimeout(typingTimeout);
}

window.onload = StartTyping;

// MEMES
const AchievementsAll = {
  bsod:"Я сломаль :O",
  dogs: "Ой, я, наверное, позже зайду",
  alive: "Уснул за компом",
  ass: "Yes"
}
const DefaultMediumAchievementDelay = 2000;
const DefaultLongAchievementDelay = 5000;
const IdleTimeout = 10000;
const AchievementPopupDuration = 8000;
const AchievementTriggeredClass = "triggered";
const AchievementStorageKey = "achievements";

let maximizeButton = document.getElementById('maximize');
let minimizeButtom = document.getElementById('minimize');
let closeButton = document.getElementById('close');
let bsodImage = document.getElementById("bsod");
let mobileBsodImage = document.getElementById("mobile-bsod");
let siteStubImage = document.getElementById("site");
let desktopImage = document.getElementById("screenshot");
let menuTabImage = document.getElementById("tab");
let achievementPopup = document.getElementById("achievement");
let achievementPlaceholder = document.getElementById("achievement-placeholder");
let barkAudio = new Audio('/Sounds/bark.mp3');
let subheading = document.getElementById("subheading");

let fullscreenMode = false;

maximizeButton.addEventListener("click", ()=>{
  if (!fullscreenMode){
    openFullscreen();
  }
  else {
    document.exitFullscreen();
  }
  fullscreenMode = !fullscreenMode;
})

function openFullscreen(elem = document.documentElement) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

closeButton.addEventListener("click", ()=>{
  openFullscreen();
  
  if (window.screen.width > 600)
    displayElement(bsodImage);
  else
    displayElement(mobileBsodImage);

  document.documentElement.style.cursor = "none";

  if (earnAchievment("bsod"))
    triggerAchievmentPopup(AchievementsAll["bsod"], DefaultLongAchievementDelay);
})

minimizeButtom.addEventListener("click", ()=>{
  displayElement(siteStubImage);
  displayElement(desktopImage);
  displayElement(menuTabImage);
  siteStubImage.style.animation = "minimize 0.5s ease 0.05s 1 normal both";

  if (earnAchievment("dogs"))
    triggerAchievmentPopup(AchievementsAll["dogs"], DefaultMediumAchievementDelay);
})

menuTabImage.addEventListener("click", ()=>{
  siteStubImage.style.animation = "minimize 0.5s ease 1s 1 reverse";
  setTimeout(()=>{
    hideElement(siteStubImage);
    hideElement(desktopImage);
    hideElement(menuTabImage);
  }, 350);
})

desktopImage.addEventListener("click", ()=>{
  barkAudio.play();
  setTimeout(()=> alert("NO! You shouldn't fuck around here! Unminimize the console!"), 500);
})

let clickCount = 0;

document.querySelectorAll(".bsod-image").forEach((bsod)=>{
  bsod.addEventListener("click", ()=>{
    clickCount++;
  
    if (clickCount>2)
      alert("LOL!");
  })
})

// Achievments functions

function triggerAchievmentPopup(text, delay = 0){
  setTimeout(()=>{
    achievementPlaceholder.innerHTML = text;
    achievementPopup.classList.toggle(AchievementTriggeredClass);
    setTimeout(()=>achievementPopup.classList.toggle(AchievementTriggeredClass), AchievementPopupDuration);
  }, delay)
}

function earnAchievment(key){
  let value = AchievementsAll[key];
  let achievementsString = localStorage.getItem(AchievementStorageKey);
  let achievements = achievementsString ? JSON.parse(achievementsString) : {};

  if (achievements[key]) return false; 

  achievements[key] = value;
  localStorage.setItem(AchievementStorageKey, JSON.stringify(achievements));

  return true;
}

function hasAchievment(key){
  let achievementsString = localStorage.getItem(AchievementStorageKey);
  let achievements = achievementsString ? JSON.parse(achievementsString) : {};

  if (achievements[key]) return true; 

  return false; 
}

// Idle

let idleTimeout;

function resetIdleTimer() {
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(()=>{
    idleHandler()
  }, IdleTimeout);
}

const ActivityEvents = ["mousemove", "mousedown", "touchstart", "touchmove", "click", "keydown", "scroll"];

function idleHandler(){
  removeMultipleEventListeners(ActivityEvents, resetIdleTimer);
  addMultipleEventListeners(ActivityEvents, heIsAlive);

  StopTyping()
  subheading.dataset.type = '[ "Эй", "Ты там живой?", "Я волнуюсь", "Проснись, пожалуйста", "Я всё прощу", "Не умирай!", "Нам было так хорошо вместе" ]';
  StartTyping();

  function heIsAlive(){
    removeMultipleEventListeners(ActivityEvents, heIsAlive);

    StopTyping()
    subheading.dataset.type = '[ "Ура", "Он проснулся", "Я уже собирался в скорую звонить", "Пронесло..." ]';
    StartTyping();

    if (earnAchievment("alive"))
      triggerAchievmentPopup(AchievementsAll["alive"], DefaultMediumAchievementDelay);
  }
}

if (!hasAchievment("alive")){
  addMultipleEventListeners(ActivityEvents, resetIdleTimer);

  resetIdleTimer();
}

// Ass

function getSelectionText() {
  var text = "";
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  return text;
}

setInterval(()=>{
  let selectedText = getSelectionText();
  if (selectedText === "ass"){
    if (earnAchievment("ass"))
      triggerAchievmentPopup(AchievementsAll["ass"], DefaultMediumAchievementDelay);
  }
}, 500)

// Helpers

function displayElement(element, displayType = "block"){
  element.style.display = displayType;
}

function hideElement(element){
  element.style.display = "none";
}

function addMultipleEventListeners(events, func){
  events.forEach((event)=>{
    window.addEventListener(event, func)
  })
}

function removeMultipleEventListeners(events, func){
  events.forEach((event)=>{
    window.removeEventListener(event, func)
  })
}