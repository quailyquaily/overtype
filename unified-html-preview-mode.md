# Unified HTML Output Strategy for Preview Mode

## Core Concept
Output **semantic HTML** in both edit and preview modes, with syntax markers as embedded spans. Preview mode becomes purely CSS-based - just hide `.syntax-marker` elements. In preview mode, the textarea is hidden and the preview layer becomes interactive (clickable links, selectable text).

## Principle: One Parser, Two Views
```html
<!-- Both modes output this -->
<h1><span class="syntax-marker"># </span>Title</h1>

<!-- Edit mode CSS -->
.syntax-marker { color: #999; }
.overtype-preview { pointer-events: none; }

<!-- Preview mode CSS -->
.preview-mode .syntax-marker { display: none; }
.preview-mode .overtype-preview { pointer-events: auto; user-select: text; }
.preview-mode .overtype-input { display: none; }
```

## Element-by-Element Analysis

### ✅ Headers (Perfect Fit)
**Current Output:**
```html
<span class="header h1"><span class="syntax-marker">#</span> Content</span>
```

**Unified Output:**
```html
<h1><span class="syntax-marker"># </span>Content</h1>
<h2><span class="syntax-marker">## </span>Content</h2>
<h3><span class="syntax-marker">### </span>Content</h3>
```

**Benefits:**
- Semantic HTML always
- Natural font sizing in preview
- Proper document outline
- Accessibility improved

**CSS:**
```css
/* Edit mode - flatten the heading styles */
h1, h2, h3 {
  font-size: inherit !important;
  font-weight: bold !important;
  margin: 0 !important;
  display: inline !important;
}

/* Preview mode - restore heading styles */
.preview-mode h1 { font-size: 2em !important; display: block !important; margin: 0.67em 0 !important; }
.preview-mode h2 { font-size: 1.5em !important; display: block !important; margin: 0.83em 0 !important; }
.preview-mode h3 { font-size: 1.17em !important; display: block !important; margin: 1em 0 !important; }
.preview-mode .syntax-marker { display: none !important; }
```

### ✅ Bold & Italic (Already Done!)
**Current Output (keep as is):**
```html
<strong><span class="syntax-marker">**</span>text<span class="syntax-marker">**</span></strong>
<em><span class="syntax-marker">*</span>text<span class="syntax-marker">*</span></em>
```

**This is perfect!** Just hide markers in preview mode.

### ✅ Lists (Post-Processing Solution)
**Parser Output (before post-processing):**
```html
<li class="bullet-list"><span class="syntax-marker">- </span>Item</li>
<li class="bullet-list"><span class="syntax-marker">- </span>Another</li>
<li class="ordered-list"><span class="syntax-marker">1. </span>First</li>
<li class="ordered-list"><span class="syntax-marker">2. </span>Second</li>
```

**After Post-Processing:**
```html
<ul>
  <li class="bullet-list"><span class="syntax-marker">- </span>Item</li>
  <li class="bullet-list"><span class="syntax-marker">- </span>Another</li>
</ul>

<ol>
  <li class="ordered-list"><span class="syntax-marker">1. </span>First</li>
  <li class="ordered-list"><span class="syntax-marker">2. </span>Second</li>
</ol>
```

**Post-Processor Logic:**
- Group consecutive `li.bullet-list` elements into `<ul>`
- Group consecutive `li.ordered-list` elements into `<ol>`
- Handle transitions between list types

**CSS:**
```css
/* Edit mode - remove list styling */
ul, ol {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Preview mode - restore list styling */
.preview-mode ul { list-style: disc !important; padding-left: 2em !important; }
.preview-mode ol { list-style: decimal !important; padding-left: 2em !important; }
.preview-mode .syntax-marker { display: none !important; }
```

### ✅ Links (Special Handling)
**Updated Solution:** Links need to be interactive in preview mode, so we'll handle them differently.

**Edit Mode Output:**
```html
<a href="#" data-href="https://example.com" class="markdown-link">
  <span class="syntax-marker">[</span>
  Link text
  <span class="syntax-marker url-part">](https://example.com)</span>
</a>
```
- `href="#"` prevents accidental clicks in edit mode
- `data-href` stores the real URL
- Syntax markers visible

