export default class BotApi {
  static APIEndpoint = "https://gateway.hackerembassy.site:9000";

  static async sendTextCommand(command) {
    let res = await fetch(`${this.APIEndpoint}/text/${command}`, {
      mode: "cors",
    });
    return await res.text();
  }
}
