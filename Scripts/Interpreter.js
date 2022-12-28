import Hueficator from "./Hueficator.js"

export default class Interpreter {
  currentDirectory = `C:\\Memes\\user`;
  hueficator = new Hueficator();

  helpCommand = () => {
    console.log("help");
    return `-help Помощь<br>\
        -cd [dir] Сменить директорию (WIP)<br>\
        -pwd Текущая директория<br>\
        -clear Очистить консоль<br>\
        -huefy [russian_word] ***<br>\
        -eval [command] JavaScript код<br>\
        -echo [text] Вывести сообщение`;
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

  AllCommands = [
    {
      name: "help",
      expression: /^(help|помогите|че делать\?+)$/i,
      handler: this.helpCommand,
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

  eval = (input) => {
    for (const command of this.AllCommands) {
      if (command.expression.test(input))
        return command.handler(command, input);
    }

    return `No such command. Type "help".`;
  };
}