**Preview Mode Transformation:**
When entering preview mode, JavaScript will:
1. Set `href` from `data-href` 
2. Links become fully clickable

**CSS:**
```css
/* Edit mode - links not clickable */
.markdown-link {
  pointer-events: none;
  cursor: text;
}

/* Preview mode - links clickable, hide URL syntax */
.preview-mode .markdown-link {
  pointer-events: auto !important;
  cursor: pointer !important;
}
.preview-mode .url-part {
  display: none !important;
}
```

### ✅ Code Inline (Works)
**Current Output (keep):**
```html
<code><span class="syntax-marker">`</span>code<span class="syntax-marker">`</span></code>
```

### ✅ Code Blocks (CSS-Only Solution)
**Keep Current Output:**
```html
<div><span class="code-fence">```javascript</span></div>
<div class="code-block-line">code here</div>
<div class="code-block-line">more code</div>
<div><span class="code-fence">```</span></div>
```

**No Parser Changes Needed!** Just use CSS to style existing structure.

**CSS:**
```css
/* Edit mode - already working */
.code-block-line {
  background: var(--code-bg, rgba(244, 211, 94, 0.4)) !important;
}

/* Preview mode - enhanced styling */
.preview-mode .code-fence {
  display: none !important;
}

.preview-mode .code-block-line {
  background: #2d2d2d !important;
  color: #f8f8f2 !important;
  padding: 0 1em !important;
  font-family: 'SF Mono', Monaco, monospace !important;
}

.preview-mode .code-block-line:first-of-type {
  padding-top: 1em !important;
  border-radius: 4px 4px 0 0 !important;
}

.preview-mode .code-block-line:last-of-type {
  padding-bottom: 1em !important;
  border-radius: 0 0 4px 4px !important;
}
```

### ✅ Blockquotes (CSS-Only Solution)
**Keep Current Output:**
```html
<div><span class="blockquote"><span class="syntax-marker">&gt;</span> Quote text</span></div>
```

**No Parser Changes Needed!** Just use CSS to style existing `.blockquote` class.

**CSS:**
```css
/* Edit mode - already working */
.blockquote {
  color: var(--blockquote, #5a7a9b) !important;
}

/* Preview mode - enhanced styling */
.preview-mode .blockquote {
  display: block !important;
  border-left: 4px solid #ddd !important;
  padding-left: 1em !important;
  margin: 1em 0 !important;
  font-style: italic !important;
}

.preview-mode .blockquote .syntax-marker {
  display: none !important;
}
```

### ✅ Horizontal Rules (Works)
**Unified Output:**
```html
<hr data-syntax="---">
  <span class="syntax-marker">---</span>
</hr>
```

**CSS:**
```css
/* Edit mode */
hr {
  border: none !important;
  margin: 0 !important;
  display: inline !important;
}

/* Preview mode */
.preview-mode hr {
  display: block !important;
  border-top: 1px solid #ccc !important;
  margin: 1em 0 !important;
}
.preview-mode hr .syntax-marker { display: none !important; }
```

## Implementation Strategy

### Phase 1: Parser Modifications
```javascript
// Modify each parse method to return semantic HTML

static parseHeader(html) {
  return html.replace(/^(#{1,3})\s(.+)$/, (match, hashes, content) => {
    const level = hashes.length;
    return `<h${level}><span class="syntax-marker">${hashes} </span>${content}</h${level}>`;
  });
}

static parseBulletList(html) {
  return html.replace(/^([-*])\s(.+)$/, (match, marker, content) => {
    // Add class to identify list type
    return `<li class="bullet-list"><span class="syntax-marker">${marker} </span>${content}</li>`;
  });
}

static parseNumberedList(html) {
  return html.replace(/^(\d+\.)\s(.+)$/, (match, marker, content) => {
    // Add class to identify list type
    return `<li class="ordered-list"><span class="syntax-marker">${marker} </span>${content}</li>`;
  });
}

static parseLinks(html) {
  return html.replace(/\[(.+?)\]\((.+?)\)/g, (match, text, url) => {
    const safeUrl = this.sanitizeUrl(url);
    // Use data-href to store URL, href="#" to prevent clicks in edit mode
    return `<a href="#" data-href="${safeUrl}" class="markdown-link">
      <span class="syntax-marker">[</span>${text}<span class="syntax-marker url-part">](${url})</span>
    </a>`;
  });
}
```

