import BotApi from "./BotApi.js";

export default class Interpreter {
  defaultDirectory = `C:\\Memes\\user`;
  currentDirectory = this.defaultDirectory;
  wikiForest = null;
  currentWikiNode = null;

  constructor() {
    /**
     * @type {{name: string, expression: RegExp, handler: function, description: string}[]}
     */
    this.allCommands = [
      {
        name: "help",
        expression: /^\/?(help|помогите|че делать\?+)$/i,
        handler: this.helpCommand,
        description: "Помощь",
      },
      {
        name: "eval",
        expression: /^eval (.*)$/i,
        handler: this.evalCommand,
        description: "[command] JavaScript код",
      },
      {
        name: "echo",
        expression: /^echo (.*)$/i,
        handler: this.echoCommand,
        description: "[text] Вывести сообщение",
      },
      {
        name: "pwd",
        expression: /^pwd$/i,
        handler: this.pwdCommand,
        description: "Текущая директория",
      },
      {
        name: "cd",
        expression: /^cd(?: (.*))?$/i,
        handler: this.changeDirectoryCommand,
        description: "Cменить директорию",
      },
      {
        name: "cat",
        expression: /^cat(?: (.*))?$/i,
        handler: this.displayCommand,
        description: "Прочесть файл",
      },
      {
        name: "ls",
        expression: /^ls$/i,
        handler: this.listCommand,
        description: "Просмотреть директорию",
      },
      {
        name: "secret",
        expression: /^secret$/i,
        handler: this.secretCommand,
        description: "Не набирай эту команду!",
      },
      {
        name: "clear",
        expression: /^clear$/i,
        handler: this.emptyCommand,
        description: "Очистить консоль",
      },
      {
        name: "exit",
        expression: /^exit$/i,
        handler: this.emptyCommand,
        description: "Выйти из консоли",
      },
    ];

    BotApi.getAvailableCommands().then((commands) => {
      this.allCommands.splice(
        1,
        0,
        ...commands.map((c) => ({
          name: c.command,
          expression: new RegExp(c.regex, "i"),
          description: c.description,
          handler: this.botCommand.bind(this, c.command),
        }))
      );
    });

    BotApi.getWikiTree().then((forest) => {
      this.wikiForest = forest;
      this.currentWikiNode = { children: forest };
    });
  }

  helpCommand = async () => {
    return this.allCommands.map((c) => `${c.name} ${c.description}`).join("\n");
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
          (node) => node.segment === segment && node.children.length > 0
        );

        if (!temporaryNode) return null;
      }
    }

    return temporaryNode;
  }

  displayCommand = async (command, input) => {
    const filePath = command.expression.exec(input)[1]?.replace(".md", "");
    if (!filePath) return "";

    const fileSegments = this.toWindowsFormat(filePath).split("\\");
    const directory = fileSegments.slice(0, -1).join("\\");
    const fileName = fileSegments[fileSegments.length - 1];

    const NOT_FOUND = `No such file: ${fileName}`;
    const CANNOT_READ = `Cannot read file: ${fileName}`;

    const folderNode = this.getParentDirectoryNode(directory);

    if (!folderNode) return NOT_FOUND;

    const wikiNode = folderNode.children.find(
      (node) => node.segment === fileName
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
      this.toWindowsFormat(newDirectory)
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
          (node) => node.segment === segment && node.children.length > 0
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
          node.children.length > 0 ? node.segment : node.segment + ".md"
        )
        .join("&nbsp;&nbsp;");
    }
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
          this.currentDirectory.slice(0, -1).split("\\").slice(0, -1).join("\\")
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

  unescapeMarkdown(text) {
    return text.replaceAll("\\_", "_").replaceAll("\\[", "[");
  }

  convertTelegramLinks(text) {
    return text.replaceAll(/@(\S+)/g, (_, match) =>
      !match.startsWith("group.calendar.google.com")
        ? `<a class="tg-link" href="https://t.me/${match}" target="_blank">${match}</a>`
        : match
    );
  }
}
