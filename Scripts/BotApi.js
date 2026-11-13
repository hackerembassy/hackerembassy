export default class BotApi {
  static APIEndpoint = "https://gateway.hackem.cc";

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
   * @typedef {{username: string, dateChanged: number}} UserState
   * @typedef {{open: number, dateChanged: number, changedBy: string, inside: UserState[], planningToGo: UserState[]}} SpaceStatus
   */

  /**
   * Returns the current space status
   * @returns {Promise<SpaceStatus|null>}
   */
  static async getStatus() {
    return fetch(`${this.APIEndpoint}/api/status`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .catch(() => null);
  }

  /**
   * @typedef {{name: string, target_value: string, collected_value: string, target_currency: string}} Fund
   * @typedef {{fund: Fund, donations: {rank: number, username: string, combined_value: string}[]}} FundDonations
   */

  /**
   * Returns the current costs fund with its donations
   * @returns {Promise<FundDonations|null>}
   */
  static async getDonations() {
    return fetch(`${this.APIEndpoint}/api/donations`, {
      mode: "cors",
    })
      .then((res) => res.json())
      .catch(() => null);
  }

  /**
   * Measures a round trip to the bot API
   * @returns {Promise<number|null>} milliseconds or null on failure
   */
  static async ping() {
    const start = performance.now();

    return fetch(`${this.APIEndpoint}/api/insidecount`, {
      mode: "cors",
      cache: "no-store",
    })
      .then(() => Math.round(performance.now() - start))
      .catch(() => null);
  }

  /**
   * @typedef {{segment: string, id: number, title:string, children:WikiPageTreeNode[]}} WikiPageTreeNode
   * @typedef {{id: number, content:string}} WikiPage
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
