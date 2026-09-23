import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// En celulares las entradas son solo un fade con una subida corta: las
// versiones con rotaciones, rebotes y elementos de a uno se trababan en iOS.
export const MOVIL = '(max-width: 63.99rem)';

export const aparecer = (elementos: Iterable<Element | null | undefined>) => {
    for (const elemento of elementos) {
        if (!elemento) continue;

        gsap.fromTo(
            elemento,
            { autoAlpha: 0, y: 30 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: { trigger: elemento, start: 'top 90%', once: true },
            }
        );
    }
};
