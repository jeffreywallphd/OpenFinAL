import { PinEncryption } from '../Utility/PinEncryption';

// TypeScript interface for OpenFinAL's database operations
interface OpenFinALDatabase {
    SQLiteQuery: (params: { query: string; parameters?: any[] }) => Promise<any[]>;
    SQLiteGet: (params: { query: string; parameters?: any[] }) => Promise<any>;
    SQLiteInsert: (params: { query: string; parameters?: any[] }) => Promise<{ lastInsertRowid: number }>;
    SQLiteUpdate: (params: { query: string; parameters?: any[] }) => Promise<any>;
}

// Use existing window.database (already declared elsewhere in OpenFinAL)
declare const window: Window & { database: OpenFinALDatabase };

/**
 * User Authentication Interactor
 * Handles user login, registration, and PIN management with encryption
 * Uses OpenFinAL's existing window.database pattern
 */
export class UserAuthInteractor {
    constructor() {
        // No database parameter needed - uses window.database like other gateways
    }

    /**
     * Register a new user with encrypted PIN
     * @param userData - User registration data
     * @returns Promise<{success: boolean, userId?: number, error?: string}>
     */
    async registerUser(userData: {
        firstName: string,
        lastName: string,
        username: string,
        pin: string
    }): Promise<{success: boolean, userId?: number, error?: string}> {
        try {
            // Check if window.database is available
            if (!window.database) {
                return { success: false, error: 'Database not available' };
            }

            // Validate PIN format
            if (!PinEncryption.validatePinFormat(userData.pin)) {
                return { success: false, error: 'Invalid PIN format' };
            }

            // Check if username already exists
            const existingUsers = await window.database.SQLiteQuery({
                query: `SELECT id FROM User WHERE username = ?`,
                parameters: [userData.username]
            });

            if (existingUsers && existingUsers.length > 0) {
                return { success: false, error: 'Username already exists' };
            }

            // Hash the PIN
            const pinHash = await PinEncryption.hashPin(userData.pin);

            // Insert new user
            const result = await window.database.SQLiteInsert({
                query: `INSERT INTO User (firstName, lastName, username, pinHash) VALUES (?, ?, ?, ?)`,
                parameters: [userData.firstName, userData.lastName, userData.username, pinHash]
            });

            // Create default portfolio for the user
            await window.database.SQLiteInsert({
                query: `INSERT INTO Portfolio (name, userId, isDefault) VALUES (?, ?, 1)`,
                parameters: [`${userData.firstName}'s Portfolio`, result.lastID]
            });

            return { success: true, userId: result.lastID };
        } catch (error) {
            return { success: false, error: `Registration failed: ${error.message || 'Unknown error'}` };
        }
    }

