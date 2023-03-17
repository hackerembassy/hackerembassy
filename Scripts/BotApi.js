export default class BotApi {
    static APIEndpoint = "https://gateway.hackerembassy.site:9000";

    static async sendCommand(command){
        let res = await fetch(`${this.APIEndpoint}/${command}`, { mode: "cors"});
        return await res.text();
    }
}