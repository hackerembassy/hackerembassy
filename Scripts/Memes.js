import DOMHelpers from "./DOMHelpers.js";
import AchievementsDOM from "./AchievementsDOM.js";
import TyperDOM from "./TyperDOM.js";
import Interpreter from "./Interpreter.js";
import I18n from "./I18n.js";

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
      // Rejects if the user already left fullscreen another way (e.g. Esc)
      document.exitFullscreen().catch(() => {});
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
        AchievementsDOM.DefaultMediumAchievementDelay,
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
    this.barkAudio.play().catch(() => {});
    setTimeout(
      () =>
        alert("NO! You shouldn't fuck around here! Unminimize the console!"),
      500,
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
        AchievementsDOM.DefaultLongAchievementDelay,
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
    window.addEventListener("bsod", this.closeHandler);

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
      this.resetIdleTimer,
    );
    DOMHelpers.addMultipleEventListeners(
      this.ActivityEvents,
      this.heIsAliveHandler,
    );

    this.retype("idle.sleeping");
  };

  retype(key) {
    const lines = I18n.t(key, { returnObjects: true });
    // Without translations the subheading just keeps typing what it had
    if (!Array.isArray(lines)) return;

    TyperDOM.StopTypingAll();
    this.subheading.dataset.type = JSON.stringify(lines);
    TyperDOM.StartTypingAll();
  }

  heIsAliveHandler = () => {
    DOMHelpers.removeMultipleEventListeners(
      this.ActivityEvents,
      this.heIsAliveHandler,
    );
    this.retype("idle.awake");

    if (AchievementsDOM.earnAchievment("alive"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["alive"],
        AchievementsDOM.DefaultMediumAchievementDelay,
      );
  };

  init() {
    if (!AchievementsDOM.hasAchievment("alive")) {
      DOMHelpers.addMultipleEventListeners(this.ActivityEvents, () =>
        this.resetIdleTimer(),
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
            AchievementsDOM.DefaultShortAchievementDelay,
          );
      }
    }, 500);
  };

  init() {
    this.startListeningForTextSelections();
  }
}

export class SecretImage extends Meme {
  init() {
    // Carousel indicators are generated by ScrollDOM.init, which runs after memes are constructed
    this.indicator = document.getElementById("scroll-indicator-secret");
    this.indicator.addEventListener("click", () => {
      if (AchievementsDOM.earnAchievment("secret"))
        AchievementsDOM.triggerAchievmentPopup(
          AchievementsDOM.AllAchievements["secret"],
          AchievementsDOM.DefaultShortAchievementDelay,
        );
    });
  }
}

export class ConsoleMeme extends Meme {
  DefaultDirectory = String.raw`C:\Memes\user`;

  commandHistory = [];
  currentCommandIndex = 0;
  locked = false;

  constructor() {
    super();
    this.navlist = document.getElementById("nav-list");
    this.consoleButton = document.getElementById("console-button");
    this.calendarInConsoleButton = document.getElementById(
      "console-button-calendar",
    );
    this.consoleContainer = document.getElementById("console");
    this.consoleInput = document.getElementById("console-input");
    this.consolePreInput = document.getElementById("pre-input");
    this.consoleInputContainer = document.getElementById(
      "console-input-container",
    );
  }

  CtrlCHandler = (event) => {
    let key = event.which || event.keyCode;
    let isCtrlPressed = event.ctrlKey || key === 17;
    if (key == 67 && isCtrlPressed) this.startConsole(new Interpreter());
  };

  BelowFocusHandler = (event) => {
    if (window.getSelection()?.type !== "Range")
      this.consoleInput.focus({ preventScroll: true });
  };

