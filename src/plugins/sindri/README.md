# Plugins de Sindri para integrar componentes en Docsify

Estos plugins permiten usar demos pre-renderizadas de componentes (shadcn-vue) dentro de páginas Markdown de Docsify mediante bloques de código tipo sindri.

Estado: primera iteración con el componente `ui:button`.

## Uso rápido

Escribe en tu Markdown un bloque de código con el lenguaje `sindri:ui:button` y una configuración YAML opcional:

````
```sindri:ui:button
text: "Visita nuestra tienda"
variant: "secondary"
size: "lg"
as: "a"
href: "https://tu-tienda.example"
htmltag:
  class: "mr-6 pt-2"
  styles:
    - color: "#ffffff"
    - font-size: "12px"
```
````

El plugin reemplazará el bloque con HTML estático del botón con Tailwind classes apropiadas. Tailwind standalone ya está integrado en el proyecto.

Notas:

- Se ha creado una infraestructura común para reutilizar lógica en futuros componentes.
- Los valores dentro de `styles` se convierten a atributos `style` en línea.
- Campos soportados para button: `text`, `variant`, `size`, `as` ("button"|"a"), `href`, `htmltag.class`, `htmltag.styles`.
