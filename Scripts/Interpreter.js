import BotApi from "./BotApi.js";

export default class Interpreter {
  currentDirectory = `C:\\Memes\\user`;

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
        expression: /^cd (.*)$/i,
        handler: this.emptyCommand,
        description: "Cменить директорию",
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
