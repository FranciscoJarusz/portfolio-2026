import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function RollText({ 
  text, 
  as: Component = 'span',
  className = '',
  hoverColor = 'currentColor',
  stagger = 0.03
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Buscar el elemento padre interactivo (a, button, etc)
    const hoverTarget = container.closest('a, button') || container;

    const firstLetters = container.querySelectorAll('.first-text .letter');
    const secondLetters = container.querySelectorAll('.second-text .letter');

    // Set initial position for second letters
    gsap.set(secondLetters, { y: '100%' });

    // Timeline para el efecto hover
    const tl = gsap.timeline({ paused: true });

    tl.to(firstLetters, {
      y: '-100%',
      duration: 0.5,
      ease: 'power2.inOut',
      stagger: stagger
    }, 0)
    .to(secondLetters, {
      y: '0%',
      duration: 0.5,
      ease: 'power2.inOut',
      stagger: stagger
    }, 0);

    const handleMouseEnter = () => {
      tl.play();
    };

    const handleMouseLeave = () => {
      tl.reverse();
    };

    hoverTarget.addEventListener('mouseenter', handleMouseEnter);
    hoverTarget.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hoverTarget.removeEventListener('mouseenter', handleMouseEnter);
      hoverTarget.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    };
  }, [text, stagger]);

  const renderLetters = (key) => text.split('').map((char, index) => (
    <span 
      key={`${key}-${index}`}
      className="letter inline-block"
      style={{ willChange: 'transform' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <Component 
      ref={containerRef}
      className={`inline-flex overflow-hidden ${className}`}
      style={{ position: 'relative' }}
    >
      <span className="relative flex">
        <span className="first-text flex">
          {renderLetters('first')}
        </span>
        <span 
          className="second-text flex absolute inset-0"
          style={{ 
            color: hoverColor
          }}
        >
          {renderLetters('second')}
        </span>
      </span>
    </Component>
  );
}
