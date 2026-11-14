import BotApi from "./BotApi.js";
import AchievementsDOM from "./AchievementsDOM.js";
import I18n from "./I18n.js";

export default class Interpreter {
  defaultDirectory = String.raw`C:\Memes\user`;
  currentDirectory = this.defaultDirectory;
  calendarUrl =
    "https://calendar.google.com/calendar/embed?src=9cdc565d78854a899cbbc7cb6dfcb8fa411001437ae0f66bce0a82b5e7679d5e%40group.calendar.google.com&ctz=Asia%2FYerevan";
  wikiForest = null;
  currentWikiNode = null;
  botCommandsLoaded = Promise.resolve();
  commandHistory = [];

  constructor() {
    /**
     * Help descriptions live in locales under console.commands.<name>, bot commands bring their own
     * @type {{name: string, category?: string, expression: RegExp, handler: function, description?: string, hidden?: boolean}[]}
     */
    this.allCommands = [
      {
        name: "help",
        category: "console",
        expression: /^\/?(help|помогите|че делать\?+)$/i,
        handler: this.helpCommand,
      },
      {
        name: "calendar",
        category: "space",
        expression: /^\/?(calendar|cal|gcal\?+)$/i,
        handler: this.calendarCommand,
      },
      {
        name: "eval",
        category: "console",
        expression: /^eval (.*)$/i,
        handler: this.evalCommand,
      },
      {
        name: "echo",
        category: "console",
        expression: /^echo (.*)$/i,
        handler: this.echoCommand,
      },
      {
        name: "pwd",
        category: "files",
        expression: /^pwd$/i,
        handler: this.pwdCommand,
      },
      {
        name: "cd",
        category: "files",
        expression: /^cd(?: (.*))?$/i,
        handler: this.changeDirectoryCommand,
      },
      {
        name: "cat",
        category: "files",
        expression: /^cat(?: (.*))?$/i,
        handler: this.displayCommand,
      },
      {
        name: "vim",
        category: "files",
        expression: /^n?vim?(?: (.*))?$/i,
        handler: this.vimCommand,
      },
      {
        name: "rm",
        category: "files",
        expression: /^(sudo )?rm(?: (.*))?$/i,
        handler: this.rmCommand,
      },
      {
        name: "ls",
        category: "files",
        expression: /^ls$/i,
        handler: this.listCommand,
      },
      {
        name: "neofetch",
        category: "system",
        expression: /^neofetch$/i,
        handler: this.neofetchCommand,
      },
      {
        name: "uptime",
        category: "space",
        expression: /^uptime$/i,
        handler: this.uptimeCommand,
      },
      {
        name: "git blame",
        category: "misc",
        expression: /^git blame(?: (.*))?$/i,
        handler: this.gitBlameCommand,
      },
      {
        name: "history",
        category: "console",
        expression: /^history$/i,
        handler: this.historyCommand,
      },
      {
        name: "coffee",
        category: "misc",
        expression: /^(make |brew )?coffee$/i,
        handler: this.coffeeCommand,
      },
      {
        name: "whoami",
        category: "system",
        expression: /^whoami$/i,
        handler: this.whoamiCommand,
      },
      {
        name: "who",
        category: "space",
        expression: /^who$/i,
        handler: this.whoCommand,
      },
      {
        name: "last",
        category: "space",
        expression: /^last$/i,
        handler: this.lastCommand,
      },
      {
        name: "df",
        category: "space",
        expression: /^df(?: .*)?$/i,
        handler: this.dfCommand,
      },
      {
        name: "ping",
        category: "space",
        expression: /^ping(?: (\S+))?$/i,
        handler: this.pingCommand,
      },
      {
        name: "less",
        category: "system",
        expression: /^less(?: .*)?$/i,
        handler: this.effectCommand.bind(this, "less", ""),
      },
      {
        name: "more",
        category: "system",
        expression: /^more(?: .*)?$/i,
        handler: this.effectCommand.bind(this, "more", ""),
      },
      {
        name: "free",
        category: "system",
        expression: /^free(?: .*)?$/i,
        handler: this.effectCommand.bind(this, "free", ""),
      },
      {
        name: "sleep",
        category: "system",
        expression: /^sleep(?: (\d+))?$/i,
        handler: this.sleepCommand,
      },
      {
        name: "man",
        category: "system",
        expression: /^man(?: (\S+))?$/i,
        handler: this.manCommand,
      },
      {
        name: "kill",
        category: "system",
        expression: /^kill(?: .*)?$/i,
        handler: this.effectCommand.bind(this, "kill", "kill: click anything to terminate it, press Esc to stop killing\nType reboot to bring everything back"),
      },
      {
        name: "sensors",
        category: "space",
        expression: /^sensors(?: .*)?$/i,
        handler: this.sensorsCommand,
      },
      {
        name: "lpstat",
        category: "space",
        expression: /^(lpstat|lpq)(?: .*)?$/i,
        handler: this.lpstatCommand,
      },
      {
        name: "ps",
        category: "system",
        expression: /^ps(?: .*)?$/i,
        handler: this.psCommand,
      },
      {
        name: "shutdown",
        category: "system",
        expression: /^shutdown(?: .*)?$/i,
        handler: this.powerCommand.bind(this, "shutdown"),
      },
      {
        name: "reboot",
        category: "system",
        expression: /^(reboot|reload)$/i,
        handler: this.powerCommand.bind(this, "reboot"),
      },
      {
        name: "format",
        expression: /^format c:?$/i,
        handler: this.wipeCommand,
        hidden: true,
      },
      {
        name: "reset",
        category: "console",
        expression: /^reset$/i,
        handler: this.resetAchievementsCommand,
      },
      {
        name: "secret",
        category: "misc",
        expression: /^(secret|sudo su)$/i,
        handler: this.secretCommand,
      },
      {
        name: "sudo",
        expression: /^sudo(?: .*)?$/i,
        handler: this.sudoCommand,
        hidden: true,
      },
      {
        name: "clear",
        category: "console",
        expression: /^clear$/i,
        handler: this.emptyCommand,
      },
      {
        name: "exit",
        category: "console",
        expression: /^exit$/i,
        handler: this.emptyCommand,
      },
    ];
  }

