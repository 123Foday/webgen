const makeElement = ({ type, name, styles = {}, content = [], id = null }) => ({
  id: id || crypto.randomUUID(),
  name,
  type,
  styles,
  content,
});

const isDomNode = (value) =>
  !!value && typeof value === 'object' && typeof value.nodeType === 'number';

const getTag = (node) => {
  if (!node) return '';
  if (isDomNode(node)) return node.tagName ? node.tagName.toLowerCase() : '';
  return typeof node.tag === 'string' ? node.tag.toLowerCase() : '';
};

const getChildren = (node) => {
  if (!node) return [];
  if (isDomNode(node)) return Array.from(node.children || []);
  return Array.isArray(node.children) ? node.children : [];
};

const getAttributes = (node) => {
  if (!node) return {};
  if (isDomNode(node)) {
    const attrs = {};
    for (const attr of node.attributes || []) attrs[attr.name] = attr.value;
    return attrs;
  }
  return node.attrs || {};
};

const toInnerText = (node) => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (isDomNode(node)) {
    if (node.nodeType === 3) return node.textContent || '';
    if (node.nodeType === 1)
      return Array.from(node.childNodes).map(toInnerText).join('').trim();
    return '';
  }
  if (node.text) return String(node.text);
  if (Array.isArray(node.children))
    return node.children.map(toInnerText).join('').trim();
  return '';
};

// ── CSS parser ───────────────────────────────────────────────────────────────

const buildStyleObject = (styleString = '') => {
  const style = {};
  if (!styleString) return style;
  styleString.split(';').forEach((piece) => {
    const clean = piece.trim();
    if (!clean) return;
    const colonIdx = clean.indexOf(':');
    if (colonIdx === -1) return;
    const key = clean.slice(0, colonIdx).trim();
    const value = clean.slice(colonIdx + 1).trim();
    if (!key || !value) return;
    // Convert kebab-case to camelCase
    const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    style[camel] = value;
  });
  return style;
};

