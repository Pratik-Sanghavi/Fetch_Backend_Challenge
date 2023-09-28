const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./database/database.db', (err) => {
    if(err){
        console.log(err.message);
    } else{
        console.log('Connected to the database');
    }
});

// Create points table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Points(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payer TEXT NOT NULL,
            points INTEGER NOT NULL,
            timestamp DATETIME NOT NULL
        );
    `), (err) => {
        if(err){
            console.log(err.message);
        }
        console.log('Points table created successfully or already exists.');
    };
})

module.exports = db;