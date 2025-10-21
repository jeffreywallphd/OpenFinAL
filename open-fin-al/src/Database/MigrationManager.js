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
        try {
            const migrationFiles = this.getMigrationFiles();
            const executedMigrations = this.getExecutedMigrations();

            for (const filename of migrationFiles) {
                if (!executedMigrations.includes(filename)) {
                    console.log(`Running migration: ${filename}`);
                    await this.executeMigration(filename);
                    this.markMigrationAsExecuted(filename);
                    console.log(`Completed migration: ${filename}`);
                }
            }
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    }

    getMigrationFiles() {
        try {
            return readdirSync(this.migrationsPath)
                .filter(file => file.endsWith('.sql'))
                .sort();
        } catch (error) {
            console.log('No migrations directory found or no migration files');
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