  startConsole(interpreter) {
    document.body.removeEventListener("keydown", this.CtrlCHandler);
    this.consoleInput.addEventListener("keyup", this.inputEnterHandler);
    this.consoleInput.addEventListener("keydown", this.inputArrowHandler);
    this.consoleContainer.addEventListener("click", this.BelowFocusHandler);
    this.interpreter = interpreter;
    this.interpreter.commandHistory = this.commandHistory;
    this.interpreter.loadRemoteData();
    this.consolePreInput.innerText =
      (this.interpreter.currentDirectory ?? this.DefaultDirectory) + ">";
    DOMHelpers.displayElement(this.consoleContainer);
    document.documentElement.classList.add("console-open");
    // preventScroll: a plain focus() scrolls the page under the fixed console, and on iOS the console
    // then visibly jumps down and back up while it catches up with the keyboard
    this.consoleInput.focus({ preventScroll: true });

    if (AchievementsDOM.earnAchievment("console"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["console"],
        AchievementsDOM.DefaultShortAchievementDelay,
      );
  }

  clearConsole = () => {
    document
      .querySelectorAll(".console-output, .console-old-input")
      .forEach((element) => element.remove());
  };

  closeConsole = () => {
    DOMHelpers.hideElement(this.consoleContainer);
    document.documentElement.classList.remove("console-open");
  };

  // Shows the running command with a spinner in place of the input until it finishes
  showBusy(value) {
    const running = document.createElement("span");
    running.classList.add("console-busy");
    running.dataset.cy = "console-busy";
    running.textContent = value;
    this.consoleInput.after(running);
    this.consoleInput.hidden = true;

    return {
      done: () => {
        running.remove();
        this.consoleInput.hidden = false;
        // Hiding the input dropped focus to the body; a command that opened something (vim) keeps its focus
        if (document.activeElement === document.body)
          this.consoleInput.focus({ preventScroll: true });
      },
    };
  }

  inputEnterHandler = async (event) => {
    if (event.key !== "Enter" || this.locked) return;

    let value = this.consoleInput.value;
    if (value.trim()) this.commandHistory.push(value);
    this.currentCommandIndex = this.commandHistory.length;

    this.locked = true;
    const busy = this.showBusy(value);
    const output = value ? await this.interpreter.eval(value.trim()) : "";
    busy.done();

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
    oldInput.dataset.cy = "console-old-input";
    oldInput.innerHTML = oldInputText;
    this.consoleContainer.insertBefore(oldInput, this.consoleInputContainer);

    //Create output paragraph
    let outputNode = document.createElement("p");
    outputNode.classList.add("console-output");
    outputNode.dataset.cy = "console-output";
    outputNode.innerHTML = output.replaceAll("\n", "<br>");
    this.consoleContainer.insertBefore(outputNode, this.consoleInputContainer);
    this.revealInput();

    this.consolePreInput.innerText = this.interpreter.prompt;
  };

  inputArrowHandler = (event) => {
    const isUp = event.keyCode == "38";
    const isDown = event.keyCode == "40";
    if ((!isUp && !isDown) || this.commandHistory.length === 0) return;

    // Default up/down would move the caret to the start of the input
    event.preventDefault();

    if (isUp)
      this.currentCommandIndex = Math.max(0, this.currentCommandIndex - 1);
    else
      this.currentCommandIndex = Math.min(
        this.commandHistory.length - 1,
        this.currentCommandIndex + 1,
      );

    const value = this.commandHistory[this.currentCommandIndex];
    this.consoleInput.value = value;
    this.consoleInput.setSelectionRange(value.length, value.length);
  };

  // Scrolls only the console (scrollIntoView() would also scroll the page) so the input sits a little above
  // the bottom edge, which on iOS is under the keyboard's floating bars
  revealInput() {
    const container = this.consoleContainer;
    const input = this.consoleInputContainer;
    const gap = 40;
    const target = input.offsetTop + input.offsetHeight + gap - container.clientHeight;
    if (container.scrollTop < target) container.scrollTop = target;
  }

  // Mobile keyboards shrink the visual viewport but not 100vh, so the console follows the visible area
  trackVisualViewport() {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const root = document.documentElement.style;
      root.setProperty("--viewport-height", `${viewport.height}px`);
      root.setProperty("--viewport-top", `${viewport.offsetTop}px`);

      if (document.activeElement === this.consoleInput) this.revealInput();
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();
  }

  init() {
    this.trackVisualViewport();
    document.body.addEventListener("keydown", this.CtrlCHandler);
    document
      .querySelectorAll("#nav-list a")
      .forEach((navlink) =>
        navlink.addEventListener("click", this.closeConsole),
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
        new KeyboardEvent("keyup", { key: "Enter" }),
      );
    });
  }
}

export class Shutdown extends Meme {
  UpdateStepDelay = 120;

  showUpdateScreen = async (action) => {
    const screen = document.createElement("div");
    screen.classList.add("update-screen");
    document.body.appendChild(screen);
    DOMHelpers.openFullscreen();

    screen.innerHTML = `<div class="update-spinner"></div><p><span class="update-percent"></span><br>Don't turn off your computer</p>`;
    const percentText = screen.querySelector(".update-percent");

    // Counts to 100%, hanging at 99% for a while like the real thing
    await new Promise((resolve) => {
      let percent = 0;
      const step = () => {
        percentText.textContent = `Working on updates ${percent}%`;
        if (percent === 100) return resolve();

        const delay = this.UpdateStepDelay * (percent === 99 ? 20 : 1);
        percent++;
        setTimeout(step, delay);
      };
      step();
    });

    if (action === "reboot") {
      window.location.reload();
      return;
    }

    screen.classList.add("safe-to-turn-off");
    screen.innerHTML = "<p>It's now safe to turn off<br>your computer.</p>";
    screen.addEventListener("click", () => window.location.reload());
  };

  init() {
    window.addEventListener("shutdown", () =>
      this.showUpdateScreen("shutdown"),
    );
    window.addEventListener("reboot", () => this.showUpdateScreen("reboot"));
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
        AchievementsDOM.DefaultMediumAchievementDelay,
      );
  };

  init() {
    this.rotateButton.addEventListener("click", this.rotateHandler);
  }
}
