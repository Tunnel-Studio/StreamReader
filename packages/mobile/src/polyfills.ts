// Core Polyfills for React Native
import 'text-encoding-polyfill';
import { Buffer } from 'buffer';

// Add buffer to global
global.Buffer = Buffer;

// Add process.env if not exists
if (typeof process === 'undefined') {
  (global as any).process = { env: {} };
}

// Add basic DOM-like APIs needed by epubjs
if (typeof DOMParser === 'undefined') {
  // EPub.js may need this, but we'll handle it gracefully in our parser
  (global as any).DOMParser = class DOMParser {
    parseFromString(str: string, type: string) {
      console.warn('DOMParser.parseFromString called but not fully implemented in React Native');
      return {
        documentElement: {
          querySelector: () => null,
          querySelectorAll: () => [],
        },
      };
    }
  };
}

// XMLHttpRequest might be needed by epubjs for loading resources
if (typeof XMLHttpRequest === 'undefined') {
  (global as any).XMLHttpRequest = class XMLHttpRequest {
    open() {}
    send() {}
    addEventListener() {}
  };
}
