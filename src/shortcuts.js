/**
 * Keyboard shortcuts handler for OverType editor
 */

/**
 * ShortcutsManager - Handles keyboard shortcuts for the editor
 */
export class ShortcutsManager {
  constructor(editor) {
    this.editor = editor;
    this.textarea = editor.textarea;
    this.shortcuts = new Map();
    
    // Register default shortcuts
    this.registerDefaults();
  }

  /**
   * Register default keyboard shortcuts
   */
  registerDefaults() {
    // Bold - Cmd/Ctrl+B
    this.register('b', false, () => {
      this.wrapSelection('**');
    });

    // Italic - Cmd/Ctrl+I
    this.register('i', false, () => {
      this.wrapSelection('*');
    });

    // Bullet list - Cmd/Ctrl+Shift+8
    this.register('8', true, () => {
      this.toggleList('bullet');
    });

    // Numbered list - Cmd/Ctrl+Shift+7
    this.register('7', true, () => {
      this.toggleList('number');
    });

    // Code - Cmd/Ctrl+K
    this.register('k', false, () => {
      this.wrapSelection('`');
    });

    // Link - Cmd/Ctrl+Shift+K
    this.register('k', true, () => {
      this.insertLink();
    });
  }

  /**
   * Register a custom keyboard shortcut
   * @param {string} key - The key to bind
   * @param {boolean} shift - Whether shift is required
   * @param {Function} handler - The handler function
   */
  register(key, shift, handler) {
    const shortcutKey = `${shift ? 'shift+' : ''}${key.toLowerCase()}`;
    this.shortcuts.set(shortcutKey, handler);
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {boolean} Whether the event was handled
   */
  handleKeydown(event) {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    if (!modKey) return false;

    const shortcutKey = `${event.shiftKey ? 'shift+' : ''}${event.key.toLowerCase()}`;
    const handler = this.shortcuts.get(shortcutKey);

    if (handler) {
      event.preventDefault();
      handler.call(this);
      return true;
    }

    return false;
  }

  /**
   * Wrap selected text with markers
   * @param {string} before - Marker to add before
   * @param {string} after - Marker to add after (defaults to before)
   */
  wrapSelection(before, after = before) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;
    const selectedText = value.slice(start, end);

    // Check if already wrapped and unwrap if so
    if (selectedText.startsWith(before) && selectedText.endsWith(after) && 
        selectedText.length >= before.length + after.length) {
      const inner = selectedText.slice(before.length, selectedText.length - after.length);
      this.textarea.setRangeText(inner, start, end, 'end');
      this.editor.updatePreview();
      return;
    }

    // Otherwise wrap the selection
    this.textarea.setRangeText(before + selectedText + after, start, end, 'end');
    this.editor.updatePreview();
  }

  /**
   * Toggle list formatting
   * @param {string} type - 'bullet' or 'number'
   */
  toggleList(type) {
    const value = this.textarea.value;
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;

    // Find line boundaries
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end);
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split('\n');

    let transformed;
    if (type === 'bullet') {
      transformed = lines.map(line => {
        // Toggle bullet: remove if present, add if not
        if (/^\s*[-*]\s+/.test(line)) {
          return line.replace(/^(\s*)[-*]\s+/, '$1');
        }
        return line.replace(/^(\s*)/, '$1- ');
      }).join('\n');
    } else if (type === 'number') {
      transformed = lines.map((line, i) => {
        // Toggle numbering: remove if present, add if not
        if (/^\s*\d+\.\s+/.test(line)) {
          return line.replace(/^(\s*)\d+\.\s+/, '$1');
        }
        return line.replace(/^(\s*)/, `$1${i + 1}. `);
      }).join('\n');
    }

    this.textarea.setRangeText(transformed, lineStart, lineEnd, 'end');
    this.editor.updatePreview();
  }

  /**
   * Insert a link at cursor position
   */
  insertLink() {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const selectedText = this.textarea.value.slice(start, end);
    
    // If text is selected, use it as link text
    const linkText = selectedText || 'link text';
    const linkMarkdown = `[${linkText}](url)`;
    
    this.textarea.setRangeText(linkMarkdown, start, end, 'end');
    
    // Position cursor inside the URL part
    if (!selectedText) {
      this.textarea.setSelectionRange(start + 1, start + 1 + linkText.length);
    } else {
      const urlStart = start + linkMarkdown.indexOf('(url)') + 1;
      this.textarea.setSelectionRange(urlStart, urlStart + 3);
    }
    
    this.editor.updatePreview();
    this.textarea.focus();
  }

  /**
   * Insert header at the beginning of current line
   * @param {number} level - Header level (1-3)
   */
  insertHeader(level) {
    const value = this.textarea.value;
    const start = this.textarea.selectionStart;
    
    // Find line boundaries
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start) === -1 ? value.length : value.indexOf('\n', start);
    const line = value.slice(lineStart, lineEnd);
    
    // Check if line already has header
    const headerMatch = line.match(/^(#{1,3})\s/);
    if (headerMatch) {
      // Remove or change header level
      if (headerMatch[1].length === level) {
        // Remove header
        const newLine = line.replace(/^#{1,3}\s/, '');
        this.textarea.setRangeText(newLine, lineStart, lineEnd, 'end');
      } else {
        // Change header level
        const newLine = line.replace(/^#{1,3}/, '#'.repeat(level));
        this.textarea.setRangeText(newLine, lineStart, lineEnd, 'end');
      }
    } else {
      // Add header
      const newLine = '#'.repeat(level) + ' ' + line;
      this.textarea.setRangeText(newLine, lineStart, lineEnd, 'end');
    }
    
    this.editor.updatePreview();
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    this.shortcuts.clear();
  }
}