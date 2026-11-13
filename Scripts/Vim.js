import AchievementsDOM from "./AchievementsDOM.js";

const SPLASH = [
  "VIM - Vi IMprisoned",
  "",
  "version 6.9.420-hackem",
  "Trapping users since 1991",
  "",
  "Average escape time: 3 years",
];

const escapeHtml = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export default class Vim {
  mode = "normal";
  lines = [""];
  row = 0;
  col = 0;
  command = "";
  message = "";
  isError = false;
  pendingKey = "";
  file = "untitled";
  root = null;
  input = null;

  open = (event) => {
    this.file = event.detail?.file ?? "untitled";
    this.mode = "normal";
    this.lines = [""];
    this.row = 0;
    this.col = 0;
    this.command = "";
    this.pendingKey = "";
    this.setMessage(`"${this.file}" [New]`);

    this.root = document.createElement("div");
    this.root.classList.add("vim");
    this.root.innerHTML = `<div class="vim-buffer"></div><div class="vim-status"></div><textarea class="vim-input" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>`;
    document.body.appendChild(this.root);

    this.input = this.root.querySelector(".vim-input");
    this.input.addEventListener("keydown", this.keydownHandler);
    this.input.addEventListener("input", this.inputHandler);
    this.root.addEventListener("click", () => this.input.focus({ preventScroll: true }));

    this.render();
    this.input.focus();
  };

  close = () => {
    this.root.remove();
    this.root = null;
    // Wait for the Enter keyup, otherwise it lands in the console as an empty command
    const focusConsole = () => document.getElementById("console-input")?.focus();
    window.addEventListener("keyup", focusConsole, { once: true });
    setTimeout(focusConsole, 500);

    if (AchievementsDOM.earnAchievment("vim"))
      AchievementsDOM.triggerAchievmentPopup(
        AchievementsDOM.AllAchievements["vim"],
        AchievementsDOM.DefaultShortAchievementDelay,
      );
  };

  setMessage(text, isError = false) {
    this.message = text;
    this.isError = isError;
  }

  // Special keys come through keydown, printable ones through the input event (works with mobile keyboards too)
  keydownHandler = (event) => {
    const specialKeys = [
      "Escape",
      "Enter",
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];
    if (!specialKeys.includes(event.key)) return;

    event.preventDefault();
    this.handleKey(event.key);
    this.render();
  };

  inputHandler = () => {
    const typed = this.input.value;
    this.input.value = "";

    for (const char of typed) this.handleKey(char === "\n" ? "Enter" : char);

    if (this.root) this.render();
  };

  handleKey(key) {
    if (this.mode === "insert") this.handleInsertKey(key);
    else if (this.mode === "command") this.handleCommandKey(key);
    else this.handleNormalKey(key);
  }

  get line() {
    return this.lines[this.row];
  }

  set line(value) {
    this.lines[this.row] = value;
  }

  // Normal mode cursor sits on a char, insert mode cursor can sit after the last one
  clampCol() {
    const max =
      this.mode === "insert"
        ? this.line.length
        : Math.max(0, this.line.length - 1);
    this.col = Math.min(Math.max(0, this.col), max);
  }

  enterInsert() {
    this.mode = "insert";
    this.setMessage("-- INSERT --");
  }

  // Returns true if the key was a movement
  move(key) {
    const moves = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    };
    if (this.mode === "normal")
      Object.assign(moves, {
        h: moves.ArrowLeft,
        l: moves.ArrowRight,
        k: moves.ArrowUp,
        j: moves.ArrowDown,
      });

    const delta = moves[key];
    if (!delta) return false;

    this.row = Math.min(
      Math.max(0, this.row + delta[0]),
      this.lines.length - 1,
    );
    this.col += delta[1];
    this.clampCol();
    return true;
  }

  handleInsertKey(key) {
    if (this.move(key)) return;

    if (key === "Escape") {
      this.mode = "normal";
      this.col--;
      this.clampCol();
      this.setMessage("");
    } else if (key === "Enter") {
      this.lines.splice(this.row + 1, 0, this.line.slice(this.col));
      this.line = this.line.slice(0, this.col);
      this.row++;
      this.col = 0;
    } else if (key === "Backspace") {
      if (this.col > 0) {
        this.line =
          this.line.slice(0, this.col - 1) + this.line.slice(this.col);
        this.col--;
      } else if (this.row > 0) {
        const current = this.lines.splice(this.row, 1)[0];
        this.row--;
        this.col = this.line.length;
        this.line += current;
      }
    } else if (key === "Tab" || key.length === 1) {
      const text = key === "Tab" ? "    " : key;
      this.line =
        this.line.slice(0, this.col) + text + this.line.slice(this.col);
      this.col += text.length;
    }
  }

  handleNormalKey(key) {
    const combo = this.pendingKey + key;
    this.pendingKey = "";

    if (this.move(key)) return;

    if (key === "i") {
      this.enterInsert();
    } else if (key === "a") {
      this.enterInsert();
      this.col = Math.min(this.col + 1, this.line.length);
    } else if (key === "I") {
      this.enterInsert();
      this.col = 0;
    } else if (key === "A") {
      this.enterInsert();
      this.col = this.line.length;
    } else if (key === "o") {
      this.lines.splice(this.row + 1, 0, "");
      this.row++;
      this.col = 0;
      this.enterInsert();
    } else if (key === "0") {
      this.col = 0;
    } else if (key === "$") {
      this.col = this.line.length;
      this.clampCol();
    } else if (key === ":") {
      this.mode = "command";
      this.command = "";
    } else if (key === "x") {
      this.line = this.line.slice(0, this.col) + this.line.slice(this.col + 1);
      this.clampCol();
    } else if (combo === "dd") {
      if (this.lines.length > 1) this.lines.splice(this.row, 1);
      else this.lines[0] = "";
      this.row = Math.min(this.row, this.lines.length - 1);
      this.clampCol();
    } else if (combo === "ZZ") {
      this.setMessage(`E212: Can't open file for writing: ${this.file}`, true);
    } else if (key === "d" || key === "Z") {
      this.pendingKey = key;
    }
  }

  handleCommandKey(key) {
    if (key === "Escape" || (key === "Backspace" && this.command === "")) {
      this.mode = "normal";
      this.setMessage("");
    } else if (key === "Backspace") {
      this.command = this.command.slice(0, -1);
    } else if (key === "Enter") {
      this.mode = "normal";
      this.runCommand(this.command.trim());
    } else if (key.length === 1) {
      this.command += key;
    }
  }

  runCommand(command) {
    if (/^qa?!$/.test(command)) return this.close();

    if (/^(q|qa|quit)$/.test(command))
      this.setMessage("E37: No write since last change", true);
    else if (/^(w|wq|x|wq!|w!)$/.test(command))
      this.setMessage(`E212: Can't open file for writing: ${this.file}`, true);
    else if (/^h(elp)?\b/.test(command))
      this.setMessage("E149: Sorry, no help for you", true);
    else if (command)
      this.setMessage(`E492: Not an editor command: ${command}`, true);
    else this.setMessage("");
  }

  render() {
    if (!this.root) return;

    const isEmpty =
      this.lines.length === 1 && this.lines[0] === "" && this.mode !== "insert";
    const cursorClass =
      this.mode === "insert" ? "vim-cursor vim-cursor-insert" : "vim-cursor";

    const textLines = this.lines.map((line, i) => {
      if (i !== this.row || this.mode === "command")
        return `<div class="vim-line">${escapeHtml(line)}</div>`;

      const before = escapeHtml(line.slice(0, this.col));
      const under = escapeHtml(line.charAt(this.col)) || "&nbsp;";
      const after = escapeHtml(line.slice(this.col + 1));
      return `<div class="vim-line">${before}<span class="${cursorClass}">${under}</span>${after}</div>`;
    });
    const tildes = Array.from(
      { length: 100 },
      () => `<div class="vim-line vim-tilde">~</div>`,
    );
    const splash = isEmpty
      ? `<div class="vim-splash">${SPLASH.map((line) => `<div>${line || "&nbsp;"}</div>`).join("")}</div>`
      : "";

    this.root.querySelector(".vim-buffer").innerHTML =
      textLines.join("") + tildes.join("") + splash;

    const status =
      this.mode === "command"
        ? `:${escapeHtml(this.command)}<span class="vim-cursor">&nbsp;</span>`
        : `<span class="${this.isError ? "vim-error" : ""}">${escapeHtml(this.message)}</span>`;
    const position = `<span>${this.row + 1},${this.col + 1}</span>`;

    this.root.querySelector(".vim-status").innerHTML =
      `<span>${status}</span>${position}`;
  }

  init() {
    window.addEventListener("vim", this.open);
  }
}
