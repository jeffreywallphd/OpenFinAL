// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

// Jest setup file for testing configuration
const { TextEncoder, TextDecoder } = require('util');

// Setup global TextEncoder and TextDecoder for tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Setup URL polyfill for React Router
const { URL, URLSearchParams } = require('url');
global.URL = URL;
global.URLSearchParams = URLSearchParams;

// Setup testing library matchers
require('@testing-library/jest-dom');
