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
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
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

  // ../markdown-actions/dist/markdown-actions.esm.js
  var markdown_actions_esm_exports = {};
  __export(markdown_actions_esm_exports, {
    applyCustomFormat: () => applyCustomFormat,
    default: () => index_new_default,
    expandSelection: () => expandSelection,
    getActiveFormats: () => getActiveFormats2,
    hasFormat: () => hasFormat2,
    insertHeader: () => insertHeader,
    insertLink: () => insertLink,
    preserveSelection: () => preserveSelection,
    setUndoMethod: () => setUndoMethod,
    toggleBold: () => toggleBold,
    toggleBulletList: () => toggleBulletList,
    toggleCode: () => toggleCode,
    toggleItalic: () => toggleItalic,
    toggleNumberedList: () => toggleNumberedList,
    toggleQuote: () => toggleQuote
  });
  function getDefaultStyleArgs() {
    return {
      prefix: "",
      suffix: "",
      blockPrefix: "",
      blockSuffix: "",
      multiline: false,
      replaceNext: "",
      prefixSpace: false,
      scanFor: "",
      surroundWithNewlines: false,
      orderedList: false,
      unorderedList: false,
      trimFirst: false
    };
  }
  function mergeStyleWithDefaults(style) {
    return __spreadValues(__spreadValues({}, getDefaultStyleArgs()), style);
  }
  function isMultipleLines(string) {
    return string.trim().split("\n").length > 1;
  }
  function repeat(string, n) {
    return Array(n + 1).join(string);
  }
  function wordSelectionStart(text, i) {
    let index = i;
    while (text[index] && text[index - 1] != null && !text[index - 1].match(/\s/)) {
      index--;
    }
    return index;
  }
  function wordSelectionEnd(text, i, multiline) {
    let index = i;
    const breakpoint = multiline ? /\n/ : /\s/;
    while (text[index] && !text[index].match(breakpoint)) {
      index++;
    }
    return index;
  }
  function expandSelectionToLine(textarea) {
    const lines = textarea.value.split("\n");
    let counter = 0;
    for (let index = 0; index < lines.length; index++) {
      const lineLength = lines[index].length + 1;
      if (textarea.selectionStart >= counter && textarea.selectionStart < counter + lineLength) {
        textarea.selectionStart = counter;
      }
      if (textarea.selectionEnd >= counter && textarea.selectionEnd < counter + lineLength) {
        textarea.selectionEnd = counter + lineLength - 1;
      }
      counter += lineLength;
    }
  }
  function expandSelectedText(textarea, prefixToUse, suffixToUse, multiline = false) {
    if (textarea.selectionStart === textarea.selectionEnd) {
      textarea.selectionStart = wordSelectionStart(textarea.value, textarea.selectionStart);
      textarea.selectionEnd = wordSelectionEnd(textarea.value, textarea.selectionEnd, multiline);
    } else {
      const expandedSelectionStart = textarea.selectionStart - prefixToUse.length;
      const expandedSelectionEnd = textarea.selectionEnd + suffixToUse.length;
      const beginsWithPrefix = textarea.value.slice(expandedSelectionStart, textarea.selectionStart) === prefixToUse;
      const endsWithSuffix = textarea.value.slice(textarea.selectionEnd, expandedSelectionEnd) === suffixToUse;
      if (beginsWithPrefix && endsWithSuffix) {
        textarea.selectionStart = expandedSelectionStart;
        textarea.selectionEnd = expandedSelectionEnd;
      }
    }
    return textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
  }
  function newlinesToSurroundSelectedText(textarea) {
    const beforeSelection = textarea.value.slice(0, textarea.selectionStart);
    const afterSelection = textarea.value.slice(textarea.selectionEnd);
    const breaksBefore = beforeSelection.match(/\n*$/);
    const breaksAfter = afterSelection.match(/^\n*/);
    const newlinesBeforeSelection = breaksBefore ? breaksBefore[0].length : 0;
    const newlinesAfterSelection = breaksAfter ? breaksAfter[0].length : 0;
    let newlinesToAppend;
    let newlinesToPrepend;
    if (beforeSelection.match(/\S/) && newlinesBeforeSelection < 2) {
      newlinesToAppend = repeat("\n", 2 - newlinesBeforeSelection);
    }
    if (afterSelection.match(/\S/) && newlinesAfterSelection < 2) {
      newlinesToPrepend = repeat("\n", 2 - newlinesAfterSelection);
    }
    if (newlinesToAppend == null) {
      newlinesToAppend = "";
    }
    if (newlinesToPrepend == null) {
      newlinesToPrepend = "";
    }
    return { newlinesToAppend, newlinesToPrepend };
  }
  function preserveSelection(textarea, callback) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop;
    callback();
    textarea.selectionStart = start;
    textarea.selectionEnd = end;
    textarea.scrollTop = scrollTop;
  }
  function insertText(textarea, { text, selectionStart, selectionEnd }) {
    const originalSelectionStart = textarea.selectionStart;
    const before = textarea.value.slice(0, originalSelectionStart);
    const after = textarea.value.slice(textarea.selectionEnd);
    if (canInsertText === null || canInsertText === true) {
      textarea.contentEditable = "true";
      try {
        canInsertText = document.execCommand("insertText", false, text);
      } catch (error) {
        canInsertText = false;
      }
      textarea.contentEditable = "false";
    }
    if (canInsertText && !textarea.value.slice(0, textarea.selectionStart).endsWith(text)) {
      canInsertText = false;
    }
    if (!canInsertText) {
      try {
        document.execCommand("ms-beginUndoUnit");
      } catch (e) {
      }
      textarea.value = before + text + after;
      try {
        document.execCommand("ms-endUndoUnit");
      } catch (e) {
      }
      textarea.dispatchEvent(new CustomEvent("input", { bubbles: true, cancelable: true }));
    }
    if (selectionStart != null && selectionEnd != null) {
      textarea.setSelectionRange(selectionStart, selectionEnd);
    } else {
      textarea.setSelectionRange(originalSelectionStart, textarea.selectionEnd);
    }
  }
  function setUndoMethod(method) {
    if (method === "native") {
      canInsertText = true;
    } else if (method === "manual") {
      canInsertText = false;
    } else {
      canInsertText = null;
    }
  }
  function blockStyle(textarea, arg) {
    let newlinesToAppend;
    let newlinesToPrepend;
    const { prefix, suffix, blockPrefix, blockSuffix, replaceNext, prefixSpace, scanFor, surroundWithNewlines } = arg;
    const originalSelectionStart = textarea.selectionStart;
    const originalSelectionEnd = textarea.selectionEnd;
    let selectedText = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    let prefixToUse = isMultipleLines(selectedText) && blockPrefix.length > 0 ? `${blockPrefix}
` : prefix;
    let suffixToUse = isMultipleLines(selectedText) && blockSuffix.length > 0 ? `
${blockSuffix}` : suffix;
    if (prefixSpace) {
      const beforeSelection = textarea.value[textarea.selectionStart - 1];
      if (textarea.selectionStart !== 0 && beforeSelection != null && !beforeSelection.match(/\s/)) {
        prefixToUse = ` ${prefixToUse}`;
      }
    }
    selectedText = expandSelectedText(textarea, prefixToUse, suffixToUse, arg.multiline);
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    const hasReplaceNext = replaceNext.length > 0 && suffixToUse.indexOf(replaceNext) > -1 && selectedText.length > 0;
    if (surroundWithNewlines) {
      const ref = newlinesToSurroundSelectedText(textarea);
      newlinesToAppend = ref.newlinesToAppend;
      newlinesToPrepend = ref.newlinesToPrepend;
      prefixToUse = newlinesToAppend + prefix;
      suffixToUse += newlinesToPrepend;
    }
    if (selectedText.startsWith(prefixToUse) && selectedText.endsWith(suffixToUse)) {
      const replacementText = selectedText.slice(prefixToUse.length, selectedText.length - suffixToUse.length);
      if (originalSelectionStart === originalSelectionEnd) {
        let position = originalSelectionStart - prefixToUse.length;
        position = Math.max(position, selectionStart);
        position = Math.min(position, selectionStart + replacementText.length);
        selectionStart = selectionEnd = position;
      } else {
        selectionEnd = selectionStart + replacementText.length;
      }
      return { text: replacementText, selectionStart, selectionEnd };
    } else if (!hasReplaceNext) {
      let replacementText = prefixToUse + selectedText + suffixToUse;
      selectionStart = originalSelectionStart + prefixToUse.length;
      selectionEnd = originalSelectionEnd + prefixToUse.length;
      const whitespaceEdges = selectedText.match(/^\s*|\s*$/g);
      if (arg.trimFirst && whitespaceEdges) {
        const leadingWhitespace = whitespaceEdges[0] || "";
        const trailingWhitespace = whitespaceEdges[1] || "";
        replacementText = leadingWhitespace + prefixToUse + selectedText.trim() + suffixToUse + trailingWhitespace;
        selectionStart += leadingWhitespace.length;
        selectionEnd -= trailingWhitespace.length;
      }
      return { text: replacementText, selectionStart, selectionEnd };
    } else if (scanFor.length > 0 && selectedText.match(scanFor)) {
      suffixToUse = suffixToUse.replace(replaceNext, selectedText);
      const replacementText = prefixToUse + selectedText + suffixToUse;
      selectionStart = selectionEnd = selectionStart + prefixToUse.length;
      return { text: replacementText, selectionStart, selectionEnd };
    } else {
      const replacementText = prefixToUse + selectedText + suffixToUse;
      selectionStart = selectionStart + prefixToUse.length + selectedText.length + suffixToUse.indexOf(replaceNext);
      selectionEnd = selectionStart + replaceNext.length;
      return { text: replacementText, selectionStart, selectionEnd };
    }
  }
  function multilineStyle(textarea, arg) {
    const { prefix, suffix, surroundWithNewlines } = arg;
    let text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    const lines = text.split("\n");
    const undoStyle = lines.every((line) => line.startsWith(prefix) && line.endsWith(suffix));
    if (undoStyle) {
      text = lines.map((line) => line.slice(prefix.length, line.length - suffix.length)).join("\n");
      selectionEnd = selectionStart + text.length;
    } else {
      text = lines.map((line) => prefix + line + suffix).join("\n");
      if (surroundWithNewlines) {
        const { newlinesToAppend, newlinesToPrepend } = newlinesToSurroundSelectedText(textarea);
        selectionStart += newlinesToAppend.length;
        selectionEnd = selectionStart + text.length;
        text = newlinesToAppend + text + newlinesToPrepend;
      }
    }
    return { text, selectionStart, selectionEnd };
  }
  function undoOrderedListStyle(text) {
    const lines = text.split("\n");
    const orderedListRegex = /^\d+\.\s+/;
    const shouldUndoOrderedList = lines.every((line) => orderedListRegex.test(line));
    let result = lines;
    if (shouldUndoOrderedList) {
      result = lines.map((line) => line.replace(orderedListRegex, ""));
    }
    return {
      text: result.join("\n"),
      processed: shouldUndoOrderedList
    };
  }
  function undoUnorderedListStyle(text) {
    const lines = text.split("\n");
    const unorderedListPrefix = "- ";
    const shouldUndoUnorderedList = lines.every((line) => line.startsWith(unorderedListPrefix));
    let result = lines;
    if (shouldUndoUnorderedList) {
      result = lines.map((line) => line.slice(unorderedListPrefix.length, line.length));
    }
    return {
      text: result.join("\n"),
      processed: shouldUndoUnorderedList
    };
  }
  function makePrefix(index, unorderedList) {
    if (unorderedList) {
      return "- ";
    } else {
      return `${index + 1}. `;
    }
  }
  function clearExistingListStyle(style, selectedText) {
    let undoResultOpositeList;
    let undoResult;
    let pristineText;
    if (style.orderedList) {
      undoResult = undoOrderedListStyle(selectedText);
      undoResultOpositeList = undoUnorderedListStyle(undoResult.text);
      pristineText = undoResultOpositeList.text;
    } else {
      undoResult = undoUnorderedListStyle(selectedText);
      undoResultOpositeList = undoOrderedListStyle(undoResult.text);
      pristineText = undoResultOpositeList.text;
    }
    return [undoResult, undoResultOpositeList, pristineText];
  }
  function listStyle(textarea, style) {
    const noInitialSelection = textarea.selectionStart === textarea.selectionEnd;
    let selectionStart = textarea.selectionStart;
    let selectionEnd = textarea.selectionEnd;
    expandSelectionToLine(textarea);
    const selectedText = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    const [undoResult, undoResultOpositeList, pristineText] = clearExistingListStyle(style, selectedText);
    const prefixedLines = pristineText.split("\n").map((value, index) => {
      return `${makePrefix(index, style.unorderedList)}${value}`;
    });
    const totalPrefixLength = prefixedLines.reduce((previousValue, _currentValue, currentIndex) => {
      return previousValue + makePrefix(currentIndex, style.unorderedList).length;
    }, 0);
    const totalPrefixLengthOpositeList = prefixedLines.reduce((previousValue, _currentValue, currentIndex) => {
      return previousValue + makePrefix(currentIndex, !style.unorderedList).length;
    }, 0);
    if (undoResult.processed) {
      if (noInitialSelection) {
        selectionStart = Math.max(selectionStart - makePrefix(0, style.unorderedList).length, 0);
        selectionEnd = selectionStart;
      } else {
        selectionStart = textarea.selectionStart;
        selectionEnd = textarea.selectionEnd - totalPrefixLength;
      }
      return { text: pristineText, selectionStart, selectionEnd };
    }
    const { newlinesToAppend, newlinesToPrepend } = newlinesToSurroundSelectedText(textarea);
    const text = newlinesToAppend + prefixedLines.join("\n") + newlinesToPrepend;
    if (noInitialSelection) {
      selectionStart = Math.max(selectionStart + makePrefix(0, style.unorderedList).length + newlinesToAppend.length, 0);
      selectionEnd = selectionStart;
    } else {
      if (undoResultOpositeList.processed) {
        selectionStart = Math.max(textarea.selectionStart + newlinesToAppend.length, 0);
        selectionEnd = textarea.selectionEnd + newlinesToAppend.length + totalPrefixLength - totalPrefixLengthOpositeList;
      } else {
        selectionStart = Math.max(textarea.selectionStart + newlinesToAppend.length, 0);
        selectionEnd = textarea.selectionEnd + newlinesToAppend.length + totalPrefixLength;
      }
    }
    return { text, selectionStart, selectionEnd };
  }
  function styleSelectedText(textarea, styleArgs) {
    const text = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    let result;
    if (styleArgs.orderedList || styleArgs.unorderedList) {
      result = listStyle(textarea, styleArgs);
    } else if (styleArgs.multiline && isMultipleLines(text)) {
      result = multilineStyle(textarea, styleArgs);
    } else {
      result = blockStyle(textarea, styleArgs);
    }
    insertText(textarea, result);
  }
  function getActiveFormats(textarea) {
    if (!textarea)
      return [];
    const formats = [];
    const { selectionStart, selectionEnd, value } = textarea;
    const lines = value.split("\n");
    let lineStart = 0;
    let currentLine = "";
    for (const line of lines) {
      if (selectionStart >= lineStart && selectionStart <= lineStart + line.length) {
        currentLine = line;
        break;
      }
      lineStart += line.length + 1;
    }
    if (currentLine.startsWith("- ")) {
      if (currentLine.startsWith("- [ ] ") || currentLine.startsWith("- [x] ")) {
        formats.push("task-list");
      } else {
        formats.push("bullet-list");
      }
    }
    if (/^\d+\.\s/.test(currentLine)) {
      formats.push("numbered-list");
    }
    if (currentLine.startsWith("> ")) {
      formats.push("quote");
    }
    if (currentLine.startsWith("# "))
      formats.push("header");
    if (currentLine.startsWith("## "))
      formats.push("header-2");
    if (currentLine.startsWith("### "))
      formats.push("header-3");
    const lookBehind = Math.max(0, selectionStart - 10);
    const lookAhead = Math.min(value.length, selectionEnd + 10);
    const surrounding = value.slice(lookBehind, lookAhead);
    if (surrounding.includes("**")) {
      const beforeCursor = value.slice(Math.max(0, selectionStart - 100), selectionStart);
      const afterCursor = value.slice(selectionEnd, Math.min(value.length, selectionEnd + 100));
      const lastOpenBold = beforeCursor.lastIndexOf("**");
      const nextCloseBold = afterCursor.indexOf("**");
      if (lastOpenBold !== -1 && nextCloseBold !== -1) {
        formats.push("bold");
      }
    }
    if (surrounding.includes("_")) {
      const beforeCursor = value.slice(Math.max(0, selectionStart - 100), selectionStart);
      const afterCursor = value.slice(selectionEnd, Math.min(value.length, selectionEnd + 100));
      const lastOpenItalic = beforeCursor.lastIndexOf("_");
      const nextCloseItalic = afterCursor.indexOf("_");
      if (lastOpenItalic !== -1 && nextCloseItalic !== -1) {
        formats.push("italic");
      }
    }
    if (surrounding.includes("`")) {
      const beforeCursor = value.slice(Math.max(0, selectionStart - 100), selectionStart);
      const afterCursor = value.slice(selectionEnd, Math.min(value.length, selectionEnd + 100));
      if (beforeCursor.includes("`") && afterCursor.includes("`")) {
        formats.push("code");
      }
    }
    if (surrounding.includes("[") && surrounding.includes("]")) {
      const beforeCursor = value.slice(Math.max(0, selectionStart - 100), selectionStart);
      const afterCursor = value.slice(selectionEnd, Math.min(value.length, selectionEnd + 100));
      const lastOpenBracket = beforeCursor.lastIndexOf("[");
      const nextCloseBracket = afterCursor.indexOf("]");
      if (lastOpenBracket !== -1 && nextCloseBracket !== -1) {
        const afterBracket = value.slice(selectionEnd + nextCloseBracket + 1, selectionEnd + nextCloseBracket + 10);
        if (afterBracket.startsWith("(")) {
          formats.push("link");
        }
      }
    }
    return formats;
  }
  function hasFormat(textarea, format) {
    const activeFormats = getActiveFormats(textarea);
    return activeFormats.includes(format);
  }
  function applyStyle(textarea, format) {
    const style = mergeStyleWithDefaults(format);
    textarea.focus();
    styleSelectedText(textarea, style);
  }
  function toggleBold(textarea) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, FORMATS2.bold);
  }
  function toggleItalic(textarea) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, FORMATS2.italic);
  }
  function toggleCode(textarea) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, FORMATS2.code);
  }
  function insertLink(textarea, options = {}) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    let format = __spreadValues({}, FORMATS2.link);
    if (options.url) {
      format.suffix = `](${options.url})`;
      format.replaceNext = "";
    }
    if (options.text && !textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)) {
      const pos = textarea.selectionStart;
      textarea.value = textarea.value.slice(0, pos) + options.text + textarea.value.slice(pos);
      textarea.selectionStart = pos;
      textarea.selectionEnd = pos + options.text.length;
    }
    applyStyle(textarea, format);
  }
  function toggleBulletList(textarea) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, FORMATS2.bulletList);
  }
  function toggleNumberedList(textarea) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, FORMATS2.numberedList);
  }
  function toggleQuote(textarea) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, FORMATS2.quote);
  }
  function insertHeader(textarea, level = 1) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    if (level < 1 || level > 6)
      level = 1;
    const headerKey = `header${level}`;
    const format = FORMATS2[headerKey] || FORMATS2.header1;
    const value = textarea.value;
    const start = textarea.selectionStart;
    let lineStart = start;
    let lineEnd = start;
    while (lineStart > 0 && value[lineStart - 1] !== "\n") {
      lineStart--;
    }
    while (lineEnd < value.length && value[lineEnd] !== "\n") {
      lineEnd++;
    }
    textarea.selectionStart = lineStart;
    textarea.selectionEnd = lineEnd;
    const currentLine = value.slice(lineStart, lineEnd);
    const cleanedLine = currentLine.replace(/^#{1,6}\s*/, "");
    const newLine = format.prefix + cleanedLine;
    const tempSelection = textarea.selectionStart;
    textarea.value = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
    textarea.selectionStart = lineStart + format.prefix.length;
    textarea.selectionEnd = lineStart + newLine.length;
  }
  function getActiveFormats2(textarea) {
    return getActiveFormats(textarea);
  }
  function hasFormat2(textarea, format) {
    return hasFormat(textarea, format);
  }
  function expandSelection(textarea, options = {}) {
    if (!textarea)
      return;
    const { toWord, toLine } = options;
    const { selectionStart, selectionEnd, value } = textarea;
    if (toLine) {
      expandSelectionToLine(textarea);
    } else if (toWord && selectionStart === selectionEnd) {
      let start = selectionStart;
      let end = selectionEnd;
      while (start > 0 && !/\s/.test(value[start - 1])) {
        start--;
      }
      while (end < value.length && !/\s/.test(value[end])) {
        end++;
      }
      textarea.selectionStart = start;
      textarea.selectionEnd = end;
    }
  }
  function applyCustomFormat(textarea, format) {
    if (!textarea || textarea.disabled || textarea.readOnly)
      return;
    applyStyle(textarea, format);
  }
  var __defProp2, __getOwnPropSymbols, __hasOwnProp2, __propIsEnum, __defNormalProp2, __spreadValues, canInsertText, FORMATS2, index_new_default;
  var init_markdown_actions_esm = __esm({
    "../markdown-actions/dist/markdown-actions.esm.js"() {
      __defProp2 = Object.defineProperty;
      __getOwnPropSymbols = Object.getOwnPropertySymbols;
      __hasOwnProp2 = Object.prototype.hasOwnProperty;
      __propIsEnum = Object.prototype.propertyIsEnumerable;
      __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
      __spreadValues = (a, b) => {
        for (var prop in b || (b = {}))
          if (__hasOwnProp2.call(b, prop))
            __defNormalProp2(a, prop, b[prop]);
        if (__getOwnPropSymbols)
          for (var prop of __getOwnPropSymbols(b)) {
            if (__propIsEnum.call(b, prop))
              __defNormalProp2(a, prop, b[prop]);
          }
        return a;
      };
      canInsertText = null;
      FORMATS2 = {
        bold: { prefix: "**", suffix: "**", trimFirst: true },
        italic: { prefix: "_", suffix: "_", trimFirst: true },
        code: {
          prefix: "`",
          suffix: "`",
          blockPrefix: "```",
          blockSuffix: "```"
        },
        link: {
          prefix: "[",
          suffix: "](url)",
          replaceNext: "url",
          scanFor: "https?://"
        },
        quote: {
          prefix: "> ",
          multiline: true,
          surroundWithNewlines: true
        },
        bulletList: {
          prefix: "- ",
          multiline: true,
          unorderedList: true
        },
        numberedList: {
          prefix: "1. ",
          multiline: true,
          orderedList: true
        },
        header1: { prefix: "# " },
        header2: { prefix: "## " },
        header3: { prefix: "### " },
        header4: { prefix: "#### " },
        header5: { prefix: "##### " },
        header6: { prefix: "###### " }
      };
      index_new_default = {
        toggleBold,
        toggleItalic,
        toggleCode,
        insertLink,
        toggleBulletList,
        toggleNumberedList,
        toggleQuote,
        insertHeader,
        getActiveFormats: getActiveFormats2,
        hasFormat: hasFormat2,
        expandSelection,
        applyCustomFormat,
        preserveSelection,
        setUndoMethod
      };
    }
  });

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
      codeBg: "rgba(244, 211, 94, 0.4)",
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
      font-size: var(--instance-font-size, ${fontSize}) !important;
      line-height: var(--instance-line-height, ${lineHeight}) !important;
      font-weight: normal !important;
      font-style: normal !important;
      font-variant: normal !important;
      font-stretch: normal !important;
      font-kerning: none !important;
      font-feature-settings: normal !important;
      
      /* Box model - must match exactly */
      padding: var(--instance-padding, ${padding}) !important;
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
      background: var(--code-bg, rgba(244, 211, 94, 0.4)) !important;
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

    /* Code fence markers - with background when not in code block */
    .overtype-wrapper .overtype-preview .code-fence {
      color: var(--code, #0d3b66) !important;
      background: var(--code-bg, rgba(244, 211, 94, 0.4)) !important;
    }
    
    /* Code block lines - background for entire code block */
    .overtype-wrapper .overtype-preview .code-block-line {
      background: var(--code-bg, rgba(244, 211, 94, 0.4)) !important;
    }
    
    /* Remove background from code fence when inside code block line */
    .overtype-wrapper .overtype-preview .code-block-line .code-fence {
      background: transparent !important;
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

    /* Toolbar Styles */
    .overtype-toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px;
      background: var(--bg-primary, #f8f9fa);
      border: 1px solid var(--border, #e0e0e0);
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .overtype-toolbar-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary, #666);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .overtype-toolbar-button svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
    
    /* Special sizing for code block icon */
    .overtype-toolbar-button[data-action="insertCodeBlock"] svg {
      width: 24px;
      height: 18px;
      fill: transparent !important;
    }

    .overtype-toolbar-button:hover {
      background: var(--bg-secondary, #e9ecef);
      color: var(--text-primary, #333);
    }

    .overtype-toolbar-button:active {
      transform: scale(0.95);
    }

    .overtype-toolbar-button.active {
      background: var(--primary, #007bff);
      color: white;
    }

    .overtype-toolbar-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .overtype-toolbar-separator {
      width: 1px;
      height: 24px;
      background: var(--border, #e0e0e0);
      margin: 0 4px;
      flex-shrink: 0;
    }

    /* Adjust wrapper when toolbar is present */
    .overtype-toolbar + .overtype-wrapper {
      border-radius: 0 0 8px 8px;
      border-top: none;
    }

    /* Mobile toolbar adjustments */
    @media (max-width: 640px) {
      .overtype-toolbar {
        padding: 6px;
        gap: 2px;
      }

      .overtype-toolbar-button {
        width: 36px;
        height: 36px;
      }

      .overtype-toolbar-separator {
        margin: 0 2px;
      }
    }

    ${mobileStyles}
  `;
  }

  // src/icons.js
  var boldIcon = `<svg viewBox="0 0 18 18">
  <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z"></path>
  <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z"></path>
</svg>`;
  var italicIcon = `<svg viewBox="0 0 18 18">
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7" x2="13" y1="4" y2="4"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="5" x2="11" y1="14" y2="14"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="8" x2="10" y1="14" y2="4"></line>
</svg>`;
  var h1Icon = `<svg viewBox="0 0 18 18">
  <path fill="currentColor" d="M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z"></path>
</svg>`;
  var h2Icon = `<svg viewBox="0 0 18 18">
  <path fill="currentColor" d="M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"></path>
</svg>`;
  var h3Icon = `<svg viewBox="0 0 18 18">
  <path fill="currentColor" d="M16.65186,12.30664a2.6742,2.6742,0,0,1-2.915,2.68457,3.96592,3.96592,0,0,1-2.25537-.6709.56007.56007,0,0,1-.13232-.83594L11.64648,13c.209-.34082.48389-.36328.82471-.1543a2.32654,2.32654,0,0,0,1.12256.33008c.71484,0,1.12207-.35156,1.12207-.78125,0-.61523-.61621-.86816-1.46338-.86816H13.2085a.65159.65159,0,0,1-.68213-.41895l-.05518-.10937a.67114.67114,0,0,1,.14307-.78125l.71533-.86914a8.55289,8.55289,0,0,1,.68213-.7373V8.58887a3.93913,3.93913,0,0,1-.748.05469H11.9873a.54085.54085,0,0,1-.605-.60547V7.59863a.54085.54085,0,0,1,.605-.60547h3.75146a.53773.53773,0,0,1,.60547.59375v.17676a1.03723,1.03723,0,0,1-.27539.748L14.74854,10.0293A2.31132,2.31132,0,0,1,16.65186,12.30664ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"></path>
</svg>`;
  var linkIcon = `<svg viewBox="0 0 18 18">
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7" x2="11" y1="7" y2="11"></line>
  <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"></path>
  <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"></path>
</svg>`;
  var codeIcon = `<svg viewBox="0 0 18 18">
  <polyline stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="5 7 3 9 5 11"></polyline>
  <polyline stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="13 7 15 9 13 11"></polyline>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="10" x2="8" y1="5" y2="13"></line>
</svg>`;
  var codeBlockIcon = `<svg viewBox="0 0 46 33" fill="transparent" xmlns="http://www.w3.org/2000/svg">
  <path d="M35 8h3a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5v-2" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
  <path d="m9 2.5-6 6L9 14M20 2.5l6 6-6 5.5" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`;
  var bulletListIcon = `<svg viewBox="0 0 18 18">
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="6" x2="15" y1="4" y2="4"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="6" x2="15" y1="9" y2="9"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="6" x2="15" y1="14" y2="14"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="3" x2="3" y1="4" y2="4"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="3" x2="3" y1="9" y2="9"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="3" x2="3" y1="14" y2="14"></line>
</svg>`;
  var orderedListIcon = `<svg viewBox="0 0 18 18">
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7" x2="15" y1="4" y2="4"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7" x2="15" y1="9" y2="9"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="7" x2="15" y1="14" y2="14"></line>
  <line stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" x1="2.5" x2="4.5" y1="5.5" y2="5.5"></line>
  <path fill="currentColor" d="M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z"></path>
  <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156"></path>
  <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109"></path>
</svg>`;

  // src/toolbar.js
  var Toolbar = class {
    constructor(editor) {
      this.editor = editor;
      this.container = null;
      this.buttons = {};
    }
    /**
     * Create and attach toolbar to editor
     */
    create() {
      this.container = document.createElement("div");
      this.container.className = "overtype-toolbar";
      this.container.setAttribute("role", "toolbar");
      this.container.setAttribute("aria-label", "Text formatting");
      const buttonConfig = [
        { name: "bold", icon: boldIcon, title: "Bold (Ctrl+B)", action: "toggleBold" },
        { name: "italic", icon: italicIcon, title: "Italic (Ctrl+I)", action: "toggleItalic" },
        { separator: true },
        { name: "h1", icon: h1Icon, title: "Heading 1", action: "insertH1" },
        { name: "h2", icon: h2Icon, title: "Heading 2", action: "insertH2" },
        { name: "h3", icon: h3Icon, title: "Heading 3", action: "insertH3" },
        { separator: true },
        { name: "link", icon: linkIcon, title: "Insert Link (Ctrl+K)", action: "insertLink" },
        { name: "code", icon: codeIcon, title: "Inline Code", action: "toggleCode" },
        { name: "codeBlock", icon: codeBlockIcon, title: "Code Block", action: "insertCodeBlock" },
        { separator: true },
        { name: "bulletList", icon: bulletListIcon, title: "Bullet List", action: "toggleBulletList" },
        { name: "orderedList", icon: orderedListIcon, title: "Numbered List", action: "toggleNumberedList" }
      ];
      buttonConfig.forEach((config) => {
        if (config.separator) {
          const separator = document.createElement("div");
          separator.className = "overtype-toolbar-separator";
          separator.setAttribute("role", "separator");
          this.container.appendChild(separator);
        } else {
          const button = this.createButton(config);
          this.buttons[config.name] = button;
          this.container.appendChild(button);
        }
      });
      const wrapper = this.editor.element.querySelector(".overtype-wrapper");
      if (wrapper) {
        this.editor.element.insertBefore(this.container, wrapper);
      }
      return this.container;
    }
    /**
     * Create individual toolbar button
     */
    createButton(config) {
      const button = document.createElement("button");
      button.className = "overtype-toolbar-button";
      button.type = "button";
      button.title = config.title;
      button.setAttribute("aria-label", config.title);
      button.setAttribute("data-action", config.action);
      button.innerHTML = config.icon;
      button.addEventListener("click", (e) => {
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
      if (!textarea)
        return;
      textarea.focus();
      try {
        let markdownActions;
        try {
          markdownActions = await Promise.resolve().then(() => (init_markdown_actions_esm(), markdown_actions_esm_exports));
        } catch (e) {
          if (window.markdownActions) {
            markdownActions = window.markdownActions;
          } else {
            throw new Error("markdown-actions not available");
          }
        }
        switch (action) {
          case "toggleBold":
            markdownActions.toggleBold(textarea);
            break;
          case "toggleItalic":
            markdownActions.toggleItalic(textarea);
            break;
          case "insertH1":
            markdownActions.insertHeader(textarea, 1);
            break;
          case "insertH2":
            markdownActions.insertHeader(textarea, 2);
            break;
          case "insertH3":
            markdownActions.insertHeader(textarea, 3);
            break;
          case "insertLink":
            markdownActions.insertLink(textarea);
            break;
          case "toggleCode":
            markdownActions.toggleCode(textarea);
            break;
          case "insertCodeBlock":
            markdownActions.insertCodeBlock(textarea);
            break;
          case "toggleBulletList":
            markdownActions.toggleBulletList(textarea);
            break;
          case "toggleNumberedList":
            markdownActions.toggleNumberedList(textarea);
            break;
        }
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      } catch (error) {
        console.error("Error loading markdown-actions:", error);
      }
    }
    /**
     * Update toolbar button states based on current selection
     */
    async updateButtonStates() {
      const textarea = this.editor.textarea;
      if (!textarea)
        return;
      try {
        let markdownActions;
        try {
          markdownActions = await Promise.resolve().then(() => (init_markdown_actions_esm(), markdown_actions_esm_exports));
        } catch (e) {
          if (window.markdownActions) {
            markdownActions = window.markdownActions;
          } else {
            return;
          }
        }
        const activeFormats = markdownActions.getActiveFormats(textarea);
        Object.entries(this.buttons).forEach(([name, button]) => {
          let isActive = false;
          switch (name) {
            case "bold":
              isActive = activeFormats.includes("bold");
              break;
            case "italic":
              isActive = activeFormats.includes("italic");
              break;
            case "code":
              isActive = activeFormats.includes("code");
              break;
            case "bulletList":
              isActive = activeFormats.includes("bulletList");
              break;
            case "orderedList":
              isActive = activeFormats.includes("orderedList");
              break;
            case "h1":
              isActive = activeFormats.includes("header1");
              break;
            case "h2":
              isActive = activeFormats.includes("header2");
              break;
            case "h3":
              isActive = activeFormats.includes("header3");
              break;
          }
          button.classList.toggle("active", isActive);
          button.setAttribute("aria-pressed", isActive.toString());
        });
      } catch (error) {
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
  };

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
      if (this.options.toolbar) {
        this.toolbar = new Toolbar(this);
        this.toolbar.create();
        this.textarea.addEventListener("selectionchange", () => {
          this.toolbar.updateButtonStates();
        });
        this.textarea.addEventListener("input", () => {
          this.toolbar.updateButtonStates();
        });
      }
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
        toolbar: false,
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
      if (this.options.fontSize) {
        this.wrapper.style.setProperty("--instance-font-size", this.options.fontSize);
      }
      if (this.options.lineHeight) {
        this.wrapper.style.setProperty("--instance-line-height", String(this.options.lineHeight));
      }
      if (this.options.padding) {
        this.wrapper.style.setProperty("--instance-padding", this.options.padding);
      }
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
      if (this.options.fontSize) {
        this.wrapper.style.setProperty("--instance-font-size", this.options.fontSize);
      }
      if (this.options.lineHeight) {
        this.wrapper.style.setProperty("--instance-line-height", String(this.options.lineHeight));
      }
      if (this.options.padding) {
        this.wrapper.style.setProperty("--instance-padding", this.options.padding);
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
        openParent.classList.add("code-block-line");
        closeParent.classList.add("code-block-line");
        let currentDiv = openParent.nextElementSibling;
        while (currentDiv && currentDiv !== closeParent) {
          if (currentDiv.tagName === "DIV") {
            currentDiv.classList.add("code-block-line");
          }
          currentDiv = currentDiv.nextElementSibling;
          if (!currentDiv)
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
        if (e.target && e.target.classList && e.target.classList.contains("overtype-input")) {
          const wrapper = e.target.closest(".overtype-wrapper");
          const instance = wrapper == null ? void 0 : wrapper._instance;
          if (instance)
            instance.handleInput(e);
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.target && e.target.classList && e.target.classList.contains("overtype-input")) {
          const wrapper = e.target.closest(".overtype-wrapper");
          const instance = wrapper == null ? void 0 : wrapper._instance;
          if (instance)
            instance.handleKeydown(e);
        }
      });
      document.addEventListener("scroll", (e) => {
        if (e.target && e.target.classList && e.target.classList.contains("overtype-input")) {
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
window.OverType = OverType.OverType || OverType.default || OverType;
//# sourceMappingURL=overtype.js.map
