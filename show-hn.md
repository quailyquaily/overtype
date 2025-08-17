# Show HN: OverType - A markdown WYSIWYG editor that's just a textarea

Hi HN! I got so frustrated with modern WYSIWYG editors that I started to play around with building my own. 

The problem I had was simple: I wanted a low-tech way to type styled text, but I didn't want to load a complex 500KB library, especially if I was going to initialize it dozens of times on the same page.

Markdown in a plain <textarea> was the best alternative to a full WYSIWYG, but its main drawback is how ugly it looks without any formatting. I can handle it, but my clients certainly can't.

I went down the ContentEditable rabbit hole for a few years, in various experiments, but I always came back to the realization that other, smarter people had already solved that route better than I ever could...

Over and over again throughout the years, I kept coming back to this problem: why can't I have a simple, performant, beautiful markdown editor? The best solution I ever saw was Ghost's original split-screen editor: markdown on the left-hand side and a beautiful preview on the right, with syncronized scrolling. It made me feel like I could capture technical ideas, but in an elegant way.

Then, about a year ago, an idea entered my head: what if we layered a preview pane behind a plain <textarea>? If we aligned them perfectly, then even thought you were only editing plain text, it would look and feel like you were editing rich text!

Of course, there would be downsides: you'd have to use a monospace font, all the content would have to have the same font size, and all the markdown markup would have to display in the final preview.

But those were tradeoffs I could live with.

Anyways, version 1 didn't go so well... it turns out it's harder to keep a textarea and a rendered preview in alignment than I thought it would be. And implementing a toolbar was a nightmare, even just for markdown formatting.

Then, a week ago I started playing with version 2, while working on a simple CRM for my business. And I discovered <markdown-toolbar> element by GitHub, which does an excellent job of abstracting away markdown formatting in a plain <textarea>.

That experiment turned into OverType, a rich markdown editor that's really just a textarea.

So far, in all my cross browser and mobile testing, it works really well. Surprisingly well. I get performant rich text editing in one small package, with undo/redo baked in for free because it's just a textarea. It's kind of a dumb idea, but it really works. So, at least for the forseeable future, I'm planning to use it in all my projects and continue developing it, keeping it very simple and minimal.

I would love for you to kick its tires and let me know what you think of it. Happy editing!