# Show HN: OverType - A markdown WYSIWYG editor that's just a textarea

Hi HN! I got so frustrated with modern WYSIWYG editors that I started to play around with building my own. 

The problem I had was simple: I wanted a low-tech way to style text as I typed, but I didn't want to load a complex 500KB library, especially if I was going to initialize it dozens of times on the same page.

Markdown in a plain <textarea> was the best alternative to a WYSIWYG, but its main drawback is how ugly it looks without any formatting. I can handle it, but my clients certainly can't.

I went down the ContentEditable rabbit hole for a few years, conducting various experiments, but I always came back to the realization that other, smarter people had already built on top of ContentEditable better than I ever could...

Over and over again throughout the years, I kept coming back to this problem: why can't I have a simple, performant, beautiful markdown editor? The best solution I ever saw was Ghost's original split-screen editor: markdown on the left panel and a beautiful preview on the right, with syncronized scrolling to keep them in sync. It made me feel like I could capture technical ideas, but in an elegant way.

Then, about a year ago, an idea entered my head: what if we layered a preview pane behind a plain <textarea>? If we aligned them perfectly (font, spacing, line height), then even though you were only editing plain text, it would look and feel like you were editing rich text!

Of course, there would be downsides: you'd have to use a monospace font, the same font size everywhere, and all the markdown markup would have to be displayed in the final preview.

But those were tradeoffs I could live with.

Anyways, version 1 didn't go so well... it turns out it's harder to keep a textarea and a rendered preview aligned than I thought. Here's what I discovered:

- **Lists were impossible to align** because bullet points and numbers threw off the character alignment. In v2, I replaced them with HTML entities (• for bullets, numbers for ordered lists) that maintain monospace width.
- **Not all monospace fonts are truly monospace** - bold and italic text can have different widths even in "monospace" fonts, breaking the perfect overlay.
- **Embedding was a nightmare** - any inherited CSS from parent pages (margin, padding, line-height) would shift alignment. Even a 1px shift completely broke the illusion.

The solution was obsessive normalization:

```javascript
// The entire trick: a transparent textarea over a preview div
layerElements(textarea, preview)           // Position textarea over preview
applyIdenticalSpacing(textarea, preview)   // Match fonts, padding, line-height exactly

// Make textarea invisible but keep the cursor
textarea.style.background = 'transparent'
textarea.style.color = 'transparent'
textarea.style.caretColor = 'black'

// Keep them in sync
textarea.addEventListener('input', () => {
  preview.innerHTML = parseMarkdown(textarea.value)
  syncScroll(textarea, preview)
})
```

A week ago I started playing around with this idea in version 2, while working on a simple CRM for my business. And then I discovered the excellent <markdown-toolbar> element by GitHub, which does a fantastic job of abstracting away markdown toolbar actions in a plain <textarea>.

That experiment turned into OverType, that I'm showing you today -- it's a rich markdown editor that's really just a textarea. The key insight was that once you solve the alignment challenges, you get everything native textareas provide for free: undo/redo, mobile keyboards, accessibility, and native performance.

So far, in all my cross browser and mobile testing, it works surprisingly well. I get performant rich text editing in one small package (45KB total). It's kind of a dumb idea, but it works! So, for the forseeable future, I'm planning to use it in all my projects and continue developing it. I plan to keep it very simple and minimal.

I would love it if you would kick the tires and let me know what you think of it. Happy editing!