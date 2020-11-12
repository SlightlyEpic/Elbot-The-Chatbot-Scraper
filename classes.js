const puppeteer = require("puppeteer");

class ElbotScraper{
    constructor() {
        this.browser = null;
        this.sessions = [];
        this.sessionCount = 0;
    }

    launch() {
        return new Promise((resolve, reject) => {
            puppeteer.launch()
            .then(browser => {
                this.browser = browser;
                resolve(this);
            })
            .catch(error => {
                reject(error);
            })
        })
    }
    
    async newSession() {
        let session = new Session(this.browser);
        let response = await session.launch();
        this.sessions[session.sessionID] = session;
        return {
            session: session,
            response: response
        }
    }

    async endSession(sessionID) {
        try {
            this.sessions[sessionID].end()
            .then(() => {
                delete this.session[sessionID];
                return true;
            })
            .catch(e => {
                return Error(error);
            })
        } catch(error) {
            return Error("Invalid session ID");
        }
    }

    async close() {
        return this.browser.close();
    }
}

class Session{
    constructor(browser) {
        this.browser = browser;
        this.page = null;
        this.sessionID = `#${Math.floor(Math.random() * 100000)}`;
        this.history = [];
    }

    async launch() {
        return new Promise((resolve, reject) => {
            this.browser.newPage()
            .then(async page => {
                this.page = page;
                this.page.goto("http://elbot-e.artificial-solutions.com/cgi-bin/elbot.cgi")
                .then(async page_ => {
                    const img = await this.page.evaluate('document.querySelector("body > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > img").src');
                    const reply = await this.page.evaluate('document.querySelector("body > form > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerText');
                    resolve({
                        imageURL: img,
                        reply: reply
                    });
                })
                .catch(error => {
                    reject(error);
                })
            })
            .catch(error => {
                reject(error);
            })
        })
    }

    async query(input) {
        return new Promise((resolve, reject) => {
            this.page.evaluate(`document.querySelector("body > form > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=text]").value = "${input}"`)
            .then(async inp => {
                this.page.evaluate('document.querySelector("body > form > table > tbody > tr:nth-child(5) > td:nth-child(2) > input[type=image]").click()')
                .then(async () => {
                    await this.page.waitForNavigation({waitUntil: 'networkidle0'})
                    const img = await this.page.evaluate('document.querySelector("body > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > img").src');
                    const reply = await this.page.evaluate('document.querySelector("body > form > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerText'); 
                    const response = {
                        query: input,
                        imageURL: img,
                        reply: reply
                    }
                    this.history.unshift(response);
                    resolve(response);
                })
                .catch(error => {
                    reject(error);
                })
            })
            .catch(error => {
                reject(error);
            })
        })
    }

    async end() {
        return await this.page.close();
    }
}

module.exports = {
    "ElbotScraper": ElbotScraper,
    "Session": Session
}