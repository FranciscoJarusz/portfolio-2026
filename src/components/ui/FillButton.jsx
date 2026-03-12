import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import RollText from './RollText.jsx';

export default function BlobButton({
  text,
  href,
  as: Tag = undefined,
  className = '',
  fillClassName = '',
  fillColor = undefined,
  fillTextColor = '#f8f9fa',
  stagger = 0.03,
  ...props
}) {
  const buttonRef = useRef(null);
  const fillRef  = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const fill   = fillRef.current;
    if (!button || !fill) return;

    const getRelPos = (e) => {
      const rect = button.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      return { x, y };
    };

    const handleMouseEnter = (e) => {
      const { x, y } = getRelPos(e);
      gsap.killTweensOf(fill);
      gsap.fromTo(
        fill,
        { clipPath: `circle(0% at ${x}% ${y}%)` },
        { clipPath: `circle(150% at ${x}% ${y}%)`, duration: 0.55, ease: 'power2.out' }
      );
    };

    const handleMouseLeave = (e) => {
      const { x, y } = getRelPos(e);
      gsap.killTweensOf(fill);
      gsap.to(fill, {
        clipPath: `circle(0% at ${x}% ${y}%)`,
        duration: 0.5,
        ease: 'power2.in',
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const Component = Tag || (href ? 'a' : 'button');

  return (
    <Component
      ref={buttonRef}
      href={href}
      className={`relative inline-flex items-center overflow-hidden cursor-pointer ${className}`}
      {...props}
    >
      <span className="relative z-20">
        <RollText text={text} stagger={stagger} hoverColor={fillTextColor} />
      </span>

      <span
        ref={fillRef}
        className={`pointer-events-none absolute inset-0 ${fillClassName}`}
        style={{
          clipPath: 'circle(0% at 50% 50%)',
          ...(fillColor ? { background: fillColor } : {}),
        }}
        aria-hidden="true"
      />
    </Component>
  );
}
