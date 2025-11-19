// Sindri core helpers for Docsify plugins
// - Block detector for ```sindri:ui:<component>
// - Minimal YAML-like parser (subset) for simple config
// - HTML helpers

function trimQuotes(str) {
  if (typeof str !== 'string') return str;
  const s = str.trim();
  const noAngles = s.startsWith('<') && s.endsWith('>') ? s.slice(1, -1) : s;
  if (
    (noAngles.startsWith('"') && noAngles.endsWith('"')) ||
    (noAngles.startsWith("'") && noAngles.endsWith("'"))
  ) {
    return noAngles.slice(1, -1);
  }
  return noAngles;
}

function parseYamlLite(yaml) {
  // Supports subset:
  // key: value
  // key:
  //   subkey: value
  //   styles:
  //     - prop: value
  // Strings can be quoted or unquoted. Angle brackets around values are stripped.
  const lines = String(yaml || '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const result = {};
  let currentObj = result;
  let currentKey = null;
  let inSection = null; // e.g., 'htmltag'
  let inArrayKey = null; // e.g., 'styles'
  let arrayTarget = null;

  function ensureNested(target, key) {
    if (
      !target[key] ||
      typeof target[key] !== 'object' ||
      Array.isArray(target[key])
    ) {
      target[key] = {};
    }
    return target[key];
  }

  for (let raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.match(/^\s*/)[0].length;
    const content = line.trim();

    if (indent === 0) {
      inArrayKey = null;
      arrayTarget = null;
      const m = content.match(/^(\S+):\s*(.*)$/);
      if (m) {
        const key = m[1];
        const rest = m[2];
        if (rest === '' || rest === null) {
          inSection = key;
          currentObj = ensureNested(result, key);
          currentKey = null;
        } else {
          inSection = null;
          currentKey = key;
          currentObj = result;
          currentObj[currentKey] = trimQuotes(rest);
        }
      }
      continue;
    }

    // indent > 0 => inside section
    if (inSection) {
      // styles array start
      const m2 = content.match(/^(\S+):\s*(.*)$/);
      if (m2) {
        const key2 = m2[1];
        const rest2 = m2[2];
        if (rest2 === '') {
          if (key2 === 'styles') {
            currentObj[key2] = [];
            inArrayKey = key2;
            arrayTarget = currentObj[key2];
          } else {
            currentObj[key2] = {};
            inArrayKey = null;
            arrayTarget = null;
          }
        } else {
          currentObj[key2] = trimQuotes(rest2);
          inArrayKey = null;
          arrayTarget = null;
        }
        continue;
      }

      if (inArrayKey && content.startsWith('- ')) {
        // e.g., - color: "#ffffff"
        const kv = content.slice(2).trim();
        const mm = kv.match(/^(\S+):\s*(.*)$/);
        if (mm) {
          const prop = mm[1];
          const val = trimQuotes(mm[2]);
          arrayTarget.push({ [prop]: val });
        } else {
          arrayTarget.push(kv);
        }
      }
    }
  }

  return result;
}

function unwrapAnglesInString(s) {
  if (typeof s !== 'string') return s;
  // Replace any <...> by its inner content
  return s.replace(/<([^<>]+)>/g, (_, inner) => inner.trim());
}

function normalizeAngleKeysAndValues(input) {
  if (Array.isArray(input)) {
    return input.map(v => normalizeAngleKeysAndValues(v));
  }
  if (input && typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      const k2 = k.replace(/[<>]/g, '');
      out[k2] = normalizeAngleKeysAndValues(v);
    }
    return out;
  }
  if (typeof input === 'string') {
    return unwrapAnglesInString(input);
  }
  return input;
}

function stylesArrayToInline(arr) {
  if (!Array.isArray(arr)) return '';
  const parts = [];
  for (const item of arr) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      for (const k of Object.keys(item)) {
        parts.push(`${k}: ${unwrapAnglesInString(item[k])}`);
      }
    } else if (typeof item === 'string') {
      parts.push(unwrapAnglesInString(item));
    }
  }
  return parts.join('; ');
}

function attrsToString(attrs) {
  const out = [];
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (v === true) {
      out.push(`${k}`);
    } else {
      out.push(`${k}="${String(v).replace(/"/g, '&quot;')}"`);
    }
  }
  return out.join(' ');
}

function replaceSindriBlocks(markdown, handlers) {
  const re = /```sindri:([\w:-]+)[ \t]*\n([\s\S]*?)```/gi;
  return markdown.replace(re, (full, lang, yaml) => {
    const target = String(lang || '').toLowerCase();
    const handler = handlers && handlers[target];
    if (!handler) return full; // leave untouched if no handler
    let cfg;
    try {
      cfg = normalizeAngleKeysAndValues(parseYamlLite(yaml));
    } catch (e) {
      console.warn('[sindri] YAML parse error:', e);
      return full;
    }
    try {
      return handler(cfg);
    } catch (e) {
      console.error('[sindri] handler error for', target, e);
      return full;
    }
  });
}

// Export into global Docsify runtime context (no modules here)
window.SindriCore = {
  parseYamlLite,
  normalizeAngleKeysAndValues,
  stylesArrayToInline,
  attrsToString,
  replaceSindriBlocks,
  trimQuotes,
  unwrapAnglesInString,
};