  /**
   * Loads bot commands and the wiki tree from the bot API in the background
   */
  loadRemoteData() {
    // The bot translates its command descriptions, so wait for the language and reload when it changes
    this.botCommandsLoaded = I18n.ready.then(() => this.loadBotCommands());
    I18n.ready.then(() =>
      I18n.onChange((language) => {
        if (language !== this.botCommandsLanguage) this.botCommandsLoaded = this.loadBotCommands();
      }),
    );

    BotApi.getWikiTree()
      .then((forest) => {
        this.wikiForest = forest;
        this.currentWikiNode = { children: forest };
      })
      .catch(console.error);
  }

  /**
   * Replaces bot commands with the ones from the bot API, described in the current language
   */
  async loadBotCommands() {
    const language = I18n.language;
    this.botCommandsLanguage = language;

    try {
      const commands = await BotApi.getAvailableCommands();
      // A newer language switch already started another load
      if (language !== this.botCommandsLanguage) return;

      this.allCommands = this.allCommands.filter((c) => !c.remote);
      this.allCommands.splice(
        1,
        0,
        ...commands.map((c) => ({
          name: c.command,
          expression: new RegExp(c.regex, "i"),
          description: c.description,
          category: "space",
          remote: true,
          handler: this.botCommand.bind(this, c.command),
        })),
      );
    } catch (error) {
      console.error(error);
    }
  }

  static HelpCategories = ["space", "files", "system", "console", "misc"];

  // Bot commands come already translated, local ones are described in our locales
  describe(command) {
    return command.description ?? I18n.t(`console.commands.${command.name}`);
  }

