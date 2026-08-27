import { useRef, useEffect, useCallback } from 'react';

const ClickSpark = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const rafRef = useRef(null);
  const startLoopRef = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let resizeTimeout;

    // El canvas va fijo al viewport (no al padre), así el efecto funciona en
    // toda la página sin importar cuánto scroll haya.
    const resizeCanvas = () => {
      const { innerWidth: width, innerHeight: height } = window;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);

    resizeCanvas();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    t => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = timestamp => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      // Sin chispas no hay nada que dibujar: el loop se corta hasta el próximo
      // clic en vez de repintar el canvas entero 60 veces por segundo.
      if (sparksRef.current.length === 0) {
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    startLoopRef.current = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);

  const handleClick = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }));

    sparksRef.current.push(...newSparks);

    // El loop está detenido mientras no hay chispas: hay que despertarlo.
    startLoopRef.current();
  };

  return (
    <div onClick={handleClick}>
      <canvas
        ref={canvasRef}
        className="block fixed inset-0 w-screen h-screen select-none pointer-events-none z-9999"
      />
      {children}
    </div>
  );
};

export default ClickSpark;
