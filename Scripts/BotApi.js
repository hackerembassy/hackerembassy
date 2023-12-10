export default class BotApi {
  static APIEndpoint = "https://gateway.hackerembassy.site:9000";

  /**
   * Asks the bot server to execute a command
   * @param {string} command name
   * @returns {Promise<string>}
   */
  static async sendTextCommand(command) {
    return fetch(`${this.APIEndpoint}/text/${command}`, {
      mode: "cors",
    })
      .then((res) => res.text())
      .catch(() => "Error executing command");
  }

  /**
   * Returns a list of available commands for the site from /text endpoint
   * @returns {Promise<{command: string, description:string, regex: string}[]}>}
   */
  static async getAvailableCommands() {
    return fetch(`${this.APIEndpoint}/api/text`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .catch(() => []);
  }
}
