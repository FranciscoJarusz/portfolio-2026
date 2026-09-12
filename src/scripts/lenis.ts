import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));

gsap.ticker.lagSmoothing(0);

export default lenis;

const getScrollTarget = (target: HTMLElement) => {
    const padre = target.parentElement;
    return padre?.classList.contains('pin-spacer') ? padre : target;
};

const getHeaderOffset = (destino: HTMLElement) => {
    const value = parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop
    );
    const margen = Number.isNaN(value) ? 0 : value;

    const holgura = window.innerHeight - destino.getBoundingClientRect().height;

    return holgura >= 0 ? -Math.min(margen, holgura) : -margen;
};

document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

    const anchor = (event.target as Element | null)?.closest?.(
        'a[href*="#"]'
    ) as HTMLAnchorElement | null | undefined;
    if (!anchor || anchor.target === '_blank') return;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname !== window.location.pathname) return;
    if (!url.hash || url.hash === '#') return;

    const target = document.querySelector<HTMLElement>(url.hash);
    if (!target) return;

    event.preventDefault();
    const destino = getScrollTarget(target);
    lenis.scrollTo(destino, { offset: getHeaderOffset(destino) });
    history.pushState(null, '', url.hash);
});

window.addEventListener('load', () => {
    if (!window.location.hash) return;
    const target = document.querySelector<HTMLElement>(window.location.hash);
    if (!target) return;
    const destino = getScrollTarget(target);
    lenis.scrollTo(destino, {
        offset: getHeaderOffset(destino),
        immediate: true,
    });
});
