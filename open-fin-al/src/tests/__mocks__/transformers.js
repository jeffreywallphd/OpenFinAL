// Mock for @xenova/transformers to avoid ES module import issues in Jest
module.exports = {
    pipeline: jest.fn(() => Promise.resolve({
        predict: jest.fn(() => Promise.resolve([])),
        generate: jest.fn(() => Promise.resolve({ generated_text: 'mock response' }))
    }))
};
