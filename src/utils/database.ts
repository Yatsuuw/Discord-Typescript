import * as sqlite from 'sqlite3';

export const db = new sqlite.Database('src/keys/file.db');

db.run(`
    CREATE TABLE IF NOT EXISTS server_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId INTEGER,
        logChannelId INTEGER,
        welcomeChannelID INTEGER,
        leaveChannelID INTEGER,
        welcomeGifUrl TEXT,
        leaveGifUrl TEXT
    )
`)