### Phase 2: Post-Processing
```javascript
// After parsing, consolidate lists
static postProcessHTML(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  
  // Consolidate lists
  let currentList = null;
  let currentListType = null;
  
  Array.from(container.children).forEach((element, index) => {
    if (element.tagName === 'LI') {
      const isOrdered = element.classList.contains('ordered-list');
      const listType = isOrdered ? 'ol' : 'ul';
      
      // Start new list or continue current
      if (!currentList || currentListType !== listType) {
        currentList = document.createElement(listType);
        element.parentNode.insertBefore(currentList, element);
        currentListType = listType;
      }
      
      currentList.appendChild(element);
    } else {
      // Non-list element, close current list
      currentList = null;
      currentListType = null;
    }
  });
  
  return container.innerHTML;
}
```

### Phase 3: Preview Mode Activation
```javascript
showPreviewMode(show) {
  if (show) {
    // Enter preview mode
    this.container.classList.add('preview-mode');
    
    // Make links functional
    this.preview.querySelectorAll('a[data-href]').forEach(link => {
      link.href = link.dataset.href;
      link.classList.add('active-link');
    });
    
    // Re-render with semantic HTML
    const html = MarkdownParser.parse(this.textarea.value);
    const processedHTML = MarkdownParser.postProcessHTML(html);
    this.preview.innerHTML = processedHTML;
    
  } else {
    // Exit preview mode
    this.container.classList.remove('preview-mode');
    
    // Restore edit mode links
    this.preview.querySelectorAll('a.active-link').forEach(link => {
      link.href = '#';
      link.classList.remove('active-link');
    });
    
    // Re-render
    this.updatePreview();
  }
}
```

### Phase 4: CSS for Edit Mode
```css
/* Flatten all semantic elements in edit mode */
.overtype-preview h1, 
.overtype-preview h2, 
.overtype-preview h3,
.overtype-preview blockquote,
.overtype-preview pre {
  font-size: inherit !important;
  font-weight: inherit !important;
  font-family: inherit !important;
  margin: 0 !important;
  padding: 0 !important;
  display: inline !important;
  border: none !important;
  background: transparent !important;
}

/* Maintain monospace alignment */
.overtype-preview * {
  font-family: monospace !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}
```

### Phase 5: CSS for Preview Mode
```css
/* Hide all syntax markers */
.preview-mode .syntax-marker {
  display: none !important;
}

/* Restore semantic styling */
.preview-mode h1 { 
  font-size: 2em !important; 
  display: block !important;
  margin: 0.67em 0 !important;
  font-family: system-ui !important;
}

.preview-mode ul {
  list-style: disc !important;
  padding-left: 2em !important;
  display: block !important;
}

/* Beautiful typography */
.preview-mode .overtype-preview {
  font-family: Georgia, serif !important;
  font-size: 18px !important;
  line-height: 1.8 !important;
  max-width: 680px !important;
  margin: 0 auto !important;
}
```

## Challenges & Solutions

### Challenge 1: Block vs Inline
**Problem:** Headers need to be inline in edit mode but block in preview.
**Solution:** CSS `display` property handles this perfectly.

### Challenge 2: List Consolidation
**Problem:** Need to wrap consecutive list items in `<ul>`/`<ol>`.
**Solution:** Post-process parser output to detect and wrap consecutive `<li>` elements.

### Challenge 3: Line Wrapping
**Problem:** Each line is wrapped in `<div>` currently.
**Solution:** In unified mode, use semantic elements directly, no wrapper divs needed.

### Challenge 4: Alignment
**Problem:** Different font sizes break alignment.
**Solution:** In edit mode, force all elements to same font-size with CSS.

## Benefits of This Approach

