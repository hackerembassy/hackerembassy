export default class BotApi {
  static APIEndpoint = "https://gateway.hackem.cc:9000";

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
    return fetch(`${this.APIEndpoint}/text`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .catch(() => []);
  }

  /**
   * @typedef {{segment: string, id: number, title:string, children:WikiPageTreeNode[]}} WikiPageTreeNode
   * @typedef {{path: string, id: number, title:string, content:string}} WikiPage
   */

  /**
   * Returns a list of available wiki pages in a tree format
   * @returns {Promise<WikiPageTreeNode[]>}
   */
  static async getWikiTree() {
    return fetch(`${this.APIEndpoint}/api/wiki/tree`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .catch(() => null);
  }

  /**
   * Returns a list of available wiki pages in a tree format
   * @returns {Promise<WikiPage>}
   */
  static async getWikiPage(id) {
    return fetch(`${this.APIEndpoint}/api/wiki/page/${id}`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .catch(() => null);
  }
}
