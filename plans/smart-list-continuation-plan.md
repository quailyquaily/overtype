# Smart List Continuation Implementation Plan for OverType

## Overview
Implement GitHub-style smart list continuation that automatically creates new list items when pressing Enter, while maintaining OverType's core architecture of textarea/preview synchronization.

## Core Requirements
1. **Preserve OverType's Architecture** - Work through existing update mechanisms
2. **Maintain Undo/Redo** - Use `document.execCommand` for text manipulation
3. **Support All List Types** - Bullets, numbered lists, checkboxes
4. **Smart Behavior** - Empty item exits list, mid-text split, auto-numbering

## Implementation Strategy

### Phase 1: Detection Infrastructure

#### 1.1 Add List Context Detection to Parser
**File:** `src/parser.js`

Add a method to detect list context at cursor position:
```javascript
static getListContext(text, cursorPosition) {
  // Returns:
  // {
  //   inList: boolean,
  //   listType: 'bullet' | 'numbered' | 'checkbox' | null,
  //   indent: string,
  //   marker: string | number,
  //   content: string,
  //   lineStart: number,
  //   lineEnd: number,
  //   markerEndPos: number
  // }
}
```

#### 1.2 List Pattern Constants
**File:** `src/parser.js`

Define regex patterns:
```javascript
static LIST_PATTERNS = {
  bullet: /^(\s*)([-*+])\s+(.*)$/,
  numbered: /^(\s*)(\d+)\.\s+(.*)$/,
  checkbox: /^(\s*)-\s+\[([ x])\]\s+(.*)$/
};
```

### Phase 2: Smart Enter Key Handler

#### 2.1 Extend Keyboard Handler
**File:** `src/overtype.js`

Modify the existing `handleKeyDown` method:
```javascript
handleKeyDown(e) {
  // Existing tab handling...
  
  // Add Enter key handling
  if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
    if (this.handleSmartListContinuation()) {
      e.preventDefault();
      return;
    }
  }
  
  // Existing shortcut handling...
}
```

#### 2.2 Smart List Continuation Method
**File:** `src/overtype.js`

New method that uses `execCommand`:
```javascript
handleSmartListContinuation() {
  const textarea = this.textarea;
  const cursorPos = textarea.selectionStart;
  const context = MarkdownParser.getListContext(textarea.value, cursorPos);
  
  if (!context.inList) return false;
  
  // Handle empty list item (exit list)
  if (context.content.trim() === '' && cursorPos >= context.markerEndPos) {
    // Delete current line's list marker
    this.deleteListMarker(context);
    return true;
  }
  
  // Create new list item
  const newListItem = this.createNewListItem(context);
  
  // Handle text splitting if cursor is in middle of content
  if (cursorPos > context.markerEndPos) {
    this.splitListItem(context, cursorPos, newListItem);
  } else {
    // Just add new item after current line
    this.insertNewListItem(newListItem);
  }
  
  // Handle numbered list renumbering
  if (context.listType === 'numbered') {
    this.scheduleNumberedListUpdate();
  }
  
  return true;
}
```

### Phase 3: Text Manipulation Methods

#### 3.1 Core Manipulation Functions
**File:** `src/overtype.js`

All using `document.execCommand` for undo/redo support:

```javascript
deleteListMarker(context) {
  // Select from line start to marker end
  this.textarea.setSelectionRange(context.lineStart, context.markerEndPos);
  document.execCommand('delete');
  document.execCommand('insertText', false, '\n');
}

insertNewListItem(listItem) {
  // Insert at current position
  document.execCommand('insertText', false, '\n' + listItem);
}

splitListItem(context, cursorPos, newListItem) {
  // Get text after cursor
  const splitPos = cursorPos - context.lineStart;
  const textAfterCursor = context.content.substring(
    cursorPos - context.markerEndPos
  );
  
  // Delete text after cursor
  this.textarea.setSelectionRange(cursorPos, context.lineEnd);
  document.execCommand('delete');
  
  // Insert new list item with remaining text
  document.execCommand('insertText', false, '\n' + newListItem + textAfterCursor);
  
  // Position cursor after new list marker
  const newCursorPos = this.textarea.selectionStart - textAfterCursor.length;
  this.textarea.setSelectionRange(newCursorPos, newCursorPos);
}
```

#### 3.2 List Item Creation
```javascript
createNewListItem(context) {
  switch (context.listType) {
    case 'bullet':
      return `${context.indent}${context.marker} `;
    case 'numbered':
      return `${context.indent}${context.marker + 1}. `;
    case 'checkbox':
      return `${context.indent}- [ ] `;
  }
}
```

### Phase 4: Numbered List Auto-Renumbering

#### 4.1 Deferred Update System
**File:** `src/overtype.js`

