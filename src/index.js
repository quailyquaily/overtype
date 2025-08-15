// Entry point for browser builds
import OverType from './overtype.js';

// Make OverType available globally for browser environments
if (typeof window !== 'undefined') {
  window.OverType = OverType;
}

export default OverType;