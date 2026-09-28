import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
