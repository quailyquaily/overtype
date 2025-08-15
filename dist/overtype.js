/**
 * OverType v1.0.0
 * A lightweight markdown editor library with perfect WYSIWYG alignment
 * @license MIT
 * @author Demo User
 * https://github.com/demo/overtype
 */
var OverType = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/overtype.js
  var overtype_exports = {};
  __export(overtype_exports, {
    OverType: () => OverType,
    default: () => overtype_default
  });

  // src/parser.js
  var MarkdownParser = class {
    /**
     * Escape HTML special characters
     * @param {string} text - Raw text to escape
     * @returns {string} Escaped HTML-safe text
     */
    static escapeHtml(text) {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    }
    /**
     * Preserve leading spaces as non-breaking spaces
     * @param {string} html - HTML string
     * @param {string} originalLine - Original line with spaces
     * @returns {string} HTML with preserved indentation
     */
    static preserveIndentation(html, originalLine) {
      const leadingSpaces = originalLine.match(/^(\s*)/)[1];
      const indentation = leadingSpaces.replace(/ /g, "&nbsp;");
      return html.replace(/^\s*/, indentation);
    }
    /**
     * Parse headers (h1-h3 only)
     * @param {string} html - HTML line to parse
     * @returns {string} Parsed HTML with header styling
     */
    static parseHeader(html) {
      return html.replace(/^(#{1,3})\s(.+)$/, (match, hashes, content) => {
        const level = hashes.length;
        const levelClasses = ["h1", "h2", "h3"];
        return `<span class="header ${levelClasses[level - 1]}"><span class="syntax-marker">${hashes}</span> ${content}</span>`;
      });
    }
    /**
     * Parse horizontal rules
     * @param {string} html - HTML line to parse
     * @returns {string|null} Parsed horizontal rule or null
     */
    static parseHorizontalRule(html) {
      if (html.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        return `<div><span class="hr-marker">${html}</span></div>`;
      }
      return null;
    }
    /**
     * Parse blockquotes
     * @param {string} html - HTML line to parse
     * @returns {string} Parsed blockquote
     */
    static parseBlockquote(html) {
      return html.replace(/^&gt; (.+)$/, (match, content) => {
        return `<span class="blockquote"><span class="syntax-marker">&gt;</span> ${content}</span>`;
      });
    }
    /**
     * Parse bullet lists
     * @param {string} html - HTML line to parse
     * @returns {string} Parsed bullet list item
     */
    static parseBulletList(html) {
      return html.replace(/^((?:&nbsp;)*)([-*])\s(.+)$/, (match, indent, marker, content) => {
        return `${indent}<span class="syntax-marker">${marker}</span> ${content}`;
      });
    }
    /**
     * Parse numbered lists
     * @param {string} html - HTML line to parse
     * @returns {string} Parsed numbered list item
     */
    static parseNumberedList(html) {
      return html.replace(/^((?:&nbsp;)*)(\d+\.)\s(.+)$/, (match, indent, marker, content) => {
        return `${indent}<span class="syntax-marker">${marker}</span> ${content}`;
      });
    }
    /**
     * Parse code blocks (markers only)
     * @param {string} html - HTML line to parse
     * @returns {string|null} Parsed code fence or null
     */
    static parseCodeBlock(html) {
      if (html.startsWith("```")) {
        return `<div><span class="code-fence">${html}</span></div>`;
      }
      return null;
    }
    /**
     * Parse bold text
     * @param {string} html - HTML with potential bold markdown
     * @returns {string} HTML with bold styling
     */
    static parseBold(html) {
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong><span class="syntax-marker">**</span>$1<span class="syntax-marker">**</span></strong>');
      html = html.replace(/__(.+?)__/g, '<strong><span class="syntax-marker">__</span>$1<span class="syntax-marker">__</span></strong>');
      return html;
    }
    /**
     * Parse italic text
     * Note: Uses lookbehind assertions - requires modern browsers
     * @param {string} html - HTML with potential italic markdown
     * @returns {string} HTML with italic styling
     */
    static parseItalic(html) {
      html = html.replace(new RegExp("(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)", "g"), '<em><span class="syntax-marker">*</span>$1<span class="syntax-marker">*</span></em>');
      html = html.replace(new RegExp("(?<!_)_(?!_)(.+?)(?<!_)_(?!_)", "g"), '<em><span class="syntax-marker">_</span>$1<span class="syntax-marker">_</span></em>');
      return html;
    }
    /**
     * Parse inline code
     * @param {string} html - HTML with potential code markdown
     * @returns {string} HTML with code styling
     */
    static parseInlineCode(html) {
      return html.replace(/`(.+?)`/g, '<code><span class="syntax-marker">`</span>$1<span class="syntax-marker">`</span></code>');
    }
    /**
     * Parse links
     * @param {string} html - HTML with potential link markdown
     * @returns {string} HTML with link styling
     */
    static parseLinks(html) {
      return html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2"><span class="syntax-marker">[</span>$1<span class="syntax-marker">](</span><span class="syntax-marker">$2</span><span class="syntax-marker">)</span></a>');
    }
    /**
     * Parse all inline elements in correct order
     * @param {string} text - Text with potential inline markdown
     * @returns {string} HTML with all inline styling
     */
    static parseInlineElements(text) {
      let html = text;
      html = this.parseInlineCode(html);
      html = this.parseLinks(html);
      html = this.parseBold(html);
      html = this.parseItalic(html);
      return html;
    }
    /**
     * Parse a single line of markdown
     * @param {string} line - Raw markdown line
     * @returns {string} Parsed HTML line
     */
    static parseLine(line) {
      let html = this.escapeHtml(line);
      html = this.preserveIndentation(html, line);
      const horizontalRule = this.parseHorizontalRule(html);
      if (horizontalRule)
        return horizontalRule;
      const codeBlock = this.parseCodeBlock(html);
      if (codeBlock)
        return codeBlock;
      html = this.parseHeader(html);
      html = this.parseBlockquote(html);
      html = this.parseBulletList(html);
      html = this.parseNumberedList(html);
      html = this.parseInlineElements(html);
      if (html.trim() === "") {
        return "<div>&nbsp;</div>";
      }
      return `<div>${html}</div>`;
    }
    /**
     * Parse full markdown text
     * @param {string} text - Full markdown text
     * @param {number} activeLine - Currently active line index (optional)
     * @param {boolean} showActiveLineRaw - Show raw markdown on active line
     * @returns {string} Parsed HTML
     */
    static parse(text, activeLine = -1, showActiveLineRaw = false) {
      const lines = text.split("\n");
      const parsedLines = lines.map((line, index) => {
        if (showActiveLineRaw && index === activeLine) {
          const content = this.escapeHtml(line) || "&nbsp;";
          return `<div class="raw-line">${content}</div>`;
        }
        return this.parseLine(line);
      });
      return parsedLines.join("");
    }
  };

  // src/shortcuts.js
  var ShortcutsManager = class {
    constructor(editor) {
      this.editor = editor;
      this.textarea = editor.textarea;
      this.shortcuts = /* @__PURE__ */ new Map();
      this.registerDefaults();
    }
    /**
     * Register default keyboard shortcuts
     */
    registerDefaults() {
      this.register("b", false, () => {
        this.wrapSelection("**");
      });
      this.register("i", false, () => {
        this.wrapSelection("*");
      });
      this.register("8", true, () => {
        this.toggleList("bullet");
      });
      this.register("7", true, () => {
        this.toggleList("number");
      });
      this.register("k", false, () => {
        this.wrapSelection("`");
      });
      this.register("k", true, () => {
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
      const shortcutKey = `${shift ? "shift+" : ""}${key.toLowerCase()}`;
      this.shortcuts.set(shortcutKey, handler);
    }
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keyboard event
     * @returns {boolean} Whether the event was handled
     */
    handleKeydown(event) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      if (!modKey)
        return false;
      const shortcutKey = `${event.shiftKey ? "shift+" : ""}${event.key.toLowerCase()}`;
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
      if (selectedText.startsWith(before) && selectedText.endsWith(after) && selectedText.length >= before.length + after.length) {
        const inner = selectedText.slice(before.length, selectedText.length - after.length);
        this.textarea.setRangeText(inner, start, end, "end");
        this.editor.updatePreview();
        return;
      }
      this.textarea.setRangeText(before + selectedText + after, start, end, "end");
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
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end);
      const block = value.slice(lineStart, lineEnd);
      const lines = block.split("\n");
      let transformed;
      if (type === "bullet") {
        transformed = lines.map((line) => {
          if (/^\s*[-*]\s+/.test(line)) {
            return line.replace(/^(\s*)[-*]\s+/, "$1");
          }
          return line.replace(/^(\s*)/, "$1- ");
        }).join("\n");
      } else if (type === "number") {
        transformed = lines.map((line, i) => {
          if (/^\s*\d+\.\s+/.test(line)) {
            return line.replace(/^(\s*)\d+\.\s+/, "$1");
          }
          return line.replace(/^(\s*)/, `$1${i + 1}. `);
        }).join("\n");
      }
      this.textarea.setRangeText(transformed, lineStart, lineEnd, "end");
      this.editor.updatePreview();
    }
    /**
     * Insert a link at cursor position
     */
    insertLink() {
      const start = this.textarea.selectionStart;
      const end = this.textarea.selectionEnd;
      const selectedText = this.textarea.value.slice(start, end);
      const linkText = selectedText || "link text";
      const linkMarkdown = `[${linkText}](url)`;
      this.textarea.setRangeText(linkMarkdown, start, end, "end");
      if (!selectedText) {
        this.textarea.setSelectionRange(start + 1, start + 1 + linkText.length);
      } else {
        const urlStart = start + linkMarkdown.indexOf("(url)") + 1;
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
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", start) === -1 ? value.length : value.indexOf("\n", start);
      const line = value.slice(lineStart, lineEnd);
      const headerMatch = line.match(/^(#{1,3})\s/);
      if (headerMatch) {
        if (headerMatch[1].length === level) {
          const newLine = line.replace(/^#{1,3}\s/, "");
          this.textarea.setRangeText(newLine, lineStart, lineEnd, "end");
        } else {
          const newLine = line.replace(/^#{1,3}/, "#".repeat(level));
          this.textarea.setRangeText(newLine, lineStart, lineEnd, "end");
        }
      } else {
        const newLine = "#".repeat(level) + " " + line;
        this.textarea.setRangeText(newLine, lineStart, lineEnd, "end");
      }
      this.editor.updatePreview();
    }
    /**
     * Cleanup event listeners
     */
    destroy() {
      this.shortcuts.clear();
    }
  };

  // src/themes.js
  var solar = {
    name: "solar",
    colors: {
      bgPrimary: "#faf0ca",
      // Lemon Chiffon - main background
      bgSecondary: "#ffffff",
      // White - editor background
      text: "#0d3b66",
      // Yale Blue - main text
      h1: "#f95738",
      // Tomato - h1 headers
      h2: "#ee964b",
      // Sandy Brown - h2 headers  
      h3: "#3d8a51",
      // Forest green - h3 headers
      strong: "#ee964b",
      // Sandy Brown - bold text
      em: "#f95738",
      // Tomato - italic text
      link: "#0d3b66",
      // Yale Blue - links
      code: "#0d3b66",
      // Yale Blue - inline code
      codeBg: "rgba(244, 211, 94, 0.2)",
      // Naples Yellow with transparency
      blockquote: "#5a7a9b",
      // Muted blue - blockquotes
      hr: "#5a7a9b",
      // Muted blue - horizontal rules
      syntaxMarker: "rgba(13, 59, 102, 0.52)",
      // Yale Blue with transparency
      cursor: "#f95738",
      // Tomato - cursor
      selection: "rgba(244, 211, 94, 0.4)",
      // Naples Yellow with transparency
      listMarker: "#ee964b"
      // Sandy Brown - list markers
    }
  };
  var cave = {
    name: "cave",
    colors: {
      bgPrimary: "#141E26",
      // Deep ocean - main background
      bgSecondary: "#1D2D3E",
      // Darker charcoal - editor background
      text: "#c5dde8",
      // Light blue-gray - main text
      h1: "#d4a5ff",
      // Rich lavender - h1 headers
      h2: "#f6ae2d",
      // Hunyadi Yellow - h2 headers
      h3: "#9fcfec",
      // Brighter blue - h3 headers
      strong: "#f6ae2d",
      // Hunyadi Yellow - bold text
      em: "#9fcfec",
      // Brighter blue - italic text
      link: "#9fcfec",
      // Brighter blue - links
      code: "#c5dde8",
      // Light blue-gray - inline code
      codeBg: "#1a232b",
      // Very dark blue - code background
      blockquote: "#9fcfec",
      // Brighter blue - same as italic
      hr: "#c5dde8",
      // Light blue-gray - horizontal rules
      syntaxMarker: "rgba(159, 207, 236, 0.73)",
      // Brighter blue semi-transparent
      cursor: "#f26419",
      // Orange Pantone - cursor
      selection: "rgba(51, 101, 138, 0.4)",
      // Lapis Lazuli with transparency
      listMarker: "#f6ae2d"
      // Hunyadi Yellow - list markers
    }
  };
  var themes = {
    solar,
    cave,
    // Aliases for backward compatibility
    light: solar,
    dark: cave
  };
  function getTheme(theme) {
    if (typeof theme === "string") {
      const themeObj = themes[theme] || themes.solar;
      return { ...themeObj, name: theme };
    }
    return theme;
  }
  function themeToCSSVars(colors) {
    const vars = [];
    for (const [key, value] of Object.entries(colors)) {
      const varName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      vars.push(`--${varName}: ${value};`);
    }
    return vars.join("\n");
  }
  function mergeTheme(baseTheme, customColors = {}) {
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...customColors
      }
    };
  }

  // src/styles.js
  function generateStyles(options = {}) {
    const {
      fontSize = "14px",
      lineHeight = 1.6,
      fontFamily = "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
      padding = "20px",
      theme = null,
      mobile = {}
    } = options;
    const mobileStyles = Object.keys(mobile).length > 0 ? `
    @media (max-width: 640px) {
      .overtype-wrapper .overtype-input,
      .overtype-wrapper .overtype-preview {
        ${Object.entries(mobile).map(([prop, val]) => {
      const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssProp}: ${val} !important;`;
    }).join("\n        ")}
      }
    }
  ` : "";
    const themeVars = theme && theme.colors ? themeToCSSVars(theme.colors) : "";
    return `
    /* OverType Editor Styles */
    .overtype-wrapper {
      position: relative !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      background: var(--bg-secondary, #ffffff) !important;
      ${themeVars ? `
      /* Theme Variables */
      ${themeVars}` : ""}
    }

    /* Critical alignment styles - must be identical for both layers */
    .overtype-wrapper .overtype-input,
    .overtype-wrapper .overtype-preview {
      /* Positioning - must be identical */
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      
      /* Font properties - any difference breaks alignment */
      font-family: ${fontFamily} !important;
      font-size: ${fontSize} !important;
      line-height: ${lineHeight} !important;
      font-weight: normal !important;
      font-style: normal !important;
      font-variant: normal !important;
      font-stretch: normal !important;
      font-kerning: none !important;
      font-feature-settings: normal !important;
      
      /* Box model - must match exactly */
      padding: ${padding} !important;
      margin: 0 !important;
      border: none !important;
      outline: none !important;
      box-sizing: border-box !important;
      
      /* Text layout - critical for character positioning */
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
      tab-size: 2 !important;
      -moz-tab-size: 2 !important;
      text-align: left !important;
      text-indent: 0 !important;
      letter-spacing: normal !important;
      word-spacing: normal !important;
      
      /* Text rendering */
      text-transform: none !important;
      text-rendering: auto !important;
      -webkit-font-smoothing: auto !important;
      -webkit-text-size-adjust: 100% !important;
      
      /* Direction and writing */
      direction: ltr !important;
      writing-mode: horizontal-tb !important;
      unicode-bidi: normal !important;
      text-orientation: mixed !important;
      
      /* Visual effects that could shift perception */
      text-shadow: none !important;
      filter: none !important;
      transform: none !important;
      zoom: 1 !important;
      
      /* Vertical alignment */
      vertical-align: baseline !important;
      
      /* Size constraints */
      min-width: 0 !important;
      min-height: 0 !important;
      max-width: none !important;
      max-height: none !important;
      
      /* Overflow */
      overflow-y: auto !important;
      overflow-x: auto !important;
      scrollbar-width: auto !important;
      scrollbar-gutter: auto !important;
      
      /* Animation/transition - disabled to prevent movement */
      animation: none !important;
      transition: none !important;
    }

    /* Input layer styles */
    .overtype-wrapper .overtype-input {
      /* Layer positioning */
      z-index: 1 !important;
      
      /* Text visibility */
      color: transparent !important;
      caret-color: var(--cursor, #f95738) !important;
      background-color: transparent !important;
      
      /* Textarea-specific */
      resize: none !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      
      /* Prevent mobile zoom on focus */
      touch-action: manipulation !important;
      
      /* Disable autofill and spellcheck */
      autocomplete: off !important;
      autocorrect: off !important;
      autocapitalize: off !important;
      spellcheck: false !important;
    }

    .overtype-wrapper .overtype-input::selection {
      background-color: var(--selection, rgba(244, 211, 94, 0.4));
    }

    /* Preview layer styles */
    .overtype-wrapper .overtype-preview {
      /* Layer positioning */
      z-index: 0 !important;
      pointer-events: none !important;
      color: var(--text, #0d3b66) !important;
      background-color: transparent !important;
      
      /* Prevent text selection */
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }

    /* Defensive styles for preview child divs */
    .overtype-wrapper .overtype-preview div {
      /* Reset any inherited styles */
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      text-align: left !important;
      text-indent: 0 !important;
      display: block !important;
      position: static !important;
      transform: none !important;
      min-height: 0 !important;
      max-height: none !important;
      line-height: inherit !important;
      font-size: inherit !important;
      font-family: inherit !important;
    }

    /* Markdown element styling - NO SIZE CHANGES */
    .overtype-wrapper .overtype-preview .header {
      font-weight: bold !important;
    }

    /* Header colors */
    .overtype-wrapper .overtype-preview .h1 { 
      color: var(--h1, #f95738) !important; 
    }
    .overtype-wrapper .overtype-preview .h2 { 
      color: var(--h2, #ee964b) !important; 
    }
    .overtype-wrapper .overtype-preview .h3 { 
      color: var(--h3, #3d8a51) !important; 
    }

    /* Bold text */
    .overtype-wrapper .overtype-preview strong {
      color: var(--strong, #ee964b) !important;
      font-weight: bold !important;
    }

    /* Italic text */
    .overtype-wrapper .overtype-preview em {
      color: var(--em, #f95738) !important;
      text-decoration-color: var(--em, #f95738) !important;
      text-decoration-thickness: 1px !important;
      font-style: italic !important;
    }

    /* Inline code */
    .overtype-wrapper .overtype-preview code {
      background: var(--code-bg, rgba(244, 211, 94, 0.2)) !important;
      color: var(--code, #0d3b66) !important;
      padding: 0 !important;
      border-radius: 2px !important;
      font-family: inherit !important;
      font-weight: normal !important;
    }

    /* Code blocks */
    .overtype-wrapper .overtype-preview pre {
      background: #1e1e1e !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 4px !important;
      overflow-x: auto !important;
    }

    .overtype-wrapper .overtype-preview pre code {
      background: none !important;
    }

    /* Blockquotes */
    .overtype-wrapper .overtype-preview .blockquote {
      color: var(--blockquote, #5a7a9b) !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
    }

    /* Links */
    .overtype-wrapper .overtype-preview a {
      color: var(--link, #0d3b66) !important;
      text-decoration: underline !important;
      font-weight: normal !important;
    }

    .overtype-wrapper .overtype-preview a:hover {
      text-decoration: underline !important;
      color: var(--link, #0d3b66) !important;
    }

    /* Lists - no list styling */
    .overtype-wrapper .overtype-preview ul,
    .overtype-wrapper .overtype-preview ol {
      list-style: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .overtype-wrapper .overtype-preview li {
      margin: 0 !important;
      padding: 0 !important;
      list-style: none !important;
    }

    /* Horizontal rules */
    .overtype-wrapper .overtype-preview hr {
      border: none !important;
      color: var(--hr, #5a7a9b) !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .overtype-wrapper .overtype-preview .hr-marker {
      color: var(--hr, #5a7a9b) !important;
      opacity: 0.6 !important;
    }

    /* Code fence markers */
    .overtype-wrapper .overtype-preview .code-fence {
      color: var(--code, #0d3b66) !important;
      background: var(--code-bg, rgba(244, 211, 94, 0.2)) !important;
    }

    /* Raw markdown line */
    .overtype-wrapper .overtype-preview .raw-line {
      color: var(--raw-line, #5a7a9b) !important;
      font-style: normal !important;
      font-weight: normal !important;
    }

    /* Syntax markers */
    .overtype-wrapper .overtype-preview .syntax-marker {
      color: var(--syntax-marker, rgba(13, 59, 102, 0.52)) !important;
      opacity: 0.7 !important;
    }

    /* List markers */
    .overtype-wrapper .overtype-preview .list-marker {
      color: var(--list-marker, #ee964b) !important;
    }

    /* Stats bar */
    .overtype-wrapper.with-stats {
      padding-bottom: 40px !important;
    }
    
    .overtype-wrapper .overtype-stats {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 40px !important;
      padding: 0 20px !important;
      background: #f8f9fa !important;
      border-top: 1px solid #e0e0e0 !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 0.85rem !important;
      color: #666 !important;
      z-index: 2 !important;
    }
    
    /* Dark theme stats bar */
    .overtype-wrapper[data-theme="cave"] .overtype-stats {
      background: var(--bg-secondary, #1D2D3E) !important;
      border-top: 1px solid rgba(197, 221, 232, 0.1) !important;
      color: var(--text, #c5dde8) !important;
    }
    
    .overtype-wrapper .overtype-stats .overtype-stat {
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
      white-space: nowrap !important;
    }
    
    .overtype-wrapper .overtype-stats .live-dot {
      width: 8px !important;
      height: 8px !important;
      background: #4caf50 !important;
      border-radius: 50% !important;
      animation: pulse 2s infinite !important;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.2); }
    }
    
    /* Adjust textarea and preview for stats bar */
    .overtype-wrapper.with-stats .overtype-input,
    .overtype-wrapper.with-stats .overtype-preview {
      height: calc(100% - 40px) !important;
    }

    ${mobileStyles}
  `;
  }

  // src/overtype.js
  var _OverType = class _OverType {
    /**
     * Constructor - Always returns an array of instances
     * @param {string|Element|NodeList|Array} target - Target element(s)
     * @param {Object} options - Configuration options
     * @returns {Array} Array of OverType instances
     */
    constructor(target, options = {}) {
      let elements;
      if (typeof target === "string") {
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
        throw new Error("Invalid target: must be selector string, Element, NodeList, or Array");
      }
      const instances = elements.map((element) => {
        if (element.overTypeInstance) {
          element.overTypeInstance.reinit(options);
          return element.overTypeInstance;
        }
        const instance = Object.create(_OverType.prototype);
        instance._init(element, options);
        element.overTypeInstance = instance;
        _OverType.instances.set(element, instance);
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
      this.instanceId = ++_OverType.instanceCount;
      this.initialized = false;
      _OverType.injectStyles();
      _OverType.initGlobalListeners();
      const wrapper = element.querySelector(".overtype-wrapper");
      if (wrapper) {
        this._recoverFromDOM(wrapper);
      } else {
        this._buildFromScratch();
      }
      this.shortcuts = new ShortcutsManager(this);
      this.initialized = true;
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
        fontSize: "14px",
        lineHeight: 1.6,
        fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
        padding: "16px",
        // Mobile styles
        mobile: {
          fontSize: "16px",
          // Prevent zoom on iOS
          padding: "12px",
          lineHeight: 1.5
        },
        // Behavior
        autofocus: false,
        placeholder: "Start typing...",
        value: "",
        // Callbacks
        onChange: null,
        onKeydown: null,
        // Features
        showActiveLineRaw: false,
        showStats: false,
        statsFormatter: null
      };
      const { theme, colors, ...cleanOptions } = options;
      return {
        ...defaults,
        ...cleanOptions
      };
    }
    /**
     * Recover from existing DOM structure
     * @private
     */
    _recoverFromDOM(wrapper) {
      this.wrapper = wrapper;
      this.textarea = wrapper.querySelector(".overtype-input");
      this.preview = wrapper.querySelector(".overtype-preview");
      if (!this.textarea || !this.preview) {
        wrapper.remove();
        this._buildFromScratch();
        return;
      }
      this.wrapper._instance = this;
      this._configureTextarea();
      this._applyOptions();
    }
    /**
     * Build editor from scratch
     * @private
     */
    _buildFromScratch() {
      const content = this._extractContent();
      this.element.innerHTML = "";
      this._createDOM();
      if (content || this.options.value) {
        this.setValue(content || this.options.value);
      }
      this._applyOptions();
    }
    /**
     * Extract content from element
     * @private
     */
    _extractContent() {
      const textarea = this.element.querySelector(".overtype-input");
      if (textarea)
        return textarea.value;
      return this.element.textContent || "";
    }
    /**
     * Create DOM structure
     * @private
     */
    _createDOM() {
      this.wrapper = document.createElement("div");
      this.wrapper.className = "overtype-wrapper";
      const currentTheme = _OverType.currentTheme || solar;
      const themeName = typeof currentTheme === "string" ? currentTheme : currentTheme.name;
      if (themeName) {
        this.wrapper.setAttribute("data-theme", themeName);
      }
      if (this.options.showStats) {
        this.wrapper.classList.add("with-stats");
      }
      this.wrapper._instance = this;
      this.textarea = document.createElement("textarea");
      this.textarea.className = "overtype-input";
      this.textarea.placeholder = this.options.placeholder;
      this._configureTextarea();
      this.preview = document.createElement("div");
      this.preview.className = "overtype-preview";
      this.preview.setAttribute("aria-hidden", "true");
      this.wrapper.appendChild(this.textarea);
      this.wrapper.appendChild(this.preview);
      if (this.options.showStats) {
        this.statsBar = document.createElement("div");
        this.statsBar.className = "overtype-stats";
        this.wrapper.appendChild(this.statsBar);
        this._updateStats();
      }
      this.element.appendChild(this.wrapper);
    }
    /**
     * Configure textarea attributes
     * @private
     */
    _configureTextarea() {
      this.textarea.setAttribute("autocomplete", "off");
      this.textarea.setAttribute("autocorrect", "off");
      this.textarea.setAttribute("autocapitalize", "off");
      this.textarea.setAttribute("spellcheck", "false");
      this.textarea.setAttribute("data-gramm", "false");
      this.textarea.setAttribute("data-gramm_editor", "false");
      this.textarea.setAttribute("data-enable-grammarly", "false");
    }
    /**
     * Apply options to the editor
     * @private
     */
    _applyOptions() {
      if (this.options.autofocus) {
        this.textarea.focus();
      }
      this.updatePreview();
    }
    /**
     * Update preview with parsed markdown
     */
    updatePreview() {
      const text = this.textarea.value;
      const cursorPos = this.textarea.selectionStart;
      const activeLine = this._getCurrentLine(text, cursorPos);
      const html = MarkdownParser.parse(text, activeLine, this.options.showActiveLineRaw);
      this.preview.innerHTML = html || '<span style="color: #808080;">Start typing...</span>';
      this._applyCodeBlockBackgrounds();
      if (this.options.showStats && this.statsBar) {
        this._updateStats();
      }
      if (this.options.onChange && this.initialized) {
        this.options.onChange(text, this);
      }
    }
    /**
     * Apply background styling to code blocks
     * @private
     */
    _applyCodeBlockBackgrounds() {
      const codeFences = this.preview.querySelectorAll(".code-fence");
      for (let i = 0; i < codeFences.length - 1; i += 2) {
        const openFence = codeFences[i];
        const closeFence = codeFences[i + 1];
        const openParent = openFence.parentElement;
        const closeParent = closeFence.parentElement;
        if (!openParent || !closeParent)
          continue;
        openFence.style.display = "block";
        closeFence.style.display = "block";
        let currentDiv = openParent;
        while (currentDiv) {
          currentDiv.style.background = "var(--code-bg, rgba(244, 211, 94, 0.2))";
          if (currentDiv === closeParent)
            break;
          currentDiv = currentDiv.nextElementSibling;
          if (!currentDiv || currentDiv.tagName !== "DIV")
            break;
        }
      }
    }
    /**
     * Get current line number from cursor position
     * @private
     */
    _getCurrentLine(text, cursorPos) {
      const lines = text.substring(0, cursorPos).split("\n");
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
      const handled = this.shortcuts.handleKeydown(event);
      if (!handled && this.options.onKeydown) {
        this.options.onKeydown(event, this);
      }
    }
    /**
     * Handle scroll events
     * @private
     */
    handleScroll(event) {
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
     * Update stats bar
     * @private
     */
    _updateStats() {
      if (!this.statsBar)
        return;
      const value = this.textarea.value;
      const lines = value.split("\n");
      const chars = value.length;
      const words = value.split(/\s+/).filter((w) => w.length > 0).length;
      const selectionStart = this.textarea.selectionStart;
      const beforeCursor = value.substring(0, selectionStart);
      const linesBeforeCursor = beforeCursor.split("\n");
      const currentLine = linesBeforeCursor.length;
      const currentColumn = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
      if (this.options.statsFormatter) {
        this.statsBar.innerHTML = this.options.statsFormatter({
          chars,
          words,
          lines: lines.length,
          line: currentLine,
          column: currentColumn
        });
      } else {
        this.statsBar.innerHTML = `
          <div class="overtype-stat">
            <span class="live-dot"></span>
            <span>${chars} chars, ${words} words, ${lines.length} lines</span>
          </div>
          <div class="overtype-stat">Line ${currentLine}, Col ${currentColumn}</div>
        `;
      }
    }
    /**
     * Show or hide stats bar
     * @param {boolean} show - Whether to show stats
     */
    showStats(show) {
      this.options.showStats = show;
      if (show && !this.statsBar) {
        this.statsBar = document.createElement("div");
        this.statsBar.className = "overtype-stats";
        this.wrapper.appendChild(this.statsBar);
        this.wrapper.classList.add("with-stats");
        this._updateStats();
      } else if (!show && this.statsBar) {
        this.statsBar.remove();
        this.statsBar = null;
        this.wrapper.classList.remove("with-stats");
      }
    }
    /**
     * Destroy the editor instance
     */
    destroy() {
      this.element.overTypeInstance = null;
      _OverType.instances.delete(this.element);
      if (this.shortcuts) {
        this.shortcuts.destroy();
      }
      if (this.wrapper) {
        const content = this.getValue();
        this.wrapper.remove();
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
      return new _OverType(target, options);
    }
    /**
     * Get instance from element
     * @param {Element} element - DOM element
     * @returns {OverType|null} OverType instance or null
     */
    static getInstance(element) {
      return element.overTypeInstance || _OverType.instances.get(element) || null;
    }
    /**
     * Destroy all instances
     */
    static destroyAll() {
      const elements = document.querySelectorAll("[data-overtype-instance]");
      elements.forEach((element) => {
        const instance = _OverType.getInstance(element);
        if (instance) {
          instance.destroy();
        }
      });
    }
    /**
     * Inject styles into the document
     * @param {boolean} force - Force re-injection
     */
    static injectStyles(force = false) {
      if (_OverType.stylesInjected && !force)
        return;
      const existing = document.querySelector("style.overtype-styles");
      if (existing) {
        existing.remove();
      }
      const theme = _OverType.currentTheme || solar;
      const styles = generateStyles({ theme });
      const styleEl = document.createElement("style");
      styleEl.className = "overtype-styles";
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
      _OverType.stylesInjected = true;
    }
    /**
     * Set global theme for all OverType instances
     * @param {string|Object} theme - Theme name or custom theme object
     * @param {Object} customColors - Optional color overrides
     */
    static setTheme(theme, customColors = null) {
      let themeObj = typeof theme === "string" ? getTheme(theme) : theme;
      if (customColors) {
        themeObj = mergeTheme(themeObj, customColors);
      }
      _OverType.currentTheme = themeObj;
      _OverType.injectStyles(true);
      document.querySelectorAll(".overtype-wrapper").forEach((wrapper) => {
        const themeName = typeof themeObj === "string" ? themeObj : themeObj.name;
        if (themeName) {
          wrapper.setAttribute("data-theme", themeName);
        }
        const instance = wrapper._instance;
        if (instance) {
          instance.updatePreview();
        }
      });
    }
    /**
     * Initialize global event listeners
     */
    static initGlobalListeners() {
      if (_OverType.globalListenersInitialized)
        return;
      document.addEventListener("input", (e) => {
        if (e.target.classList.contains("overtype-input")) {
          const wrapper = e.target.closest(".overtype-wrapper");
          const instance = wrapper == null ? void 0 : wrapper._instance;
          if (instance)
            instance.handleInput(e);
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.target.classList.contains("overtype-input")) {
          const wrapper = e.target.closest(".overtype-wrapper");
          const instance = wrapper == null ? void 0 : wrapper._instance;
          if (instance)
            instance.handleKeydown(e);
        }
      });
      document.addEventListener("scroll", (e) => {
        if (e.target.classList.contains("overtype-input")) {
          const wrapper = e.target.closest(".overtype-wrapper");
          const instance = wrapper == null ? void 0 : wrapper._instance;
          if (instance)
            instance.handleScroll(e);
        }
      }, true);
      document.addEventListener("selectionchange", (e) => {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains("overtype-input")) {
          const wrapper = activeElement.closest(".overtype-wrapper");
          const instance = wrapper == null ? void 0 : wrapper._instance;
          if (instance) {
            if (instance.options.showStats && instance.statsBar) {
              instance._updateStats();
            }
            clearTimeout(instance._selectionTimeout);
            instance._selectionTimeout = setTimeout(() => {
              instance.updatePreview();
            }, 50);
          }
        }
      });
      _OverType.globalListenersInitialized = true;
    }
  };
  // Static properties
  __publicField(_OverType, "instances", /* @__PURE__ */ new WeakMap());
  __publicField(_OverType, "stylesInjected", false);
  __publicField(_OverType, "globalListenersInitialized", false);
  __publicField(_OverType, "instanceCount", 0);
  var OverType = _OverType;
  OverType.MarkdownParser = MarkdownParser;
  OverType.ShortcutsManager = ShortcutsManager;
  OverType.themes = { solar, cave: getTheme("cave") };
  OverType.getTheme = getTheme;
  OverType.currentTheme = solar;
  var overtype_default = OverType;
  return __toCommonJS(overtype_exports);
})();
/**
 * OverType - A lightweight markdown editor library with perfect WYSIWYG alignment
 * @version 1.0.0
 * @license MIT
 */
//# sourceMappingURL=overtype.js.map
