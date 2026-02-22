export function setSafeText(node, value) {
  node.textContent = String(value ?? '');
}

export function setSafeAttr(node, attr, value) {
  node.setAttribute(attr, String(value ?? ''));
}

export function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function createSafeElement(tagName, options = {}) {
  const {
    text = null,
    classes = [],
    attrs = {},
    dataset = {}
  } = options;

  const node = document.createElement(tagName);
  if (text !== null) setSafeText(node, text);
  classes.forEach((name) => {
    if (name) node.classList.add(name);
  });
  Object.entries(attrs).forEach(([key, value]) => setSafeAttr(node, key, value));
  Object.entries(dataset).forEach(([key, value]) => {
    node.dataset[key] = String(value ?? '');
  });
  return node;
}

export function isSafeHttpUrl(value) {
  try {
    const parsed = new URL(String(value ?? ''));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}
