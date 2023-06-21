import BotApi from "./BotApi.js"

export default class Interpreter {
  currentDirectory = `C:\\Memes\\user`;

  helpCommand = async () => {
    let botCommands = await BotApi.sendCommand("commands") ?? "";
    return `-help Помощь\
${botCommands}\
-pwd Текущая директория
-clear Очистить консоль
-eval [command] JavaScript код
-echo [text] Вывести сообщение
-secret Не набирай эту команду!
-exit Выйти из консоли
`;
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

  statusCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("status"));
  joinCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("join"));
  donateCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("donate"));
  fundsCommand = async () => this.convertTelegramLinks(this.unescapeMarkdown(await BotApi.sendCommand("funds")));
  eventsCommand = async () => await BotApi.sendCommand("events");
  residentsCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("getresidents"));

  AllCommands = [
    {
      name: "help",
      expression: /^(help|помогите|че делать\?+)$/i,
      handler: this.helpCommand,
    },
    {
      name: "status",
      expression: /^status$/i,
      handler: this.statusCommand,
    },
    {
      name: "join",
      expression: /^join$/i,
      handler: this.joinCommand,
    },
    {
      name: "donate",
      expression: /^donate$/i,
      handler: this.donateCommand,
    },
    {
      name: "funds",
      expression: /^funds$/i,
      handler: this.fundsCommand,
    },
    {
      name: "events",
      expression: /^events$/i,
      handler: this.eventsCommand,
    },
    {
      name: "residents",
      expression: /^residents$/i,
      handler: this.residentsCommand,
    },
    {
      name: "eval",
      expression: /^eval (.*)$/i,
      handler: this.evalCommand,
    },
    {
      name: "echo",
      expression: /^echo (.*)$/i,
      handler: this.echoCommand,
    },
    {
      name: "pwd",
      expression: /^pwd$/i,
      handler: this.pwdCommand,
    },
    {
        name: "cd",
        expression: /^cd (.*)$/i,
        handler: this.emptyCommand,
    },
    {
      name: "ыускуе",
      expression: /^secret$/i,
      handler: this.secretCommand,
  },
  ];

  eval = async (input) => {
    for (const command of this.AllCommands) {
      if (command.expression.test(input))
        return await command.handler(command, input);
    }

    return `No such command. Type "help".`;
  };

  unescapeMarkdown(text){
    return text.replaceAll("\\_","_").replaceAll("\\[","[");
  }

  convertTelegramLinks(text){
    return text.replaceAll(/@(\S+)/g , (_,match) => `<a class="tg-link" href="https://t.me/${match}" target="_blank">${match}</a>`);
  }
}
