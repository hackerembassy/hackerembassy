import Hueficator from "./Hueficator.js"

export default class Interpreter {
  currentDirectory = `C:\\Memes\\user`;
  hueficator = new Hueficator();

  helpCommand = () => {
    console.log("help");
    return `-help Помощь
-status Статус спейса
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

  statusCommand = async (command, input) => {
    let res = await fetch("https://nickkiselev.me:9000/status", { mode: "cors"});
    let data = await res.text();
    return data;
  }

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
}
