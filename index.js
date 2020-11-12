const {ElbotScraper, Session} = require("./classes.js");
const readline = require("readline");

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

(async () => {
    process.stdout.write("Starting browser...\n")
    let scraper = new ElbotScraper()
    scraper.launch()
    .then(scraper => {
        process.stdout.write("Browser successfully launced!\n");
        process.stdout.write("Starting a new session...\n");
        scraper.newSession()
        .then(data => {
            process.stdout.write("Session launched successfully!\n\n")
            let session = data.session;
            let response = data.response;
            let rl = readline.createInterface(process.stdin, process.stdout);

            process.stdout.write(`Elbot: ${response.reply}\n`);
            rl.setPrompt("You: ");
            rl.prompt();
            rl.on('line', async input => {
                response = await session.query(input);
                process.stdout.write(`Elbot: ${response.reply}\n`);
                process.stdout.write("You: ")
            })

        })
    })
})();