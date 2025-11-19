// Sindri Docsify plugin: ui:button
// Depende de window.SindriCore (core.js)

(function () {
  function classesForButton(cfg) {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
      outline:
        'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost:
        'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
      lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
      icon: 'size-9',
      'icon-sm': 'size-8',
      'icon-lg': 'size-10',
    };

    const v = (cfg.variant || 'default').toLowerCase();
    const s = (cfg.size || 'default').toLowerCase();
    const chosenV = variants[v] || variants.default;
    const chosenS = sizes[s] || sizes.default;
    const extra = (cfg.htmltag && cfg.htmltag.class) || '';
    return [base, chosenV, chosenS, extra].filter(Boolean).join(' ').trim();
  }

  function renderButton(cfg) {
    const C = window.SindriCore || {};
    const stylesInline = C.stylesArrayToInline
      ? C.stylesArrayToInline(cfg.htmltag && cfg.htmltag.styles)
      : '';
    const asTag = (cfg.as || 'button').toLowerCase();
    const isLink = asTag === 'a';
    const tag = isLink ? 'a' : 'button';
    const attrs = {
      class: classesForButton(cfg),
      style: stylesInline || undefined,
    };
    if (isLink) {
      attrs.href = cfg.href || '#';
      attrs.role = 'button';
    } else {
      attrs.type = cfg.type || 'button';
    }

    const text = cfg.text != null ? String(cfg.text) : 'Button';
    const attrStr = C.attrsToString ? C.attrsToString(attrs) : '';

    // Wrap inside a container to avoid Markdown post-processing issues
    return `<div class="sindri-ui sindri-ui-button"><${tag} ${attrStr}>${text}</${tag}></div>`;
  }

  function install(hook) {
    hook.beforeEach(function (md) {
      const C = window.SindriCore;
      if (!C || !C.replaceSindriBlocks) return md;
      return C.replaceSindriBlocks(md, {
        'ui:button': renderButton,
      });
    });
  }

  window.$docsify = window.$docsify || {};
  $docsify.plugins = [install, ...($docsify.plugins || [])];
})();
