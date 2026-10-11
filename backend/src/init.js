const db = require("./database");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function initDatabase(retries = 30, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const exists = await db.schema.hasTable("notes");
            if (!exists) {
                await db.schema.createTable("notes", table => {
                    table.increments("id");
                    table.string("title", 255).notNullable();
                    table.text("content");
                    table.timestamp("created_at").defaultTo(db.fn.now());
                });
                console.log("Created table 'notes'");
            }
            return;
        } catch (err) {
            console.log(
                `Database not ready (attempt ${attempt}/${retries}): ${err.message}`
            );
            await sleep(delayMs);
        }
    }
    throw new Error("Could not connect to the database");
}

module.exports = initDatabase;