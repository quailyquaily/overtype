/**
 * Toolbar component for OverType editor
 * Provides markdown formatting buttons with icons
 */

import * as icons from './icons.js';
import * as markdownActions from 'markdown-actions';

export class Toolbar {
  constructor(editor) {
    this.editor = editor;
    this.container = null;
    this.buttons = {};
  }

  /**
   * Create and attach toolbar to editor
   */
  create() {
    // Create toolbar container
    this.container = document.createElement('div');
    this.container.className = 'overtype-toolbar';
    this.container.setAttribute('role', 'toolbar');
    this.container.setAttribute('aria-label', 'Text formatting');

    // Define toolbar buttons
    const buttonConfig = [
      { name: 'bold', icon: icons.boldIcon, title: 'Bold (Ctrl+B)', action: 'toggleBold' },
      { name: 'italic', icon: icons.italicIcon, title: 'Italic (Ctrl+I)', action: 'toggleItalic' },
      { separator: true },
      { name: 'h1', icon: icons.h1Icon, title: 'Heading 1', action: 'insertH1' },
      { name: 'h2', icon: icons.h2Icon, title: 'Heading 2', action: 'insertH2' },
      { name: 'h3', icon: icons.h3Icon, title: 'Heading 3', action: 'insertH3' },
      { separator: true },
      { name: 'link', icon: icons.linkIcon, title: 'Insert Link (Ctrl+K)', action: 'insertLink' },
      { name: 'code', icon: icons.codeIcon, title: 'Inline Code', action: 'toggleCode' },
      { name: 'codeBlock', icon: icons.codeBlockIcon, title: 'Code Block', action: 'insertCodeBlock' },
      { separator: true },
      { name: 'bulletList', icon: icons.bulletListIcon, title: 'Bullet List', action: 'toggleBulletList' },
      { name: 'orderedList', icon: icons.orderedListIcon, title: 'Numbered List', action: 'toggleNumberedList' }
    ];

    // Create buttons
    buttonConfig.forEach(config => {
      if (config.separator) {
        const separator = document.createElement('div');
        separator.className = 'overtype-toolbar-separator';
        separator.setAttribute('role', 'separator');
        this.container.appendChild(separator);
      } else {
        const button = this.createButton(config);
        this.buttons[config.name] = button;
        this.container.appendChild(button);
      }
    });

    // Insert toolbar before editor wrapper
    const wrapper = this.editor.element.querySelector('.overtype-wrapper');
    if (wrapper) {
      this.editor.element.insertBefore(this.container, wrapper);
    }

    return this.container;
  }

  /**
   * Create individual toolbar button
   */
  createButton(config) {
    const button = document.createElement('button');
    button.className = 'overtype-toolbar-button';
    button.type = 'button';
    button.title = config.title;
    button.setAttribute('aria-label', config.title);
    button.setAttribute('data-action', config.action);
    button.innerHTML = config.icon;

    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleAction(config.action);
    });

    return button;
  }

  /**
   * Handle toolbar button actions
   */
  async handleAction(action) {
    const textarea = this.editor.textarea;
    if (!textarea) return;

    // Focus textarea
    textarea.focus();

    try {
      
      switch (action) {
        case 'toggleBold':
          markdownActions.toggleBold(textarea);
          break;
        case 'toggleItalic':
          markdownActions.toggleItalic(textarea);
          break;
        case 'insertH1':
          markdownActions.insertHeader(textarea, 1);
          break;
        case 'insertH2':
          markdownActions.insertHeader(textarea, 2);
          break;
        case 'insertH3':
          markdownActions.insertHeader(textarea, 3);
          break;
        case 'insertLink':
          markdownActions.insertLink(textarea);
          break;
        case 'toggleCode':
          markdownActions.toggleCode(textarea);
          break;
        case 'insertCodeBlock':
          // For code blocks, we'll insert the markdown directly
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selectedText = textarea.value.slice(start, end);
          const codeBlock = '```\n' + selectedText + '\n```';
          textarea.setRangeText(codeBlock, start, end, 'end');
          break;
        case 'toggleBulletList':
          markdownActions.toggleBulletList(textarea);
          break;
        case 'toggleNumberedList':
          markdownActions.toggleNumberedList(textarea);
          break;
      }

      // Trigger input event to update preview
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (error) {
      console.error('Error loading markdown-actions:', error);
    }
  }

  /**
   * Update toolbar button states based on current selection
   */
  async updateButtonStates() {
    const textarea = this.editor.textarea;
    if (!textarea) return;

    try {
      const activeFormats = markdownActions.getActiveFormats(textarea);

      // Update button states
      Object.entries(this.buttons).forEach(([name, button]) => {
        let isActive = false;
        
        switch (name) {
          case 'bold':
            isActive = activeFormats.includes('bold');
            break;
          case 'italic':
            isActive = activeFormats.includes('italic');
            break;
          case 'code':
            isActive = activeFormats.includes('code');
            break;
          case 'bulletList':
            isActive = activeFormats.includes('bulletList');
            break;
          case 'orderedList':
            isActive = activeFormats.includes('orderedList');
            break;
          case 'h1':
            isActive = activeFormats.includes('header1');
            break;
          case 'h2':
            isActive = activeFormats.includes('header2');
            break;
          case 'h3':
            isActive = activeFormats.includes('header3');
            break;
        }

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive.toString());
      });
    } catch (error) {
      // Silently fail if markdown-actions not available
    }
  }

  /**
   * Destroy toolbar
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.buttons = {};
    }
  }
}