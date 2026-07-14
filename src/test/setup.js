import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX in module-level object literals
// (e.g. PhaseStamp stores JSX icons in a const outside any function)
if (typeof globalThis.React === 'undefined') {
  globalThis.React = React;
}