    /**
     * Authenticate user with username and PIN
     * @param username - User's username
     * @param pin - User's 8-digit PIN
     * @returns Promise<{success: boolean, user?: any, error?: string}>
     */
    async loginUser(username: string, pin: string): Promise<{
        success: boolean, 
        user?: any, 
        error?: string
    }> {
        try {
            // Validate PIN format
            if (!PinEncryption.validatePinFormat(pin)) {
                return { success: false, error: 'Invalid PIN format' };
            }

            // Get user from database
            const users = await window.database.SQLiteQuery({
                query: `SELECT id, firstName, lastName, username, pinHash FROM User WHERE username = ?`,
                parameters: [username]
            });

            if (!users || users.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const user = users[0];

            // Verify PIN
            const isPinValid = await PinEncryption.verifyPin(pin, user.pinHash);
            
            if (!isPinValid) {
                return { success: false, error: 'Invalid PIN' };
            }

            // Update last login timestamp
            await window.database.SQLiteUpdate({
                query: `UPDATE User SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?`,
                parameters: [user.id]
            });

            // Remove pinHash from returned user object for security
            const { pinHash, ...userWithoutPin } = user;

            return { success: true, user: userWithoutPin };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    }

    /**
     * Change user's PIN
     * @param userId - User's ID
     * @param currentPin - Current PIN for verification
     * @param newPin - New 8-digit PIN
     * @returns Promise<{success: boolean, error?: string}>
     */
    async changePIN(userId: number, currentPin: string, newPin: string): Promise<{
        success: boolean, 
        error?: string
    }> {
        try {
            // Validate new PIN format
            if (!PinEncryption.validatePinFormat(newPin)) {
                return { success: false, error: 'New PIN must be exactly 8 digits' };
            }

            // Get current user data
            const users = await window.database.SQLiteQuery({
                query: `SELECT pinHash FROM User WHERE id = ?`,
                parameters: [userId]
            });

            if (!users || users.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const user = users[0];

            // Verify current PIN
            const isCurrentPinValid = await PinEncryption.verifyPin(currentPin, user.pinHash);
            
            if (!isCurrentPinValid) {
                return { success: false, error: 'Current PIN is incorrect' };
            }

            // Hash new PIN
            const newPinHash = await PinEncryption.hashPin(newPin);

            // Update PIN in database
            await window.database.SQLiteUpdate({
                query: `UPDATE User SET pinHash = ? WHERE id = ?`,
                parameters: [newPinHash, userId]
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: 'PIN change failed' };
        }
    }

    /**
     * Get user's portfolios
     * @param userId - User's ID
     * @returns Array of user's portfolios
     */
    async getUserPortfolios(userId: number): Promise<any[]> {
        try {
            const portfolios = await window.database.SQLiteQuery({
                query: `SELECT id, name, isDefault FROM Portfolio WHERE userId = ? ORDER BY isDefault DESC, name ASC`,
                parameters: [userId]
            });
            return portfolios || [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Get user's default portfolio
     * @param userId - User's ID
     * @returns Default portfolio or null
     */
    async getDefaultPortfolio(userId: number): Promise<any | null> {
        try {
            const portfolios = await window.database.SQLiteQuery({
                query: `SELECT id, name, isDefault FROM Portfolio WHERE userId = ? AND isDefault = 1`,
                parameters: [userId]
            });
            return portfolios && portfolios.length > 0 ? portfolios[0] : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Initiate PIN reset process by verifying user identity
     * @param username - User's username
     * @param firstName - User's first name for verification
     * @param lastName - User's last name for verification
     * @returns Promise<{success: boolean, userId?: number, error?: string}>
     */
    async initiatePinReset(username: string, firstName: string, lastName: string): Promise<{
        success: boolean, 
        userId?: number, 
        error?: string
    }> {
        try {
            // Get user from database
            const users = await window.database.SQLiteQuery({
                query: `SELECT id, firstName, lastName, username FROM User WHERE username = ?`,
                parameters: [username]
            });

            if (!users || users.length === 0) {
                return { success: false, error: 'User not found' };
            }

            const user = users[0];

            // Verify identity using first and last name
            if (user.firstName.toLowerCase() !== firstName.toLowerCase() || 
                user.lastName.toLowerCase() !== lastName.toLowerCase()) {
                return { success: false, error: 'Identity verification failed. Please check your name details.' };
            }

            return { success: true, userId: user.id };
        } catch (error) {
            return { success: false, error: 'PIN reset initiation failed' };
        }
    }

    /**
     * Complete PIN reset with new PIN
     * @param userId - User's ID from initiatePinReset
     * @param newPin - New 8-digit PIN
     * @returns Promise<{success: boolean, error?: string}>
     */
    async completePinReset(userId: number, newPin: string): Promise<{
        success: boolean, 
        error?: string
    }> {
        try {
            // Validate new PIN format
            if (!PinEncryption.validatePinFormat(newPin)) {
                return { success: false, error: 'New PIN must be exactly 8 digits' };
            }

            // Hash new PIN
            const newPinHash = await PinEncryption.hashPin(newPin);

            // Update PIN in database
            await window.database.SQLiteUpdate({
                query: `UPDATE User SET pinHash = ?, lastLogin = CURRENT_TIMESTAMP WHERE id = ?`,
                parameters: [newPinHash, userId]
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: 'PIN reset failed' };
        }
    }
}

/**
 * Example usage:
 * 
 * const authService = new UserAuthInteractor();
 * 
 * // Register new user
 * const registration = await authService.registerUser({
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     username: 'johndoe',
 *     pin: '12345678'
 * });
 * 
 * // Login user
 * const login = await authService.loginUser('johndoe', '12345678');
 * 
 * // Change PIN
 * const pinChange = await authService.changePIN(userId, '12345678', '87654321');
 */