1. **Single Parser Path** - One output for both modes
2. **Pure CSS Toggle** - Preview mode is just hiding markers
3. **Semantic HTML Always** - Better for accessibility/SEO
4. **Progressive Enhancement** - Falls back gracefully
5. **Simpler Implementation** - ~3 hours vs 6-8 hours
6. **Easier Testing** - One HTML output to test
7. **Better Performance** - No re-parsing on mode switch

## Feasibility Score: 8/10

**Highly Feasible** with these caveats:
- Links need special handling for URL hiding
- List consolidation needs new logic
- Some CSS `!important` battles may occur
- Need to carefully manage block/inline display

## Detailed Implementation Steps

### Step 0: Update Eye Button to Dropdown Menu (30 min)
**Files:** `src/toolbar.js`, `src/styles.js`

**Current State:**
- Eye button currently toggles plain textarea mode only
- Located at the end of toolbar (after task list button)

**Changes Needed:**

1. **Remove current eye button** from end of toolbar
2. **Keep the eye button** but make it trigger a dropdown menu
3. **Three view modes:**
   - Normal Edit (default) - current OverType mode
   - Plain Textarea - hides overlay, shows plain text (already implemented)
   - Preview Mode - hides textarea, shows formatted preview (new)

**Implementation Details:**
- Eye button should always be visible in toolbar (not optional)
- Clicking eye button shows dropdown menu below it
- Current mode has checkmark
- Clicking outside closes dropdown
- Each mode is mutually exclusive

**Visual Design:**
```
[Eye Icon ▼]
┌─────────────────┐
│ ✓ Normal Edit   │
│   Plain Textarea│
│   Preview Mode  │
└─────────────────┘
```

**Benefits:**
- Single button for all view modes
- Cleaner toolbar (no multiple view buttons)
- Clear indication of current mode
- Extensible for future view modes

### Step 1: Headers - Semantic HTML (30 min)
**File:** `src/parser.js`

**Change `parseHeader()` method:**
- FROM: `<span class="header h1"><span class="syntax-marker">#</span> Content</span>`
- TO: `<h1><span class="syntax-marker"># </span>Content</h1>`

**Add to `src/styles.js`:**
```css
/* Flatten headers in edit mode */
.overtype-preview h1, h2, h3 {
  font-size: inherit !important;
  font-weight: bold !important;
  margin: 0 !important;
  display: inline !important;
}

/* Restore in preview mode */
.preview-mode h1 { 
  font-size: 2em !important; 
  display: block !important;
  margin: 0.67em 0 !important;
}
```

**Test cases:**
- `# Header` → `<h1>`
- `## Header with *italic*` → nested formatting
- `### Header with \`code\`` → nested code

### Step 2: Lists - Consolidation Logic (1 hour)
**File:** `src/parser.js`

**Modify list parsing:**
```javascript
// In parseBulletList()
return `<li class="bullet-list"><span class="syntax-marker">${marker} </span>${content}</li>`;

// In parseNumberedList()  
return `<li class="ordered-list"><span class="syntax-marker">${marker} </span>${content}</li>`;
```

**Add new method `postProcessHTML()`:**
```javascript
static postProcessHTML(html) {
  // Parse HTML string into DOM
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  let currentList = null;
  let listType = null;
  
  // Process all direct children
  const children = Array.from(temp.children);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    
    if (child.tagName === 'LI') {
      const isBullet = child.classList.contains('bullet-list');
      const newType = isBullet ? 'ul' : 'ol';
      
      // Start new list or continue
      if (!currentList || listType !== newType) {
        currentList = document.createElement(newType);
        temp.insertBefore(currentList, child);
        listType = newType;
      }
      
      currentList.appendChild(child);
      i--; // Adjust index since we moved element
    } else {
      // Non-list element ends current list
      currentList = null;
      listType = null;
    }
  }
  
  return temp.innerHTML;
}
```

**Update `parse()` to call post-processor:**
```javascript
static parse(text, activeLine = -1, showActiveLineRaw = false) {
  // ... existing parsing ...
  const html = parsedLines.join('');
  return this.postProcessHTML(html);
}
```

