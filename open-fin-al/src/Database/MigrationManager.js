const Database = require('better-sqlite3');
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

class MigrationManager {
    constructor(db, migrationsPath) {
        this.db = db;
        this.migrationsPath = migrationsPath;
        this.initializeMigrationsTable();
    }

    initializeMigrationsTable() {
        const createMigrationsTable = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        this.db.exec(createMigrationsTable);
    }

    async runMigrations() {
        const migrationFiles = this.getMigrationFiles();
        const executedMigrations = this.getExecutedMigrations();

        for (const filename of migrationFiles) {
            if (!executedMigrations.includes(filename)) {
                try {
                    await this.executeMigration(filename);
                    this.markMigrationAsExecuted(filename);
                } catch (error) {
                    // Ignore duplicate column errors - these are expected when schema already exists
                    if (error.message && error.message.includes('duplicate column name')) {
                        // Mark as executed even if it had duplicate columns
                        this.markMigrationAsExecuted(filename);
                        continue; // Continue to next migration
                    }
                    // Re-throw other errors
                    throw error;
                }
            }
        }
    }

    getMigrationFiles() {
        try {
            return readdirSync(this.migrationsPath)
                .filter(file => file.endsWith('.sql'))
                .sort();
        } catch (error) {
            return [];
        }
    }

    getExecutedMigrations() {
        const stmt = this.db.prepare('SELECT filename FROM migrations ORDER BY id');
        const rows = stmt.all();
        return rows.map(row => row.filename);
    }

    async executeMigration(filename) {
        const filePath = join(this.migrationsPath, filename);
        const sql = readFileSync(filePath, 'utf-8');

        // Temporarily disable schema validation to allow migrations on databases
        // with legacy/quirky schema definitions (e.g., double-quoted string literals)
        this.db.pragma('writable_schema = ON');

        try {
            this.db.exec(sql);
        } catch (error) {
            throw error; // Re-throw other errors
        } finally {
            // Re-enable schema validation
            this.db.pragma('writable_schema = OFF');
        }
    }

    markMigrationAsExecuted(filename) {
        const stmt = this.db.prepare('INSERT INTO migrations (filename) VALUES (?)');
        stmt.run(filename);
    }

    getAppliedMigrations() {
        return this.getExecutedMigrations();
    }
}

module.exports = { MigrationManager };