  helpCommand = async () => {
    // Typing "help" right after opening the console shouldn't miss the bot commands or translations
    await Promise.all([this.botCommandsLoaded, I18n.ready]);
    const visible = this.allCommands.filter((c) => !c.hidden);
    const categories = [...new Set(Interpreter.HelpCategories.concat(visible.map((c) => c.category ?? "misc")))];

    const groups = categories
      .map((category) => {
        const commands = visible.filter((c) => (c.category ?? "misc") === category);
        if (commands.length === 0) return "";

        const lines = commands.map((c) => `${c.name} ${this.describe(c)}`);
        const title = I18n.t(`console.categories.${category}`);
        return `<div class="help-group"><span class="neofetch-accent">[${title}]</span>\n${lines.join("\n")}</div>`;
      })
      .join("");

    // Two columns on wide screens, see .help-columns
    return `<div class="help-columns">${groups}</div>`;
  };

  calendarCommand = () => {
    return `<iframe class="gcal" src="${this.calendarUrl}&hl=${I18n.language}" frameborder="0" scrolling="no"></iframe>`;
  };

  evalCommand = (command, input) => {
    return window.eval(command.expression.exec(input)[1]);
  };

  echoCommand = (command, input) => {
    return command.expression.exec(input)[1];
  };

  pwdCommand = () => {
    return this.currentDirectory ?? "";
  };

  emptyCommand = () => {
    return "";
  };

  getParentDirectoryNode(directory) {
    let temporaryNode = this.currentWikiNode;

    if (directory?.length > 0) {
      const fullDirectory = this.getFullDirectory(directory);

      if (!fullDirectory.startsWith(this.defaultDirectory)) return null;

      const wikiPath = fullDirectory.replace(this.defaultDirectory, "");
      const wikiPathSegments = wikiPath.split("\\").filter((s) => s.length > 0);

      temporaryNode = { children: this.wikiForest };

      for (const segment of wikiPathSegments) {
        temporaryNode = temporaryNode.children.find(
          (node) => node.segment === segment && node.children.length > 0,
        );

        if (!temporaryNode) return null;
      }
    }

    return temporaryNode;
  }

  displayCommand = async (command, input) => {
    const filePath = command.expression.exec(input)[1]?.replace(".md", "");
    if (!filePath) return this.catArt();

    const fileSegments = this.toWindowsFormat(filePath).split("\\");
    const directory = fileSegments.slice(0, -1).join("\\");
    const fileName = fileSegments[fileSegments.length - 1];

    const NOT_FOUND = `No such file: ${fileName}`;
    const CANNOT_READ = `Cannot read file: ${fileName}`;

    const folderNode = this.getParentDirectoryNode(directory);

    if (!folderNode) return NOT_FOUND;

    const wikiNode = folderNode.children.find(
      (node) => node.segment === fileName,
    );

    if (!wikiNode) return NOT_FOUND;

    const wikiPage = await BotApi.getWikiPage(wikiNode.id);

    if (!wikiPage) return CANNOT_READ;

    return wikiPage.content;
  };

  changeDirectoryCommand = async (command, input) => {
    const newDirectory = command.expression.exec(input)[1];
    if (!newDirectory) return "";

    let fullDirectory = this.getFullDirectory(
      this.toWindowsFormat(newDirectory),
    );

    if (!fullDirectory.startsWith(this.defaultDirectory))
      return `Permission denied: ${newDirectory}`;

    if (fullDirectory === this.currentDirectory) return "";

    if (fullDirectory === this.defaultDirectory) {
      this.currentDirectory = fullDirectory;
      this.currentWikiNode = this.wikiForest
        ? { children: this.wikiForest }
        : null;
      return "";
    }

    const wikiPath = fullDirectory.replace(this.defaultDirectory, "");
    const wikiPathSegments = wikiPath.split("\\").filter((s) => s.length > 0);

    if (this.wikiForest) {
      const previusWikiNode = this.currentWikiNode;
      this.currentWikiNode = { children: this.wikiForest };

      for (const segment of wikiPathSegments) {
        this.currentWikiNode = this.currentWikiNode.children.find(
          (node) => node.segment === segment && node.children.length > 0,
        );

        if (!this.currentWikiNode) {
          this.currentWikiNode = previusWikiNode;
          return `No such directory: ${newDirectory}`;
        }
      }
    }

    this.currentDirectory = fullDirectory;
    return "";
  };