**CSS updates:**
```css
/* Remove list styling in edit mode */
ul, ol { 
  list-style: none !important; 
  margin: 0 !important;
  padding: 0 !important;
}

/* Restore in preview mode */
.preview-mode ul { 
  list-style: disc !important;
  padding-left: 2em !important;
}
```

**Test cases:**
- Consecutive bullet items
- Consecutive numbered items
- Mixed lists with transitions
- Empty list items
- Nested lists (if supported)

### Step 3: Links - Safe Click Handling (30 min)
**File:** `src/parser.js`

**Modify `parseLinks()`:**
```javascript
static parseLinks(html) {
  return html.replace(/\[(.+?)\]\((.+?)\)/g, (match, text, url) => {
    const safeUrl = this.sanitizeUrl(url);
    const anchorName = `--link-${this.linkIndex++}`;
    
    // Parse inner text for nested formatting
    const innerHtml = this.parseInlineElements(text);
    
    return `<a href="#" data-href="${safeUrl}" class="markdown-link" style="anchor-name: ${anchorName}">
      <span class="syntax-marker">[</span>${innerHtml}<span class="syntax-marker url-part">](${url})</span>
    </a>`;
  });
}
```

**Add to `src/overtype.js`:**
```javascript
showPreviewMode(show) {
  if (show) {
    this.container.classList.add('preview-mode');
    
    // Activate links
    this.preview.querySelectorAll('a[data-href]').forEach(link => {
      const href = link.dataset.href;
      if (href && href !== '#') {
        link.href = href;
        link.style.pointerEvents = 'auto';
      }
    });
  } else {
    this.container.classList.remove('preview-mode');
    
    // Deactivate links
    this.preview.querySelectorAll('a[href]:not([href="#"])').forEach(link => {
      link.href = '#';
      link.style.pointerEvents = 'none';
    });
  }
}
```

**CSS:**
```css
/* Hide URL in preview mode */
.preview-mode .url-part {
  display: none !important;
}

/* Make links interactive in preview */
.preview-mode a {
  pointer-events: auto !important;
  cursor: pointer !important;
  color: #0066cc !important;
  text-decoration: underline !important;
}
```

**Test cases:**
- Basic link `[text](url)`
- Link with nested formatting `[**bold**](url)`
- Links with special characters in URL
- Escaped brackets in link text

### Step 4: CSS Polish & Modes (1 hour)
**File:** `src/styles.js`

**Add complete preview mode styles:**
```css
/* === EDIT MODE OVERRIDES === */
/* Keep everything flat and monospace */
.overtype-preview * {
  font-family: monospace !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

/* === PREVIEW MODE === */
/* Beautiful typography */
.preview-mode .overtype-preview {
  font-family: Georgia, 'Times New Roman', serif !important;
  font-size: 18px !important;
  line-height: 1.8 !important;
  max-width: 680px !important;
  margin: 0 auto !important;
  padding: 40px !important;
}

/* Hide all syntax markers */
.preview-mode .syntax-marker {
  display: none !important;
}

/* Code blocks - style existing divs */
.preview-mode .code-block-line {
  background: #2d2d2d !important;
  color: #f8f8f2 !important;
  padding-left: 1em !important;
  padding-right: 1em !important;
}

.preview-mode .code-block-line:first-child {
  padding-top: 1em !important;
  border-radius: 6px 6px 0 0 !important;
}

.preview-mode .code-block-line:last-child {
  padding-bottom: 1em !important;
  border-radius: 0 0 6px 6px !important;
}

/* Blockquotes - style existing spans */
.preview-mode .blockquote {
  display: block !important;
  border-left: 4px solid #ddd !important;
  padding-left: 1em !important;
  margin: 1em 0 !important;
  color: #666 !important;
  font-style: italic !important;
}

/* Make preview interactive */
.preview-mode .overtype-preview {
  pointer-events: auto !important;
  user-select: text !important;
}

/* Hide textarea completely */
.preview-mode .overtype-input {
  display: none !important;
}
```

