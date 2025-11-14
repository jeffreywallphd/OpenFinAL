// TypeScript declarations for browser crypto
declare global {
    interface Window {
        crypto: Crypto;
    }
}

// Browser-compatible crypto implementation
const getNodeCrypto = () => {
    try {
        return require('crypto');
    } catch {
        return null;
    }
};

/**
 * Utility class for encrypting and verifying 8-digit PINs
 * Uses bcrypt-style hashing with salt for secure PIN storage
 */
export class PinEncryption {
    private static readonly SALT_ROUNDS = 12;
    private static readonly PIN_REGEX = /^[0-9]{8}$/;

    /**
     * Validates that the PIN is exactly 8 digits
     * @param pin - The PIN to validate
     * @returns true if valid, false otherwise
     */
    static validatePinFormat(pin: string): boolean {
        return this.PIN_REGEX.test(pin);
    }

    /**
     * Hashes an 8-digit PIN using browser-compatible hashing
     * @param pin - The 8-digit PIN to hash
     * @returns Promise<string> - The hashed PIN
     * @throws Error if PIN format is invalid
     */
    static async hashPin(pin: string): Promise<string> {
        if (!this.validatePinFormat(pin)) {
            throw new Error('PIN must be exactly 8 digits');
        }

        // Generate a random salt using browser crypto API
        const saltArray = new Uint8Array(16);
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(saltArray);
        } else {
            // Fallback for Node.js environment
            const nodeCrypto = getNodeCrypto();
            if (nodeCrypto) {
                const saltBuffer = nodeCrypto.randomBytes(16);
                saltArray.set(saltBuffer);
            } else {
                // Fallback to Math.random if no crypto available
                for (let i = 0; i < 16; i++) {
                    saltArray[i] = Math.floor(Math.random() * 256);
                }
            }
        }
        const salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Hash the PIN with the salt using Web Crypto API or Node.js crypto
        const hash = await this.pbkdf2Hash(pin, salt, 10000, 64);
        
        // Combine salt and hash for storage
        return `${salt}:${hash}`;
    }

    /**
     * Verifies a PIN against its stored hash
     * @param pin - The plain text PIN to verify
     * @param storedHash - The stored hash from the database
     * @returns Promise<boolean> - true if PIN matches, false otherwise
     */
    static async verifyPin(pin: string, storedHash: string): Promise<boolean> {
        if (!this.validatePinFormat(pin)) {
            return false;
        }

        try {
            // Split the stored hash into salt and hash
            const [salt, hash] = storedHash.split(':');
            
            if (!salt || !hash) {
                return false;
            }

            // Hash the provided PIN with the stored salt
            const providedHash = await this.pbkdf2Hash(pin, salt, 10000, 64);
            
            // Compare hashes using timing-safe comparison
            return this.timingSafeEqual(hash, providedHash);
        } catch (error) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    }

    /**
     * Generates a random 8-digit PIN
     * @returns string - A random 8-digit PIN
     */
    static generateRandomPin(): string {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    /**
     * Browser-compatible PBKDF2 implementation
     * @param password - The password to hash
     * @param salt - The salt string
     * @param iterations - Number of iterations
     * @param keyLength - Length of the derived key
     * @returns Promise<string> - The derived key as hex string
     */
    private static async pbkdf2Hash(password: string, salt: string, iterations: number, keyLength: number): Promise<string> {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            // Use Web Crypto API
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);
            const saltBuffer = new Uint8Array(salt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            
            const key = await window.crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveBits']
            );
            
            const derivedBits = await window.crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: iterations,
                    hash: 'SHA-512'
                },
                key,
                keyLength * 8
            );
            
            return Array.from(new Uint8Array(derivedBits))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } else {
            // Fallback to Node.js crypto
            const nodeCrypto = getNodeCrypto();
            if (nodeCrypto) {
                return nodeCrypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha512').toString('hex');
            } else {
                // Simple fallback hash if no crypto available (not recommended for production)
                console.warn('No secure crypto implementation available, using simple hash');
                return this.simpleHash(password + salt);
            }
        }
    }

    /**
     * Timing-safe string comparison
     * @param a - First string
     * @param b - Second string
     * @returns boolean - true if strings are equal
     */
    private static timingSafeEqual(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    /**
     * Simple hash function fallback (NOT CRYPTOGRAPHICALLY SECURE)
     * Only used when no proper crypto implementation is available
     * @param input - String to hash
     * @returns string - Simple hash as hex string
     */
    private static simpleHash(input: string): string {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to positive hex string with padding
        return Math.abs(hash).toString(16).padStart(8, '0').repeat(8); // 64 chars to match expected length
    }
}

/**
 * Example usage:
 * 
 * // Hash a PIN for storage
 * const pinHash = await PinEncryption.hashPin('12345678');
 * 
 * // Verify a PIN during login
 * const isValid = await PinEncryption.verifyPin('12345678', storedPinHash);
 * 
 * // Generate a random PIN
 * const randomPin = PinEncryption.generateRandomPin();
 */
