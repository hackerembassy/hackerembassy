import DOMHelpers from "./DOMHelpers.js";
import AchievementsDOM from "./AchievementsDOM.js";
import TyperDOM from "./TyperDOM.js";
import Interpreter from "./Interpreter.js";

class Meme {
  init() {
    console.log("MEME");
  }
}

// Not technically a meme now, but I have some plans for it :)
export class Maximize extends Meme {
  constructor() {
    super();
    this.maximizeButton = document.getElementById("maximize");
    this.fullscreenMode = false;
  }

  maximizeHandler = () => {
    if (!this.fullscreenMode) {
      DOMHelpers.openFullscreen();
    } else {
      document.exitFullscreen();
    }
    this.fullscreenMode = !this.fullscreenMode;
  };

  init() {
    this.maximizeButton.addEventListener("click", this.maximizeHandler);
  }
}

export class Dogs extends Meme {
  constructor() {
    super();
    this.minimizeButtom = document.getElementById("minimize");
    this.siteStubImage = document.getElementById("site");
    this.desktopImage = document.getElementById("screenshot");
    this.menuTabImage = document.getElementById("tab");
    this.barkAudio = new Audio("/Sounds/bark.mp3");
  }

  minimizeHandler = () => {
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
  };

  menuTabHandler = () => {
    this.siteStubImage.style.animation = "minimize 0.5s ease 1s 1 reverse";
    setTimeout(() => {
      DOMHelpers.hideElement(this.siteStubImage);
      DOMHelpers.hideElement(this.desktopImage);
      DOMHelpers.hideElement(this.menuTabImage);
    }, 350);
  };

  desktopClickHandler = () => {
    this.barkAudio.play();
    setTimeout(
      () =>
        alert("NO! You shouldn't fuck around here! Unminimize the console!"),
      500
    );
  };

  init() {
    this.minimizeButtom.addEventListener("click", this.minimizeHandler);
    this.menuTabImage.addEventListener("click", this.menuTabHandler);
    this.desktopImage.addEventListener("click", this.desktopClickHandler);
  }
}

export class Bsod extends Meme {
  constructor() {
    super();
    this.clickCount = 0;
    this.closeButton = document.getElementById("close");
    this.bsodImage = document.getElementById("bsod");
    this.mobileBsodImage = document.getElementById("mobile-bsod");
  }

  closeHandler = () => {
    DOMHelpers.openFullscreen();

    if (window.screen.width > 600) DOMHelpers.displayElement(this.bsodImage);
    else DOMHelpers.displayElement(this.mobileBsodImage);

    document.documentElement.style.cursor = "none";

    if (AchievementsDOM.earnAchievment("bsod"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["bsod"],
        AchievementsDOM.DefaultLongAchievementDelay
      );
  };

  AddBsodImageHandlers = (bsod) => {
    bsod.addEventListener("click", this.bsodImageClickHandler);
  };

  bsodImageClickHandler = () => {
    this.clickCount++;
    if (this.clickCount > 2) alert("LOL!");
  };

  init() {
    this.closeButton.addEventListener("click", this.closeHandler);

    document
      .querySelectorAll(".bsod-image")
      .forEach((bsod) => this.AddBsodImageHandlers(bsod));
  }
}

export class Idle extends Meme {
  ActivityEvents = [
    "mousemove",
    "mousedown",
    "touchstart",
    "touchmove",
    "click",
    "keydown",
    "scroll",
  ];

  constructor() {
    super();
    this.idleTimeout;
    this.subheading = document.getElementById("subheading");
    this.IdleTimeout = 120000;
  }

  resetIdleTimer = () => {
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.idleHandler();
    }, this.IdleTimeout);
  };

  idleHandler = () => {
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
      '[ "Эй", "Ты там живой?", "Я волнуюсь", "Проснись, пожалуйста", "Не умирай!", "Я всё прощу", "Нам было так хорошо вместе" ]';
    TyperDOM.StartTypingAll();
  };

  heIsAliveHandler = () => {
    DOMHelpers.removeMultipleEventListeners(
      this.ActivityEvents,
      this.heIsAliveHandler
    );
    TyperDOM.StopTypingAll();
    this.subheading.dataset.type =
      '[ "Ура", "Ты проснулся", "Я уже собирался в скорую звонить", "Пронесло..." ]';
    TyperDOM.StartTypingAll();

    if (AchievementsDOM.earnAchievment("alive"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["alive"],
        AchievementsDOM.DefaultMediumAchievementDelay
      );
  };

  init() {
    if (!AchievementsDOM.hasAchievment("alive")) {
      DOMHelpers.addMultipleEventListeners(this.ActivityEvents, () =>
        this.resetIdleTimer()
      );

      this.resetIdleTimer();
    }
  }
}

export class Ass extends Meme {
  constructor() {
    super();
    this.subheading = document.getElementById("subheading");
  }

  startListeningForTextSelections = () => {
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
  };

  init() {
    this.startListeningForTextSelections();
  }
}


export class ConsoleMeme extends Meme {

  cdCommandPattern = /^cd (.*)$/;

  constructor() {
    super();
    this.consoleContainer = document.getElementById("console");
    this.consoleInput = document.getElementById("console-input");
    this.consolePreInput = document.getElementById("pre-input");
  }

  openConsole = ()=>{
    DOMHelpers.displayElement(this.consoleContainer);
  }

  CtrlCHandler = (event)=>{
    event = event || window.event;
    let key = event.which || event.keyCode;
      
    let ctrl = event.ctrlKey ? event.ctrlKey : ((key === 17)
        ? true : false);

    if (key == 67 && ctrl) {
      this.openConsole();
      this.initConsoleInput();
      this.consoleInput.focus();
      this.interpreter = new Interpreter();
      document.body.removeEventListener("keydown", this.CtrlCHandler); 
    }
  }

  clearConsole = () => {
    document.querySelectorAll(".console-output, .console-old-input").forEach((element)=>{
      this.consoleContainer.removeChild(element);
    })
  }

  inputEnterHandler = (event) => {
      if (event.key !== "Enter") return;
      
      let value = this.consoleInput.value;
      let preInput = this.consolePreInput.innerText;
      this.consoleInput.value = "";

      if (value==="clear"){
        this.clearConsole();
        return;
      } 
      else if (this.cdCommandPattern.test(value)){
        preInput = this.cdCommandPattern.exec(value)[1]+">";
      }

      // Convert old input to paragraph
      let oldInputText = this.consolePreInput.innerText+value;
      let oldInput = document.createElement("p");
      oldInput.classList.add("console-old-input");
      oldInput.innerHTML = oldInputText;
      this.consoleContainer.insertBefore(oldInput, this.consolePreInput);

      //Create output paragraph
      let output = this.interpreter.eval(value);
      let outputNode = document.createElement("p");
      outputNode.classList.add("console-output")
      outputNode.innerHTML = output;
      this.consoleContainer.insertBefore(outputNode, this.consolePreInput);
      this.consoleContainer.scrollTop+=100;

      this.consolePreInput.innerText = preInput;
  }

  initCtrlCDetection = () => {
    document.body.addEventListener("keydown", this.CtrlCHandler);
  }

  initConsoleInput = () => {
    this.consoleInput.addEventListener("keyup", this.inputEnterHandler);
  }

  init() {    
    this.initCtrlCDetection()
  }
}
