import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const posiciones = (el: HTMLElement) => {
    const rects: DOMRect[] = [];
    const rango = document.createRange();
    const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let nodo: Node | null;

    while ((nodo = recorrido.nextNode())) {
        const texto = nodo.textContent ?? '';
        for (let i = 0; i < texto.length; i++) {
            if (!texto[i].trim()) continue;
            rango.setStart(nodo, i);
            rango.setEnd(nodo, i + 1);
            rects.push(rango.getBoundingClientRect());
        }
    }

    return rects;
};

// Partir en letras pierde el kerning: cada letra queda en su caja. Se corre
// cada máscara a donde estaba la letra en el texto original para que al
// revertir el split no se note ningún salto.
export const partirLetras = (titulo: HTMLElement, mascaras?: gsap.TweenVars) => {
    const antes = posiciones(titulo);

    const split = SplitText.create(titulo, {
        type: 'words,chars',
        mask: 'chars',
    });

    if (mascaras) gsap.set(split.masks, mascaras);

    const despues = posiciones(titulo);
    split.masks.forEach((mascara, i) => {
        const a = antes[i];
        const d = despues[i];
        if (!a || !d) return;
        gsap.set(mascara, { x: a.left - d.left, y: a.top - d.top });
    });

    return split;
};

export const animarTitulo = (
    titulo: HTMLElement,
    scrollTrigger: ScrollTrigger.Vars
) => {
    const split = partirLetras(titulo, {
        padding: '6px 12px 12px 6px',
        margin: '-6px -12px -12px -6px',
    });

    return gsap.fromTo(
        split.chars,
        { yPercent: 130 },
        {
            yPercent: 0,
            duration: 0.8,
            ease: 'power4.out',
            stagger: 0.035,
            scrollTrigger,
            onComplete: () => split.revert(),
        }
    );
};
