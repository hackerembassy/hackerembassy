export default class Interpreter{
    helpCommand = () =>{
        console.log("help");
        return `-help Помощь<br>\
        -cd [dir] Сменить директорию<br>\
        -clear Очистить консоль`
    }

    AllCommands = [
        {
            name: "help",
            expression: /^(help)|(помогите)|(че делать\?+)$/i,
            handler: this.helpCommand
        }
    ]   

    eval = (input)=>{
        for (const command of this.AllCommands) {
            if (command.expression.test(input))
                return command.handler(input);
            
        }

        return "No such command";
    }
}