// Parse <style> block into a map of { className: stylesObject }
const parseStylesheet = (htmlString) => {
  const classMap = {};
  const styleMatch = htmlString.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch) return classMap;

  const css = styleMatch[1];
  // Match .classname { ... } blocks — handles multiple classes and basic selectors
  const rulePattern = /([.#][^{,]+(?:,[.#][^{,]+)*)\s*\{([^}]*)\}/g;
  let match;
  while ((match = rulePattern.exec(css)) !== null) {
    const selectors = match[1].split(',');
    const styles = buildStyleObject(match[2]);
    for (const selector of selectors) {
      const trimmed = selector.trim();
      // Only handle simple class selectors for now
      if (trimmed.startsWith('.')) {
        const className = trimmed.slice(1).trim();
        classMap[className] = { ...(classMap[className] || {}), ...styles };
      }
    }
  }
  return classMap;
};

// Resolve all classes on an element against the stylesheet map
const resolveStyles = (node, classMap) => {
  const attrs = getAttributes(node);
  const inlineStyles = buildStyleObject(attrs.style || '');
  const classNames = (attrs.class || '').split(/\s+/).filter(Boolean);
  let resolved = {};
  for (const cls of classNames) {
    if (classMap[cls]) resolved = { ...resolved, ...classMap[cls] };
  }
  // Inline styles override class styles
  return { ...resolved, ...inlineStyles };
};

// ── Element builder ───────────────────────────────────────────────────────────

const buildElementFromHtml = (node, classMap) => {
  if (!node) return null;
  if (typeof node === 'string') return null;

  const tag = getTag(node);
  if (!tag || tag === '#text') return null;

  // Skip non-visual tags
  if (['script', 'style', 'meta', 'link', 'noscript', 'head'].includes(tag)) return null;

  const attrs = getAttributes(node);
  const style = resolveStyles(node, classMap);

  if (['h1','h2','h3','h4','h5','h6'].includes(tag)) {
    return makeElement({
      type: 'heading',
      name: `Heading`,
      styles: style,
      content: { innerText: toInnerText(node), level: tag },
    });
  }

  if (tag === 'p' || tag === 'span' || tag === 'label') {
    const text = toInnerText(node);
    if (!text) return null;
    return makeElement({
      type: 'text',
      name: 'Text',
      styles: style,
      content: { innerText: text },
    });
  }

  if (tag === 'a') {
    const children = getChildren(node);
    // If anchor contains only text treat as link, otherwise treat as container
    if (children.length === 0 || (children.length === 1 && getTag(children[0]) === '#text')) {
      return makeElement({
        type: 'link',
        name: 'Link',
        styles: style,
        content: { innerText: toInnerText(node), href: attrs.href || '#' },
      });
    }
    // Anchor wrapping other elements — treat as button if it looks like a CTA
    return makeElement({
      type: 'button',
      name: 'Button',
      styles: style,
      content: { innerText: toInnerText(node), href: attrs.href || '#' },
    });
  }

  if (tag === 'button' || tag === 'input' && attrs.type === 'submit') {
    return makeElement({
      type: 'button',
      name: 'Button',
      styles: style,
      content: { innerText: toInnerText(node) || attrs.value || 'Button', href: attrs.href || '#' },
    });
  }

  if (tag === 'img') {
    return makeElement({
      type: 'image',
      name: 'Image',
      styles: { ...style, width: style.width || '100%' },
      content: { src: attrs.src || '', alt: attrs.alt || '' },
    });
  }

  if (tag === 'iframe') {
    return makeElement({
      type: 'video',
      name: 'Video',
      styles: { ...style, width: style.width || '100%', height: style.height || '315px' },
      content: { src: attrs.src || '' },
    });
  }

  if (tag === 'ul' || tag === 'ol') {
    const items = getChildren(node)
      .filter(child => getTag(child) === 'li')
      .map(li => toInnerText(li))
      .filter(Boolean);
    if (!items.length) return null;
    return makeElement({
      type: 'list',
      name: tag === 'ol' ? 'Ordered List' : 'List',
      styles: style,
      content: { ordered: tag === 'ol', items },
    });
  }

  if (tag === 'hr') {
    return makeElement({
      type: 'divider',
      name: 'Divider',
      styles: {
        width: '100%',
        marginTop: style.marginTop || '16px',
        marginBottom: style.marginBottom || '16px',
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: style.borderColor || 'rgba(255,255,255,0.1)',
        ...style,
      },
      content: {},
    });
  }

  if (tag === 'table') {
    const headers = getChildren(node)
      .filter(child => getTag(child) === 'thead')
      .flatMap(thead => getChildren(thead).filter(row => getTag(row) === 'tr'))
      .flatMap(row => getChildren(row).filter(cell => ['th','td'].includes(getTag(cell))))
      .map(cell => toInnerText(cell));

    const rows = getChildren(node)
      .filter(child => getTag(child) === 'tbody')
      .flatMap(tbody => getChildren(tbody).filter(row => getTag(row) === 'tr'))
      .map(row =>
        getChildren(row)
          .filter(cell => ['td','th'].includes(getTag(cell)))
          .map(cell => toInnerText(cell))
      );

    return makeElement({
      type: 'table',
      name: 'Table',
      styles: style,
      content: {
        headers: JSON.stringify(headers),
        rows: JSON.stringify(rows),
        striped: 'true',
        headerBg: 'rgba(255,255,255,0.06)',
      },
    });
  }

  if (tag === 'pre' || tag === 'code') {
    return makeElement({
      type: 'code',
      name: 'Code Block',
      styles: style,
      content: { code: toInnerText(node), language: 'javascript' },
    });
  }

  if (tag === 'blockquote') {
    return makeElement({
      type: 'blockquote',
      name: 'Blockquote',
      styles: style,
      content: { text: toInnerText(node), author: '', accentColor: '#6366f1' },
    });
  }

  // ── Structural containers ─────────────────────────────────────────────────
  const structuralTags = ['div','section','main','header','footer','article','aside','nav','form','body'];
  if (structuralTags.includes(tag)) {
    const childElements = Array.from(
      isDomNode(node) ? node.childNodes : (node.children || [])
    )
      .map(child => {
        // Handle raw text nodes inside containers
        if (isDomNode(child) && child.nodeType === 3) {
          const text = (child.textContent || '').trim();
          if (!text) return null;
          return makeElement({
            type: 'text',
            name: 'Text',
            styles: {},
            content: { innerText: text },
          });
        }
        return buildElementFromHtml(child, classMap);
      })
      .filter(Boolean);

    // Skip empty structural wrappers
    if (!childElements.length && !toInnerText(node).trim()) return null;

    return makeElement({
      type: 'container',
      name: tag === 'nav' ? 'Nav' : tag === 'header' ? 'Header' : tag === 'footer' ? 'Footer' : tag === 'section' ? 'Section' : 'Container',
      styles: style,
      content: childElements,
    });
  }

  // Fallback — unknown tag with children, treat as container
  const fallbackChildren = getChildren(node)
    .map(child => buildElementFromHtml(child, classMap))
    .filter(Boolean);

  if (fallbackChildren.length) {
    return makeElement({
      type: 'container',
      name: 'Container',
      styles: style,
      content: fallbackChildren,
    });
  }

  // Unknown leaf element with text
  const text = toInnerText(node);
  if (text) {
    return makeElement({
      type: 'text',
      name: 'Text',
      styles: style,
      content: { innerText: text },
    });
  }

  return null;
};

// ── Main export ───────────────────────────────────────────────────────────────

export function htmlToEditorJson(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') {
    return [{
      id: '__body',
      name: 'Body',
      type: '__body',
      styles: { minHeight: '100vh' },
      content: [],
    }];
  }

  // Parse the stylesheet first
  const classMap = parseStylesheet(htmlString);

  let bodyNode;
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    bodyNode = doc.body;
  } else {
    // No DOMParser fallback needed in browser context
    console.warn('DOMParser not available');
    bodyNode = null;
  }

  if (!bodyNode) {
    return [{
      id: '__body',
      name: 'Body',
      type: '__body',
      styles: { minHeight: '100vh' },
      content: [],
    }];
  }

  // Build elements from body children
  const elements = Array.from(bodyNode.childNodes)
    .map(node => {
      // Handle top-level text nodes
      if (node.nodeType === 3) {
        const text = (node.textContent || '').trim();
        if (!text) return null;
        return makeElement({ type: 'text', name: 'Text', styles: {}, content: { innerText: text } });
      }
      return buildElementFromHtml(node, classMap);
    })
    .filter(Boolean);

  return [{
    id: '__body',
    name: 'Body',
    type: '__body',
    styles: { minHeight: '100vh', backgroundColor: '#08090a', color: '#ffffff' },
    content: elements,
  }];
}