  listCommand = async () => {
    if (this.currentWikiNode) {
      return this.currentWikiNode.children
        .map((node) =>
          node.children.length > 0 ? node.segment : node.segment + ".md",
        )
        .join("&nbsp;&nbsp;");
    }
  };

  static GliderLogo = [
    "+---+---+---+",
    "|   | o |   |",
    "+---+---+---+",
    "|   |   | o |",
    "+---+---+---+",
    "| o | o | o |",
    "+---+---+---+",
  ];

  formatDuration(ms) {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    const daysPart = days > 0 ? `${this.plural(days, "day")}, ` : "";

    return `${daysPart}${hours}:${minutes}`;
  }

  plural(count, word) {
    if (count === undefined) return `? ${word}s`;
    return `${count} ${word}${count === 1 ? "" : "s"}`;
  }

  countWikiPages(nodes) {
    return (nodes ?? []).reduce(
      (count, node) =>
        count +
        (node.children.length > 0 ? this.countWikiPages(node.children) : 1),
      0,
    );
  }

  neofetchCommand = async () => {
    const status = await BotApi.getStatus();
    const accent = (text) => `<span class="neofetch-accent">${text}</span>`;
    let stateText = "unknown (bot is sleeping)";
    if (status) {
      const state = status.open ? "open" : "closed";
      stateText = `${state} for ${this.formatDuration(Date.now() - status.dateChanged)}`;
    }

    const info = [
      `${accent("guest")}@${accent("hackem")}`,
      "------------",
      `${accent("OS")}: Memesoft Uwuntu 10.69.420`,
      `${accent("Host")}: Hacker Embassy, Yerevan`,
      `${accent("Kernel")}: hackem-5.0.0-tectonic`,
      `${accent("Uptime")}: ${stateText}`,
      `${accent("Packages")}: ${this.countWikiPages(this.wikiForest)} (wiki)`,
      `${accent("Shell")}: memesh`,
      `${accent("Inside")}: ${this.plural(status?.inside.length, "hacker")}`,
      `${accent("Going")}: ${this.plural(status?.planningToGo.length, "hacker")}`,
      "",
      [
        "#2D2D2B",
        "#C39E9E",
        "#9EC3A4",
        "#C3BC9E",
        "#9EA9C3",
        "#B99EC3",
        "#F6F5F0",
      ]
        .map(
          (color) =>
            `<span style="background:${color}">&nbsp;&nbsp;&nbsp;</span>`,
        )
        .join(""),
    ];

    const logoWidth = Interpreter.GliderLogo[0].length;
    const lines = info.map((line, i) => {
      const logoLine = (Interpreter.GliderLogo[i] ?? "").padEnd(logoWidth, " ");
      return `${accent(logoLine)}   ${line}`;
    });

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  uptimeCommand = async () => {
    const status = await BotApi.getStatus();
    if (!status) return "uptime: cannot reach the space";

    const now = new Date().toLocaleTimeString(I18n.language, {
      timeZone: "Asia/Yerevan",
    });
    const duration = this.formatDuration(Date.now() - status.dateChanged);
    return `${now} ${status.open ? "up" : "down"} ${duration}, ${this.plural(status.inside.length, "user")}, load average: 0.42, 0.69, 4.20`;
  };

  gitBlameCommand = (command, input) => {
    const file = command.expression.exec(input)[1]?.trim() || "space.ts";
    const blamedLines = [
      "if (space.isOnFire) {",
      "    // TODO: put out the fire",
      "    return; // should be fine",
      "}",
      "const coffee = brew(); // works on my machine",
    ];
    const hash = () => Math.random().toString(16).slice(2, 10);

    const lines = blamedLines.map(
      (line, i) =>
        `${hash()} (tectonic 2026-04-01 13:37:00 +0400 ${i + 1}) ${line}`,
    );

    return `<pre class="neofetch">${file}\n${lines.join("\n")}</pre>`;
  };

  historyCommand = () => {
    return this.commandHistory
      .map((line, i) => `${String(i + 1).padStart(5, " ")}  ${line}`)
      .join("\n")
      .replaceAll(" ", "&nbsp;");
  };

  coffeeCommand = () => {
    const teapot = [
      "             ;,'",
      "     _o_    ;:;'",
      " ,-.'---`.__ ;",
      "((j`=====',-'",
      " `-\\     /",
      "    `-=-'",
    ];

    return `<pre class="neofetch">${teapot.join("\n")}\n\nHTTP/1.1 418 I'm a teapot</pre>`;
  };

  rmCommand = (command, input) => {
    const [, sudo, args] = command.expression.exec(input);
    const target = /^-(?:rf|fr) (.+)$/i.exec(args ?? "")?.[1];

    if (!target)
      return [
        "Usage: rm [OPTION]... [FILE]...",
        "Remove (unlink) the FILE(s).",
        "",
        "  -f, --force           ignore nonexistent files, never prompt",
        "  -r, -R, --recursive   remove directories and their contents recursively",
      ]
        .join("\n")
        .replaceAll(" ", "&nbsp;");

    if (!sudo)
      return `rm: cannot remove '${target}': Permission denied\nTry: sudo rm -rf ${target}`;

    return this.wipeCommand();
  };

  wipeCommand = () => {
    // Bsod meme listens for this
    setTimeout(() => window.dispatchEvent(new CustomEvent("bsod")), 1500);
    return String.raw`Deleting C:\Memes\... done. Goodbye!`;
  };

  vimCommand = (command, input) => {
    const file = command.expression.exec(input)[1]?.trim() || "untitled";
    // Vim.js opens the editor over the console
    window.dispatchEvent(new CustomEvent("vim", { detail: { file } }));
    return "";
  };

  resetAchievementsCommand = () => {
    AchievementsDOM.resetAchievements();
    return I18n.t("console.reset");
  };

  catArt() {
    const cat = [
      " /\\_/\\",
      "( o.o )",
      " > ^ &lt;   meow",
    ];

    return `<pre class="neofetch">${cat.join("\n")}</pre>`;
  }

  // "Sat Nov 14 01:27" in Yerevan time
  formatUnixDate(ms) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Yerevan",
        weekday: "short",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date(ms))
        .map((part) => [part.type, part.value])
    );

    return `${parts.weekday} ${parts.month} ${parts.day} ${parts.hour}:${parts.minute}`;
  }

  whoCommand = async () => {
    const status = await BotApi.getStatus();
    if (!status) return "who: cannot reach the space";

    const width = Math.max(8, ...status.inside.map((person) => person.username.length));
    const lines = status.inside
      .toSorted((a, b) => a.dateChanged - b.dateChanged)
      .map((person) => `${person.username.padEnd(width, " ")} space    ${this.formatUnixDate(person.dateChanged).slice(4)}`);

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  lastCommand = async () => {
    const status = await BotApi.getStatus();
    if (!status) return "last: cannot reach the space";

    const width = Math.max(8, status.changedBy.length, ...status.inside.map((person) => person.username.length));
    const row = (user, tty, date, note) =>
      `${user.padEnd(width, " ")} ${tty.padEnd(8, " ")} hackem   ${this.formatUnixDate(date)}   ${note}`;

    const sessions = status.inside
      .toSorted((a, b) => b.dateChanged - a.dateChanged)
      .map((person) => row(person.username, "space", person.dateChanged, "still logged in"));

    const lines = [
      ...sessions,
      row(status.changedBy, "door", status.dateChanged, status.open ? "opened the space" : "closed the space"),
      "",
      `wtmp begins ${this.formatUnixDate(status.dateChanged)}`,
    ];

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  dfCommand = async () => {
    const data = await BotApi.getDonations();
    if (!data) return "df: /dev/rent: cannot reach the space";

    const { name, target_value, collected_value, target_currency } = data.fund;
    const size = Math.round(Number(target_value));
    const used = Math.round(Number(collected_value));
    const avail = Math.max(0, size - used);
    const percent = size > 0 ? Math.round((used / size) * 100) : 0;
    const col = (value) => String(value).padStart(10, " ");

    const lines = [
      `Filesystem      ${col("Size")} ${col("Used")} ${col("Avail")} Use% Mounted on`,
      `/dev/rent       ${col(size)} ${col(used)} ${col(avail)} ${(percent + "%").padStart(4, " ")} /${name}`,
      "",
      `[${"#".repeat(Math.min(30, Math.round(percent * 0.3))).padEnd(30, ".")}] ${target_currency}`,
      I18n.t(percent < 100 ? "console.dfHint" : "console.dfDone"),
    ];

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  pingCommand = async (command, input) => {
    const ownHost = new URL(BotApi.APIEndpoint).hostname;
    const host = command.expression.exec(input)[1] ?? ownHost;
    const isOwnHost = [ownHost, "hackem.cc", "localhost", "127.0.0.1"].includes(host.toLowerCase());
    const lines = [`PING ${host}: 56 data bytes`];
    const times = [];

    for (let seq = 0; seq < 4; seq++) {
      // Pings go one after another, like the real ping
      const time = isOwnHost ? await BotApi.ping() : null; // NOSONAR

      if (time === null) {
        lines.push(`Request timeout for icmp_seq ${seq}`);
      } else {
        times.push(time);
        lines.push(`64 bytes from ${host}: icmp_seq=${seq} ttl=64 time=${time} ms`);
      }
    }

    const loss = (((4 - times.length) / 4) * 100).toFixed(1);
    lines.push("", `--- ${host} ping statistics ---`, `4 packets transmitted, ${times.length} packets received, ${loss}% packet loss`);

    if (times.length > 0) {
      const avg = Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
      lines.push(`round-trip min/avg/max = ${Math.min(...times)}/${avg}/${Math.max(...times)} ms`);
    }

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  // PageEffects.js does the actual work, resolves once the effect is over
  runEffect(name, arg) {
    return new Promise((done) =>
      window.dispatchEvent(new CustomEvent("page-effect", { detail: { name, arg, done } }))
    );
  }

  effectCommand = (name, output) => {
    void this.runEffect(name);
    return output;
  };

  sleepCommand = async (command, input) => {
    const seconds = Math.min(10, Number(command.expression.exec(input)[1] ?? 5));
    await this.runEffect("sleep", seconds);
    return "";
  };

  manCommand = (command, input) => {
    const page = command.expression.exec(input)[1];
    void this.runEffect("man");
    return page ? `No manual entry for ${page}` : "What manual page do you want?";
  };

  sensorsCommand = async () => {
    const climate = await BotApi.getClimate();
    if (!climate) return "No sensors found! (the space is not answering)";

    const value = (raw, format) => (Number.isFinite(Number(raw)) ? format(Number(raw)) : "N/A");
    const row = (label, text) => `${(label + ":").padEnd(13, " ")} ${text}`;
    const chip = (name, floor) =>
      [
        `hackem-${name}-isa-0000`,
        "Adapter: Memesoft Uwuntu",
        row("temp1", value(floor.temperature, (t) => `${t >= 0 ? "+" : ""}${t.toFixed(1)}°C`)),
        row("humidity", value(floor.humidity, (h) => `${Math.round(h)} %`)),
        ...(floor.co2 === undefined ? [] : [row("co2", value(floor.co2, (c) => `${Math.round(c)} ppm`))]),
      ].join("\n");

    return `<pre class="neofetch">${chip("firstfloor", climate.firstFloor)}\n\n${chip("secondfloor", climate.secondFloor)}</pre>`;
  };

  lpstatCommand = async () => {
    const printers = await BotApi.getPrinters();
    if (!printers) return "lpstat: Unable to connect to server: the space is not answering";
    if (printers.length === 0) return "lpstat: No destinations added.";

    const duration = (seconds) => {
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
    };

    const lines = printers.map((printer) => {
      const temps = `\n        extruder ${Math.round(printer.extruderTemperature ?? 0)}°C, bed ${Math.round(printer.bedTemperature ?? 0)}°C`;

      switch (printer.state) {
        case "printing":
        case "paused":
          return `printer ${printer.name} is ${printer.state} ${printer.filename ?? "something"}. ${printer.progress}% done, ${duration(printer.printDuration ?? 0)} elapsed${temps}`;
        case "offline":
          return `printer ${printer.name} disabled - not responding`;
        case "error":
          return `printer ${printer.name} is in error state. Someone call a resident${temps}`;
        default: {
          const lastJob = printer.filename ? ", last job: " + printer.filename : "";
          return `printer ${printer.name} is idle. enabled${lastJob}`;
        }
      }
    });

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  whoamiCommand = () => {
    return `guest\n${I18n.t("console.whoamiHint")}`;
  };

  sudoCommand = () => {
    return "guest is not in the sudoers file. This incident will be reported.";
  };

  psCommand = async () => {
    const status = await BotApi.getStatus();
    const elapsed = (date) => {
      const totalSeconds = Math.max(0, Math.floor((Date.now() - date) / 1000));
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}`;
    };
    const row = (pid, tty, time, cmd) => `${String(pid).padStart(5, " ")} ${tty.padEnd(8, " ")} ${time} ${cmd}`;

    const people = (status?.inside ?? []).map((person, i) =>
      row(1337 + i * 42, "space", elapsed(person.dateChanged), person.username)
    );

    const lines = [
      "  PID TTY          TIME CMD",
      row(1, "pts/0", "00:00:01", "memesh"),
      ...people,
      row(31337, "pts/0", "00:00:00", "ps"),
    ];

    return `<pre class="neofetch">${lines.join("\n")}</pre>`;
  };

  powerCommand = (action) => {
    // Shutdown meme listens for this
    setTimeout(() => window.dispatchEvent(new CustomEvent(action)), 500);
    return action === "reboot" ? "Rebooting..." : "Shutting down...";
  };

  secretCommand = () => {
    window.location = "https://youtu.be/dQw4w9WgXcQ";
  };

  botCommand = async (command) =>
    this.convertTelegramLinks(await BotApi.sendTextCommand(command));

  /**
   * Evaluates the command
   * @param {string} input
   * @returns {Promise<string>}
   */
  get prompt() {
    return `${this.currentDirectory}>`;
  }

  eval = async (input) => {
    for (const command of this.allCommands) {
      if (command.expression.test(input))
        return command.handler(command, input);
    }

    return `No such command. Type "help".`;
  };

  toWindowsFormat(newDirectory) {
    return (
      newDirectory.startsWith("/")
        ? newDirectory.replace("/", "C:\\")
        : newDirectory
    ).replaceAll("/", "\\");
  }

  getFullDirectory(newDirectory) {
    let fullDirectory = newDirectory;

    if (!newDirectory.startsWith("C:\\")) {
      if (newDirectory.startsWith("..")) {
        fullDirectory = newDirectory.replace(
          "..",
          this.currentDirectory
            .slice(0, -1)
            .split("\\")
            .slice(0, -1)
            .join("\\"),
        );
      } else if (newDirectory.startsWith(".")) {
        fullDirectory = newDirectory.replace(".", this.currentDirectory);
      } else if (newDirectory.startsWith("~")) {
        fullDirectory = newDirectory.replace("~", this.defaultDirectory);
      } else {
        fullDirectory = `${this.currentDirectory}\\${newDirectory}`;
      }
    }
    return fullDirectory;
  }

  convertTelegramLinks(text) {
    return text.replaceAll(/@(\S+)/g, (_, match) => {
      if (match.startsWith("group.calendar.google.com")) return match;

      const unescapedMatch = match.replace(String.raw`\_`, "_");
      return `<a class="tg-link" href="https://t.me/${unescapedMatch}" target="_blank">${unescapedMatch}</a>`;
    });
  }
}
