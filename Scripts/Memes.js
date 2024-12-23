import DOMHelpers from "./DOMHelpers.js";
import AchievementsDOM from "./AchievementsDOM.js";
import TyperDOM from "./TyperDOM.js";
import Interpreter from "./Interpreter.js";

class Meme {
  init() {
    console.log("MEME");
  }
}

// helper functions
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    alert("LOL!");
    setTimeout(() => {
      window.location.reload();
    }, 3000);
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
    TyperDOM.init();
    super();
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

export class SecretImage extends Meme {
  constructor() {
    super();
    this.indicator = document.getElementById("scroll-indicator-secret");
  }

  init() {
    this.indicator.addEventListener("click", () => {
      if (AchievementsDOM.earnAchievment("secret"))
        AchievementsDOM.triggerAchievmentPopup(
          AchievementsDOM.AllAchievements["secret"],
          AchievementsDOM.DefaultShortAchievementDelay
        );
    });
  }
}

export class ConsoleMeme extends Meme {
  DefaultDirectory = `C:\\Memes\\user`;
  CdCommandPattern = /^cd (.*)$/i;

  commandHistory = [];
  currentCommandIndex = 0;
  locked = false;

  constructor() {
    super();
    this.navlist = document.getElementById("nav-list");
    this.consoleButton = document.getElementById("console-button");
    this.calendarInConsoleButton = document.getElementById(
      "console-button-calendar"
    );
    this.consoleContainer = document.getElementById("console");
    this.consoleInput = document.getElementById("console-input");
    this.consolePreInput = document.getElementById("pre-input");
    this.consoleInputContainer = document.getElementById(
      "console-input-container"
    );
  }

  CtrlCHandler = (event) => {
    let key = event.which || event.keyCode;
    let isCtrlPressed = event.ctrlKey || key === 17;
    if (key == 67 && isCtrlPressed) this.startConsole(new Interpreter());
  };

  BelowFocusHandler = (event) => {
    if (window.getSelection()?.type !== "Range") this.consoleInput.focus();
  };

  startConsole(interpreter) {
    document.body.removeEventListener("keydown", this.CtrlCHandler);
    this.consoleInput.addEventListener("keyup", this.inputEnterHandler);
    this.consoleInput.addEventListener("keydown", this.inputArrowHandler);
    this.consoleContainer.addEventListener("click", this.BelowFocusHandler);
    this.interpreter = interpreter;
    this.consolePreInput.innerText =
      (this.interpreter.currentDirectory ?? this.DefaultDirectory) + ">";
    DOMHelpers.displayElement(this.consoleContainer);
    this.consoleInput.focus();

    if (AchievementsDOM.earnAchievment("console"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["console"],
        AchievementsDOM.DefaultShortAchievementDelay
      );
  }

  clearConsole = () => {
    document
      .querySelectorAll(".console-output, .console-old-input")
      .forEach((element) => {
        this.consoleContainer.removeChild(element);
      });
  };

  closeConsole = () => {
    DOMHelpers.hideElement(this.consoleContainer);
  };

  inputEnterHandler = async (event) => {
    if (event.key !== "Enter" || this.locked) return;

    let value = this.consoleInput.value;
    this.commandHistory.push(value);
    this.currentCommandIndex = this.commandHistory.length;

    this.locked = true;
    const output = value ? await this.interpreter.eval(value.trim()) : "";

    this.consoleInput.value = "";
    this.locked = false;

    // UI clear command
    if (/^clear$/i.test(value)) {
      this.clearConsole();
      return;
    }

    if (/^exit$/i.test(value)) {
      this.closeConsole();
      return;
    }

    // Convert old input to paragraph
    let oldInputText = this.consolePreInput.innerText + value;
    let oldInput = document.createElement("p");
    oldInput.classList.add("console-old-input");
    oldInput.setAttribute("data-cy", "console-old-input");
    oldInput.innerHTML = oldInputText;
    this.consoleContainer.insertBefore(oldInput, this.consoleInputContainer);

    //Create output paragraph
    let outputNode = document.createElement("p");
    outputNode.classList.add("console-output");
    outputNode.setAttribute("data-cy", "console-output");
    outputNode.innerHTML = output.replaceAll("\n", "<br>");
    this.consoleContainer.insertBefore(outputNode, this.consoleInputContainer);
    this.consoleContainer.scrollTop += 1000;

    // UI cd command
    if (this.CdCommandPattern.test(value)) {
      this.consolePreInput.innerText = this.interpreter.currentDirectory + ">";
    }
  };

  inputArrowHandler = (event) => {
    // up arrow
    if (event.keyCode == "38") {
      this.currentCommandIndex =
        this.currentCommandIndex > 0 ? --this.currentCommandIndex : 0;

      if (this.commandHistory.length > 0)
        this.consoleInput.value = this.commandHistory[this.currentCommandIndex];
    }
    // down arrow
    else if (event.keyCode == "40") {
      this.currentCommandIndex =
        this.currentCommandIndex < this.commandHistory.length - 1
          ? ++this.currentCommandIndex
          : this.commandHistory.length - 1;
      this.consoleInput.value = this.commandHistory[this.currentCommandIndex];
    }
  };

  init() {
    document.body.addEventListener("keydown", this.CtrlCHandler);
    document
      .querySelectorAll("nav a")
      .forEach((navlink) =>
        navlink.addEventListener("click", this.closeConsole)
      );

    this.consoleButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.startConsole(new Interpreter());
    });

    this.calendarInConsoleButton.addEventListener("click", async (event) => {
      event.preventDefault();
      this.startConsole(new Interpreter());

      // Show 'em how to type like a pro
      await sleep(500);

      for (let letter of "calendar") {
        this.consoleInput.value += letter;
        await sleep(100);
      }

      await sleep(200);

      this.consoleInput.dispatchEvent(
        new KeyboardEvent("keyup", { key: "Enter" })
      );
    });
  }
}

export class Rotate extends Meme {
  constructor() {
    super();
    this.rotateButton = document.getElementById("refresh-button");
  }

  rotateHandler = () => {
    document.documentElement.classList.toggle("rotated-180");
    document.documentElement.scroll({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    if (AchievementsDOM.earnAchievment("refresh"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["refresh"],
        AchievementsDOM.DefaultMediumAchievementDelay
      );
  };

  init() {
    this.rotateButton.addEventListener("click", this.rotateHandler);
  }
}
