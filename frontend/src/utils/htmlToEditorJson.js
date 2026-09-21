const makeElement = ({ type, name, styles = {}, content = [], id = null }) => ({
  id: id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `el-${Math.random().toString(16).slice(2)}`),
  name,
  type,
  styles,
  content,
});

const isDomNode = (value) => !!value && typeof value === 'object' && typeof value.nodeType === 'number';

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
    for (const attr of node.attributes || []) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }
  return node.attrs || {};
};

const toInnerText = (node) => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (isDomNode(node)) {
    if (node.nodeType === 3) return node.textContent || '';
    if (node.nodeType === 1) {
      return Array.from(node.childNodes)
        .map((child) => toInnerText(child))
        .join('')
        .trim();
    }
    return '';
  }

  if (node.text) return String(node.text);
  if (Array.isArray(node.children)) {
    return node.children.map((child) => toInnerText(child)).join('').trim();
  }
  return '';
};

const parseAttributes = (attrString = '') => {
  const attrs = {};
  const matches = attrString.matchAll(/([\w-]+)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g);
  for (const match of matches) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    attrs[name] = doubleQuoted ?? singleQuoted ?? unquoted ?? '';
  }
  return attrs;
};

const fallbackParseHtml = (htmlString) => {
  const root = { tag: 'body', children: [] };
  const stack = [root];
  const tagPattern = /<\/?([a-zA-Z0-9-]+)([^>]*)>/g;
  let lastIndex = 0;

  for (const match of htmlString.matchAll(tagPattern)) {
    const full = match[0];
    const tagName = match[1].toLowerCase();
    const before = htmlString.slice(lastIndex, match.index).trim();

    if (before) {
      const parent = stack[stack.length - 1];
      parent.children.push({ tag: '#text', text: before, attrs: {} });
    }

    const isClosing = full.startsWith('</');
    if (isClosing) {
      while (stack.length > 1) {
        const current = stack[stack.length - 1];
        stack.pop();
        if (current.tag === tagName) break;
      }
    } else {
      const isSelfClosing = /\/>$/.test(full) || ['img', 'br', 'hr', 'meta', 'link', 'input'].includes(tagName);
      const node = { tag: tagName, attrs: parseAttributes(match[2]), children: [] };
      stack[stack.length - 1].children.push(node);
      if (!isSelfClosing) stack.push(node);
    }

    lastIndex = match.index + full.length;
  }

  const tail = htmlString.slice(lastIndex).trim();
  if (tail) {
    stack[stack.length - 1].children.push({ tag: '#text', text: tail, attrs: {} });
  }

  return root;
};

const buildStyleObject = (styleString = '') => {
  const style = {};
  if (!styleString) return style;
  styleString.split(';').forEach((piece) => {
    const clean = piece.trim();
    if (!clean) return;
    const [key, ...rest] = clean.split(':');
    if (!key || !rest.length) return;
    style[key.trim()] = rest.join(':').trim();
  });
  return style;
};

const buildElementFromHtml = (node) => {
  if (!node) return null;
  if (typeof node === 'string') return null;

  const tag = getTag(node);
  const attrs = getAttributes(node);
  const style = buildStyleObject(attrs.style || '');
  const className = attrs.class || '';
  if (className) style.className = className;

  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    return makeElement({
      type: 'heading',
      name: `Heading ${tag.slice(1)}`,
      styles: style,
      content: { innerText: toInnerText(node), level: tag },
    });
  }

  if (tag === 'p') {
    return makeElement({
      type: 'text',
      name: 'Paragraph',
      styles: style,
      content: { innerText: toInnerText(node) },
    });
  }

  if (tag === 'a') {
    return makeElement({
      type: 'link',
      name: 'Link',
      styles: style,
      content: { innerText: toInnerText(node), href: attrs.href || '#' },
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

  if (tag === 'button') {
    return makeElement({
      type: 'button',
      name: 'Button',
      styles: style,
      content: { innerText: toInnerText(node), href: attrs.href || '#' },
    });
  }

  if (tag === 'ul' || tag === 'ol') {
    const items = getChildren(node)
      .filter((child) => getTag(child) === 'li')
      .map((li) => toInnerText(li));

    return makeElement({
      type: 'list',
      name: tag === 'ol' ? 'Ordered list' : 'List',
      styles: style,
      content: { ordered: tag === 'ol', items },
    });
  }

  if (tag === 'section' || tag === 'div' || tag === 'main' || tag === 'header' || tag === 'footer' || tag === 'article' || tag === 'aside' || tag === 'nav' || tag === 'body') {
    const childNodes = getChildren(node)
      .map((child) => buildElementFromHtml(child))
      .filter(Boolean);

    return makeElement({
      type: 'container',
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      styles: style,
      content: childNodes,
    });
  }

  if (tag === 'hr') {
    return makeElement({
      type: 'divider',
      name: 'Divider',
      styles: style,
      content: {},
    });
  }

  if (tag === 'table') {
    const rows = getChildren(node)
      .filter((child) => getTag(child) === 'tbody')
      .flatMap((tbody) => getChildren(tbody).filter((row) => getTag(row) === 'tr'))
      .map((row) => getChildren(row)
        .filter((cell) => ['td', 'th'].includes(getTag(cell)))
        .map((cell) => toInnerText(cell)));

    const headers = getChildren(node)
      .filter((child) => getTag(child) === 'thead')
      .flatMap((thead) => getChildren(thead).filter((row) => getTag(row) === 'tr'))
      .flatMap((row) => getChildren(row).filter((cell) => getTag(cell) === 'th'))
      .map((cell) => toInnerText(cell));

    return makeElement({
      type: 'table',
      name: 'Table',
      styles: style,
      content: {
        headers: JSON.stringify(headers),
        rows: JSON.stringify(rows),
      },
    });
  }

  if (tag === 'code' || tag === 'pre') {
    return makeElement({
      type: 'code',
      name: 'Code block',
      styles: style,
      content: { code: toInnerText(node), language: 'javascript' },
    });
  }

  if (tag === 'blockquote') {
    return makeElement({
      type: 'blockquote',
      name: 'Blockquote',
      styles: style,
      content: { text: toInnerText(node), author: '' },
    });
  }

  return null;
};

export function htmlToEditorJson(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') {
    return [{
      id: 'body',
      name: 'Body',
      type: '__body',
      styles: { minHeight: '100vh' },
      content: [],
    }];
  }

  let body = { tag: 'body', children: [] };

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    body = doc.body || doc.documentElement || body;
  } else {
    body = fallbackParseHtml(htmlString);
  }

  const elements = getChildren(body)
    .flatMap((node) => {
      const tag = getTag(node);
      const built = buildElementFromHtml(node);
      if (['section', 'div', 'main', 'header', 'footer', 'article', 'aside', 'nav'].includes(tag) && built && Array.isArray(built.content) && built.content.length) {
        return built.content;
      }
      return built ? [built] : [];
    });

  const bodyElement = makeElement({
    id: '__body',
    name: 'Body',
    type: '__body',
    styles: { minHeight: '100vh' },
    content: elements.length ? elements : [],
  });

  return [bodyElement];
}
