/**
 * OverType - A lightweight markdown editor library with perfect WYSIWYG alignment
 * @version 1.0.0
 * @license MIT
 */

import { MarkdownParser } from './parser.js';
import { ShortcutsManager } from './shortcuts.js';
import { generateStyles } from './styles.js';
import { getTheme, mergeTheme, solar } from './themes.js';

/**
 * OverType Editor Class
 */
class OverType {
    // Static properties
    static instances = new WeakMap();
    static stylesInjected = false;
    static globalListenersInitialized = false;
    static instanceCount = 0;

    /**
     * Constructor - Always returns an array of instances
     * @param {string|Element|NodeList|Array} target - Target element(s)
     * @param {Object} options - Configuration options
     * @returns {Array} Array of OverType instances
     */
    constructor(target, options = {}) {
      // Convert target to array of elements
      let elements;
      
      if (typeof target === 'string') {
        elements = document.querySelectorAll(target);
        if (elements.length === 0) {
          throw new Error(`No elements found for selector: ${target}`);
        }
        elements = Array.from(elements);
      } else if (target instanceof Element) {
        elements = [target];
      } else if (target instanceof NodeList) {
        elements = Array.from(target);
      } else if (Array.isArray(target)) {
        elements = target;
      } else {
        throw new Error('Invalid target: must be selector string, Element, NodeList, or Array');
      }

      // Initialize all elements and return array
      const instances = elements.map(element => {
        // Check for existing instance
        if (element.overTypeInstance) {
          // Re-init existing instance
          element.overTypeInstance.reinit(options);
          return element.overTypeInstance;
        }

        // Create new instance
        const instance = Object.create(OverType.prototype);
        instance._init(element, options);
        element.overTypeInstance = instance;
        OverType.instances.set(element, instance);
        return instance;
      });

      return instances;
    }

    /**
     * Internal initialization
     * @private
     */
    _init(element, options = {}) {
      this.element = element;
      this.options = this._mergeOptions(options);
      this.instanceId = ++OverType.instanceCount;
      this.initialized = false;

      // Inject styles if needed
      OverType.injectStyles(this.options);

      // Initialize global listeners
      OverType.initGlobalListeners();

      // Check for existing OverType DOM structure
      const wrapper = element.querySelector('.overtype-wrapper');
      if (wrapper) {
        this._recoverFromDOM(wrapper);
      } else {
        this._buildFromScratch();
      }

      // Setup shortcuts manager
      this.shortcuts = new ShortcutsManager(this);

      // Mark as initialized
      this.initialized = true;

      // Call onChange if provided
      if (this.options.onChange) {
        this.options.onChange(this.getValue(), this);
      }
    }

    /**
     * Merge user options with defaults
     * @private
     */
    _mergeOptions(options) {
      const defaults = {
        // Typography
        fontSize: '14px',
        lineHeight: 1.6,
        fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
        padding: '16px',
        
        // Theme
        theme: 'solar',
        
        // Mobile styles
        mobile: {
          fontSize: '16px',  // Prevent zoom on iOS
          padding: '12px',
          lineHeight: 1.5
        },
        
        // Behavior
        autofocus: false,
        placeholder: 'Start typing...',
        value: '',
        
        // Callbacks
        onChange: null,
        onKeydown: null,
        
        // Features
        showActiveLineRaw: false
      };

      // Process theme
      let theme = options.theme || defaults.theme;
      if (typeof theme === 'string') {
        theme = getTheme(theme);
      }
      
      // Handle custom colors
      if (options.colors) {
        theme = mergeTheme(theme || solar, options.colors);
      }

      return {
        ...defaults,
        ...options,
        theme
      };
    }

    /**
     * Recover from existing DOM structure
     * @private
     */
    _recoverFromDOM(wrapper) {
      this.wrapper = wrapper;
      this.textarea = wrapper.querySelector('.overtype-input');
      this.preview = wrapper.querySelector('.overtype-preview');

      if (!this.textarea || !this.preview) {
        // Partial DOM - clear and rebuild
        wrapper.remove();
        this._buildFromScratch();
        return;
      }

      // Store reference on wrapper
      this.wrapper._instance = this;

      // Disable autofill, spellcheck, and extensions
      this._configureTextarea();

      // Apply any new options
      this._applyOptions();
    }

