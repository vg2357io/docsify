// Sindri Docsify plugin: ui:card
// Depende de window.SindriCore (core.js)

(function () {
  // Copiamos la función de clases del botón para reutilizar estilos coherentes en acciones
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

    const v = (cfg && cfg.variant ? cfg.variant : 'default').toLowerCase();
    const s = (cfg && cfg.size ? cfg.size : 'default').toLowerCase();
    const chosenV = variants[v] || variants.default;
    const chosenS = sizes[s] || sizes.default;
    const extra = (cfg && cfg.htmltag && cfg.htmltag.class) || '';
    return [base, chosenV, chosenS, extra].filter(Boolean).join(' ').trim();
  }

  function renderCard(cfg) {
    const C = window.SindriCore || {};
    const cardClassBase =
      'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm';
    const headerClassBase =
      '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6';
    const titleClass = 'leading-none font-semibold';
    const descClass = 'text-muted-foreground text-sm';
    const actionClassBase =
      'col-start-2 row-span-2 row-start-1 self-start justify-self-end';
    const contentClass = 'px-6';
    const footerClassBase = 'flex items-center px-6 [.border-t]:pt-6';

    const stylesInline = C.stylesArrayToInline
      ? C.stylesArrayToInline(cfg && cfg.htmltag && cfg.htmltag.styles)
      : '';
    const cardAttrs = {
      class: [cardClassBase, cfg && cfg.htmltag && cfg.htmltag.class]
        .filter(Boolean)
        .join(' '),
      style: stylesInline || undefined,
      'data-slot': 'card',
    };

    const hasHeader = cfg && (cfg.title || cfg.description || cfg.action);
    const hasContent = cfg && cfg.content != null && cfg.content !== '';
    const hasFooter = cfg && cfg.footer != null && cfg.footer !== '';

    // Header HTML
    let headerHtml = '';
    if (hasHeader) {
      const headerAttrs = {
        class: [
          headerClassBase,
          cfg && cfg.header && cfg.header.class,
          cfg && cfg.headerBorder ? 'border-b' : '',
        ]
          .filter(Boolean)
          .join(' '),
        'data-slot': 'card-header',
      };
      const headerParts = [];
      if (cfg && cfg.title) {
        headerParts.push(
          `<h3 data-slot="card-title" class="${titleClass}">${cfg.title}</h3>`,
        );
      }
      if (cfg && cfg.description) {
        headerParts.push(
          `<p data-slot="card-description" class="${descClass}">${cfg.description}</p>`,
        );
      }

      // Action button/link
      if (cfg && cfg.action) {
        const act = cfg.action || {};
        const asTag = (act.as || 'button').toLowerCase();
        const isLink = asTag === 'a';
        const tag = isLink ? 'a' : 'button';
        const actAttrs = {
          class: classesForButton(act),
          style: C.stylesArrayToInline
            ? C.stylesArrayToInline(act.htmltag && act.htmltag.styles)
            : undefined,
        };
        if (isLink) {
          actAttrs.href = act.href || '#';
          actAttrs.role = 'button';
        } else {
          actAttrs.type = act.type || 'button';
        }
        const actAttrStr = C.attrsToString ? C.attrsToString(actAttrs) : '';
        const actText = act.text != null ? String(act.text) : 'Acción';
        headerParts.push(
          `<div data-slot="card-action" class="${actionClassBase}"><${tag} ${actAttrStr}>${actText}</${tag}></div>`,
        );
      }

      const headerAttrStr = C.attrsToString ? C.attrsToString(headerAttrs) : '';
      headerHtml = `<div ${headerAttrStr}>${headerParts.join('')}</div>`;
    }

    // Content HTML
    let contentHtml = '';
    if (hasContent) {
      contentHtml = `<div data-slot="card-content" class="${contentClass}">${cfg.content}</div>`;
    }

    // Footer HTML
    let footerHtml = '';
    if (hasFooter) {
      const footerAttrs = {
        class: [footerClassBase, cfg && cfg.footerBorder ? 'border-t' : '']
          .filter(Boolean)
          .join(' '),
        'data-slot': 'card-footer',
      };
      const footerAttrStr = C.attrsToString ? C.attrsToString(footerAttrs) : '';
      footerHtml = `<div ${footerAttrStr}>${cfg.footer}</div>`;
    }

    const cardAttrStr = C.attrsToString ? C.attrsToString(cardAttrs) : '';
    return `<div class="sindri-ui sindri-ui-card"><div ${cardAttrStr}>${headerHtml}${contentHtml}${footerHtml}</div></div>`;
  }

  function install(hook) {
    hook.beforeEach(function (md) {
      const C = window.SindriCore;
      if (!C || !C.replaceSindriBlocks) return md;
      return C.replaceSindriBlocks(md, {
        'ui:card': renderCard,
      });
    });
  }

  window.$docsify = window.$docsify || {};
  $docsify.plugins = [install, ...($docsify.plugins || [])];
})();