To avoid conflicts with ongoing input:
```javascript
scheduleNumberedListUpdate() {
  // Clear any pending update
  if (this.numberUpdateTimeout) {
    clearTimeout(this.numberUpdateTimeout);
  }
  
  // Schedule update after current input cycle
  this.numberUpdateTimeout = setTimeout(() => {
    this.updateNumberedLists();
  }, 10);
}
```

#### 4.2 Renumbering Logic
```javascript
updateNumberedLists() {
  const value = this.textarea.value;
  const cursorPos = this.textarea.selectionStart;
  const lines = value.split('\n');
  let modified = false;
  let offset = 0;
  
  // Track number sequences by indent level
  const numbersByIndent = new Map();
  
  lines.forEach((line, index) => {
    const match = line.match(MarkdownParser.LIST_PATTERNS.numbered);
    if (match) {
      const indent = match[1];
      const currentNum = parseInt(match[2]);
      const content = match[3];
      
      // Get expected number for this indent level
      const expected = (numbersByIndent.get(indent.length) || 0) + 1;
      
      if (currentNum !== expected) {
        // Update line
        lines[index] = `${indent}${expected}. ${content}`;
        modified = true;
        
        // Track cursor offset if change is before cursor
        const lineStart = value.split('\n').slice(0, index).join('\n').length + (index > 0 ? 1 : 0);
        if (lineStart < cursorPos) {
          offset += (`${expected}`.length - `${currentNum}`.length);
        }
      }
      
      numbersByIndent.set(indent.length, expected);
    } else {
      // Reset numbering for this indent level
      numbersByIndent.clear();
    }
  });
  
  if (modified) {
    const newValue = lines.join('\n');
    const newCursorPos = cursorPos + offset;
    
    // Update textarea
    this.textarea.value = newValue;
    this.textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Trigger update
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
```

### Phase 5: Configuration & Options

#### 5.1 Add Configuration Option
**File:** `src/overtype.js`

```javascript
constructor(element, options = {}) {
  this.options = {
    // Existing options...
    smartLists: options.smartLists !== false, // Default: true
    // ...
  };
}
```

#### 5.2 Feature Toggle
Allow users to disable if they prefer manual list management:
```javascript
handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey && this.options.smartLists) {
    if (this.handleSmartListContinuation()) {
      e.preventDefault();
      return;
    }
  }
}
```

### Phase 6: Edge Cases & Testing

#### 6.1 Edge Cases to Handle
- **Nested lists** - Preserve proper indentation
- **Mixed list types** - Don't continue numbered as bullet
- **Code blocks** - Don't process lists inside code blocks
- **Cursor at line start** - Handle gracefully
- **Multi-line selection** - Clear selection first
- **Performance** - Large documents with many numbered items

#### 6.2 Test Cases
**File:** `test/smart-lists.test.js`

Test scenarios:
1. Basic list continuation (bullets, numbers, checkboxes)
2. Empty item exits list
3. Mid-text split behavior
4. Numbered list renumbering
5. Nested list indentation
6. Mixed list types don't interfere
7. Code block immunity
8. Undo/redo functionality
9. Performance with large documents

### Phase 7: Documentation

#### 7.1 README Update
Add to features section:
- Smart list continuation (GitHub-style)
- Auto-numbering for ordered lists
- Press Enter twice to exit lists

#### 7.2 API Documentation
Document the new option:
```javascript
const editor = new OverType('#editor', {
  smartLists: true // Enable smart list continuation (default: true)
});
```

## Implementation Order

1. **Start with basic bullet lists** - Simplest case
2. **Add empty item handling** - Core UX feature  
3. **Implement numbered lists** - With renumbering
4. **Add checkbox support** - Extension of bullets
5. **Handle text splitting** - Advanced feature
6. **Performance optimization** - Debounce renumbering
7. **Add configuration option** - User control
8. **Write comprehensive tests** - Ensure reliability

## Success Criteria

- ✅ Works with OverType's existing update cycle
- ✅ Preserves undo/redo history
- ✅ No direct textarea.value manipulation (except renumbering)
- ✅ Smooth performance even with large documents
- ✅ Maintains cursor synchronization with preview
- ✅ All existing OverType features continue working
- ✅ Can be disabled via configuration

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance impact on large docs | Debounce renumbering, limit scope |
| Conflicts with existing shortcuts | Check modifier keys carefully |
| Browser compatibility with execCommand | Fallback to textarea.value + dispatch |
| Complex nested list edge cases | Comprehensive test suite |
| User expects different behavior | Make it configurable |

## Alternative Approaches Considered

1. **Pure CSS counters for numbering** - Doesn't update source
2. **Parser-only renumbering** - Would diverge from source
3. **Third-party library** - Adds dependency, may conflict
4. **Custom undo/redo stack** - Too complex, reinventing wheel

## Conclusion

This implementation leverages OverType's existing architecture while adding sophisticated list handling. By using `document.execCommand` for text manipulation and working with the existing event system, we maintain compatibility while adding powerful new functionality. The phased approach allows for incremental development and testing.