**Add view mode dropdown menu:**
```javascript
// In toolbar.js - modify existing eye button
{
  name: 'viewMode',
  icon: icons.eyeIcon, // existing eye icon
  title: 'View mode',
  action: 'show-view-menu',
  hasDropdown: true  // new property
}

// Create dropdown menu element
createViewModeMenu() {
  const menu = document.createElement('div');
  menu.className = 'overtype-dropdown-menu';
  menu.innerHTML = `
    <button data-mode="normal" class="dropdown-item active">
      <span class="check">✓</span> Normal Edit
    </button>
    <button data-mode="plain" class="dropdown-item">
      <span class="check"></span> Plain Textarea
    </button>
    <button data-mode="preview" class="dropdown-item">
      <span class="check"></span> Preview Mode
    </button>
  `;
  
  // Handle clicks
  menu.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    
    const mode = item.dataset.mode;
    this.setViewMode(mode);
    this.hideDropdown();
  });
  
  return menu;
}

// Handle view mode changes
setViewMode(mode) {
  // Clear all modes
  this.editor.container.classList.remove('plain-mode', 'preview-mode');
  
  // Update menu checkmarks
  this.dropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
    const check = item.querySelector('.check');
    check.textContent = item.dataset.mode === mode ? '✓' : '';
  });
  
  switch(mode) {
    case 'plain':
      this.editor.showPlainTextarea(true);
      break;
    case 'preview':
      this.editor.showPreviewMode(true);
      break;
    case 'normal':
    default:
      // Normal edit mode - both methods return to normal
      this.editor.showPlainTextarea(false);
      this.editor.showPreviewMode(false);
      break;
  }
}

// Show dropdown on eye button click
case 'show-view-menu':
  this.toggleDropdown(button);
  break;
```

**Add dropdown CSS:**
```css
/* Dropdown positioning */
.overtype-toolbar-button {
  position: relative;
}

.overtype-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 150px;
  display: none;
}

.overtype-dropdown-menu.active {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.dropdown-item:hover {
  background: #f0f0f0;
}

.dropdown-item.active {
  font-weight: 600;
}

.dropdown-item .check {
  width: 16px;
  margin-right: 8px;
  color: #007bff;
}

/* Dark theme support */
.overtype-container[data-theme="cave"] .overtype-dropdown-menu {
  background: #2d2d2d;
  border-color: #444;
}

.overtype-container[data-theme="cave"] .dropdown-item {
  color: #e0e0e0;
}

.overtype-container[data-theme="cave"] .dropdown-item:hover {
  background: #3a3a3a;
}
```

**Test integration:**
- Toggle between modes preserves content
- Cursor position maintained (if possible)
- All visual elements styled correctly
- Performance with large documents

**Total Estimate: 3.5 hours** including dropdown menu implementation

## Updated Architecture Summary

### Parser Strategy (Simplified!)
1. **Semantic HTML for Headers Only**: Output `<h1>`, `<h2>`, `<h3>` with embedded syntax markers
2. **Keep Everything Else**: Code blocks, blockquotes stay as-is with classes
3. **List Classes**: Each `<li>` gets `class="bullet-list"` or `class="ordered-list"`
4. **Safe Links**: Use `href="#"` and `data-href` for edit mode safety

### Post-Processing (Simplified!)
1. **List Consolidation**: Group consecutive `<li>` elements into `<ul>` or `<ol>`
2. **That's it!** No need for complex structure changes

### Preview Mode Features
1. **Hide textarea**: Complete removal from view
2. **Interactive preview**: Links clickable, text selectable
3. **Beautiful typography**: Real font sizes and spacing
4. **Pure CSS toggle**: Most changes via `.preview-mode` class

### Edit Mode Features
1. **Flat styling**: All elements same font-size for alignment
2. **Non-interactive**: Preview layer is pass-through
3. **Syntax visible**: All markdown markers shown

## Conclusion

This unified HTML approach with post-processing is **the optimal solution** because it:
- Keeps one parser path (simpler maintenance)
- Uses semantic HTML always (better accessibility)
- Makes preview mode mostly CSS (fast toggling)
- Enables true interactivity in preview mode
- Maintains clean separation of concerns

**Implementation Estimate: 3.5 hours** with dropdown menu and simplified approach - CSS does most of the heavy lifting!

**This is the way to go!** 🎯