    /**
     * Build editor from scratch
     * @private
     */
    _buildFromScratch() {
      // Extract any existing content
      const content = this._extractContent();

      // Clear element
      this.element.innerHTML = '';

      // Create DOM structure
      this._createDOM();

      // Set initial content
      if (content || this.options.value) {
        this.setValue(content || this.options.value);
      }

      // Apply options
      this._applyOptions();
    }

    /**
     * Extract content from element
     * @private
     */
    _extractContent() {
      // Look for existing OverType textarea
      const textarea = this.element.querySelector('.overtype-input');
      if (textarea) return textarea.value;

      // Use element's text content as fallback
      return this.element.textContent || '';
    }

    /**
     * Create DOM structure
     * @private
     */
    _createDOM() {
      // Create wrapper
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'overtype-wrapper';
      this.wrapper._instance = this;

      // Create textarea
      this.textarea = document.createElement('textarea');
      this.textarea.className = 'overtype-input';
      this.textarea.placeholder = this.options.placeholder;
      this._configureTextarea();

      // Create preview div
      this.preview = document.createElement('div');
      this.preview.className = 'overtype-preview';
      this.preview.setAttribute('aria-hidden', 'true');

      // Assemble DOM
      this.wrapper.appendChild(this.textarea);
      this.wrapper.appendChild(this.preview);
      this.element.appendChild(this.wrapper);
    }

    /**
     * Configure textarea attributes
     * @private
     */
    _configureTextarea() {
      this.textarea.setAttribute('autocomplete', 'off');
      this.textarea.setAttribute('autocorrect', 'off');
      this.textarea.setAttribute('autocapitalize', 'off');
      this.textarea.setAttribute('spellcheck', 'false');
      this.textarea.setAttribute('data-gramm', 'false');
      this.textarea.setAttribute('data-gramm_editor', 'false');
      this.textarea.setAttribute('data-enable-grammarly', 'false');
    }

    /**
     * Apply options to the editor
     * @private
     */
    _applyOptions() {
      // Apply autofocus
      if (this.options.autofocus) {
        this.textarea.focus();
      }

      // Update preview with initial content
      this.updatePreview();
    }

    /**
     * Update preview with parsed markdown
     */
    updatePreview() {
      const text = this.textarea.value;
      const cursorPos = this.textarea.selectionStart;
      const activeLine = this._getCurrentLine(text, cursorPos);
      
      // Parse markdown
      const html = MarkdownParser.parse(text, activeLine, this.options.showActiveLineRaw);
      this.preview.innerHTML = html || '<span style="color: #808080;">Start typing...</span>';
      
      // Trigger onChange callback
      if (this.options.onChange && this.initialized) {
        this.options.onChange(text, this);
      }
    }

    /**
     * Get current line number from cursor position
     * @private
     */
    _getCurrentLine(text, cursorPos) {
      const lines = text.substring(0, cursorPos).split('\n');
      return lines.length - 1;
    }

    /**
     * Handle input events
     * @private
     */
    handleInput(event) {
      this.updatePreview();
    }

    /**
     * Handle keydown events
     * @private
     */
    handleKeydown(event) {
      // Let shortcuts manager handle it first
      const handled = this.shortcuts.handleKeydown(event);
      
      // Call user callback if provided
      if (!handled && this.options.onKeydown) {
        this.options.onKeydown(event, this);
      }
    }

    /**
     * Handle scroll events
     * @private
     */
    handleScroll(event) {
      // Sync preview scroll with textarea
      this.preview.scrollTop = this.textarea.scrollTop;
      this.preview.scrollLeft = this.textarea.scrollLeft;
    }

    /**
     * Get editor content
     * @returns {string} Current markdown content
     */
    getValue() {
      return this.textarea.value;
    }

    /**
     * Set editor content
     * @param {string} value - Markdown content to set
     */
    setValue(value) {
      this.textarea.value = value;
      this.updatePreview();
    }

    /**
     * Set theme
     * @param {string|Object} theme - Theme name or custom theme object
     */
    setTheme(theme) {
      this.options.theme = typeof theme === 'string' ? getTheme(theme) : theme;
      
      // Re-inject styles with new theme
      OverType.injectStyles(this.options, true);
      
      // Update preview
      this.updatePreview();
    }

