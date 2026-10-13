# Fransz — Portfolio

Portfolio de **Francisco Jarusz**, desarrollador web y diseñador UX/UI en Buenos Aires.

🔗 [franszdev.com](https://franszdev.com)

![Francisco Jarusz — Desarrollador web & diseñador UX/UI](public/og.png)

## Stack

- **[Astro](https://astro.build)** — sitio estático de una página, con imágenes optimizadas a AVIF/WebP.
- **[Tailwind CSS 4](https://tailwindcss.com)** — estética neobrutalista con utilidades propias (`shadow-brutal`, `text-stroke-brutal`).
- **[GSAP](https://gsap.com) + ScrollTrigger + SplitText** — animaciones de entrada, línea de tiempo con scroll y títulos letra por letra.
- **[Lenis](https://lenis.darkroom.engineering)** — scroll suave, desactivado con `prefers-reduced-motion`.
- **[Resend](https://resend.com)** — envío del formulario de contacto, con aviso interno y confirmación al visitante.
- **[Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)** — verificación anti-bots, invisible salvo que haga falta.
- **[Vercel](https://vercel.com)** — hosting y función serverless del formulario.

## Estructura

```text
api/
├── contacto.ts      # Endpoint del formulario: valida, verifica Turnstile y envía con Resend
└── _emails.ts       # Plantillas HTML de los mails (tablas y estilos en línea)
src/
├── components/      # Header, Footer y piezas de UI (RollText, FlechaDibujo, ...)
├── data/            # Experiencia y proyectos en JSON
├── layouts/         # Layout con SEO, Open Graph y JSON-LD
├── scripts/         # Lenis, acento por sección y animaciones compartidas
├── sections/        # Hero, Experiencia, Proyectos, Sobre mí, Contacto
└── styles/          # Tema y utilidades de Tailwind
```

## Desarrollo

```sh
npm install
npm run dev       # Solo el sitio, en localhost:4321 (sin /api)
vercel dev        # Sitio + función del formulario
npm run build     # Build de producción en ./dist
```

En local, el formulario y el endpoint usan las claves de prueba de Turnstile, así que se puede probar sin configurar nada más que Resend.

### Variables de entorno

| Variable                    | Uso                                                |
| :-------------------------- | :------------------------------------------------- |
| `RESEND_API_KEY`            | Envío de mails desde `contacto@franszdev.com`      |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clave pública del widget (se lee en el build)      |
| `TURNSTILE_SECRET_KEY`      | Verificación del token en el endpoint              |
