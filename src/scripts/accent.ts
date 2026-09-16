const raiz = document.documentElement;
const secciones = [...document.querySelectorAll<HTMLElement>('[data-accent]')];

const enlaces = [
    ...document.querySelectorAll<HTMLAnchorElement>('header nav a[href*="#"]'),
];

let seccionActual: HTMLElement | null = null;
let pendiente = false;

let primera = true;

const marcarEnlace = (seccion: HTMLElement) => {
    if (!seccion.id) return;

    const activo = enlaces.find((enlace) => enlace.hash === `#${seccion.id}`);

    for (const enlace of enlaces) {
        const esActivo = enlace === activo;

        if (esActivo) enlace.setAttribute('aria-current', 'location');
        else enlace.removeAttribute('aria-current');

        if (esActivo && !primera) {
            enlace.dispatchEvent(new CustomEvent('rolltext:play'));
        }
    }

    primera = false;
};

const actualizar = () => {
    pendiente = false;

    const alto = window.innerHeight;
    const maximo = raiz.scrollHeight - alto;
    const restante = Math.max(0, maximo - window.scrollY);

    const punto = Math.min(
        alto - 1,
        alto / 2 + Math.max(0, alto / 2 - restante)
    );

    for (let i = secciones.length - 1; i >= 0; i--) {
        const seccion = secciones[i];
        const caja = seccion.getBoundingClientRect();

        const antes = parseFloat(seccion.dataset.accentAntes ?? '');
        const anticipo = Number.isNaN(antes) ? 0 : (antes / 100) * alto;

        if (punto < caja.top - anticipo || punto >= caja.bottom) continue;

        const { accent, accentText } = seccion.dataset;
        if (!accent || seccion === seccionActual) return;

        seccionActual = seccion;
        marcarEnlace(seccion);
        raiz.style.setProperty('--accent', `var(--color-${accent})`);
        raiz.style.setProperty(
            '--accent-text',
            accentText ? `var(--color-${accentText})` : 'var(--color-black)'
        );
        return;
    }
};

const pedirActualizacion = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
};

window.addEventListener('scroll', pedirActualizacion, { passive: true });
window.addEventListener('resize', pedirActualizacion);
actualizar();
