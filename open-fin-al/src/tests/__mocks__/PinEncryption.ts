export const validatePinFormat = jest.fn();
export const hashPin = jest.fn();
export const verifyPin = jest.fn();
export const generateRandomPin = jest.fn();
export const timingSafeEqual = jest.fn();

export class PinEncryption {
    static validatePinFormat = validatePinFormat;
    static hashPin = hashPin;
    static verifyPin = verifyPin;
    static generateRandomPin = generateRandomPin;
    static timingSafeEqual = timingSafeEqual;
}