    /**
     * Focus the editor
     */
    focus() {
      this.textarea.focus();
    }

    /**
     * Blur the editor
     */
    blur() {
      this.textarea.blur();
    }

    /**
     * Check if editor is initialized
     * @returns {boolean}
     */
    isInitialized() {
      return this.initialized;
    }

    /**
     * Re-initialize with new options
     * @param {Object} options - New options to apply
     */
    reinit(options = {}) {
      this.options = this._mergeOptions({ ...this.options, ...options });
      this._applyOptions();
      this.updatePreview();
    }

    /**
     * Destroy the editor instance
     */
    destroy() {
      // Remove instance reference
      this.element.overTypeInstance = null;
      OverType.instances.delete(this.element);

      // Cleanup shortcuts
      if (this.shortcuts) {
        this.shortcuts.destroy();
      }

      // Remove DOM if created by us
      if (this.wrapper) {
        const content = this.getValue();
        this.wrapper.remove();
        
        // Restore original content
        this.element.textContent = content;
      }

      this.initialized = false;
    }

    // ===== Static Methods =====

    /**
     * Initialize multiple editors (static convenience method)
     * @param {string|Element|NodeList|Array} target - Target element(s)
     * @param {Object} options - Configuration options
     * @returns {Array} Array of OverType instances
     */
    static init(target, options = {}) {
      return new OverType(target, options);
    }

    /**
     * Get instance from element
     * @param {Element} element - DOM element
     * @returns {OverType|null} OverType instance or null
     */
    static getInstance(element) {
      return element.overTypeInstance || OverType.instances.get(element) || null;
    }

    /**
     * Destroy all instances
     */
    static destroyAll() {
      const elements = document.querySelectorAll('[data-overtype-instance]');
      elements.forEach(element => {
        const instance = OverType.getInstance(element);
        if (instance) {
          instance.destroy();
        }
      });
    }

    /**
     * Inject styles into the document
     * @param {Object} options - Options with theme
     * @param {boolean} force - Force re-injection
     */
    static injectStyles(options = {}, force = false) {
      if (OverType.stylesInjected && !force) return;

      // Remove any existing OverType styles
      const existing = document.querySelector('style.overtype-styles');
      if (existing) {
        existing.remove();
      }

      // Generate and inject new styles
      const styles = generateStyles(options);
      const styleEl = document.createElement('style');
      styleEl.className = 'overtype-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);

      OverType.stylesInjected = true;
    }

    /**
     * Initialize global event listeners
     */
    static initGlobalListeners() {
      if (OverType.globalListenersInitialized) return;

      // Input event
      document.addEventListener('input', (e) => {
        if (e.target.classList.contains('overtype-input')) {
          const wrapper = e.target.closest('.overtype-wrapper');
          const instance = wrapper?._instance;
          if (instance) instance.handleInput(e);
        }
      });

      // Keydown event
      document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('overtype-input')) {
          const wrapper = e.target.closest('.overtype-wrapper');
          const instance = wrapper?._instance;
          if (instance) instance.handleKeydown(e);
        }
      });

      // Scroll event
      document.addEventListener('scroll', (e) => {
        if (e.target.classList.contains('overtype-input')) {
          const wrapper = e.target.closest('.overtype-wrapper');
          const instance = wrapper?._instance;
          if (instance) instance.handleScroll(e);
        }
      }, true);

      // Selection change event
      document.addEventListener('selectionchange', (e) => {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('overtype-input')) {
          const wrapper = activeElement.closest('.overtype-wrapper');
          const instance = wrapper?._instance;
          if (instance) {
            // Debounce updates
            clearTimeout(instance._selectionTimeout);
            instance._selectionTimeout = setTimeout(() => {
              instance.updatePreview();
            }, 50);
          }
        }
      });

      OverType.globalListenersInitialized = true;
    }
}

// Export classes for advanced usage
OverType.MarkdownParser = MarkdownParser;
OverType.ShortcutsManager = ShortcutsManager;

// Export theme utilities
OverType.themes = { solar, cave: getTheme('cave') };
OverType.getTheme = getTheme;
OverType.mergeTheme = mergeTheme;

// For IIFE builds, esbuild needs the class as the default export
export default OverType;
// Also export as named for ESM compatibility
export { OverType };