import Hueficator from "./Hueficator.js"
import BotApi from "./BotApi.js"

export default class Interpreter {
  currentDirectory = `C:\\Memes\\user`;
  hueficator = new Hueficator();

  helpCommand = async () => {
    let botCommands = await BotApi.sendCommand("commands") ?? "";
    return `-help Помощь\
${botCommands}\
-cd [dir] Сменить директорию (WIP)
-pwd Текущая директория
-clear Очистить консоль
-huefy [russian_word] ***
-eval [command] JavaScript код
-echo [text] Вывести сообщение
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

  huefyCommand = (command, input) => {
    return this.hueficator.huefy(command.expression.exec(input)[2]);
  }

  statusCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("status"));
  joinCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("join"));
  donateCommand = async () => this.convertTelegramLinks(await BotApi.sendCommand("donate"));
  fundsCommand = async () => this.convertTelegramLinks(this.unescapeMarkdown(await BotApi.sendCommand("funds")));

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
        name: "huefy",
        expression: /^(huefy|хуификатор|хуифицируй) (.*)$/i,
        handler: this.huefyCommand,
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
