'use client';
import { useEffect, useRef } from 'react';

interface Props {
  active: boolean;
}

export default function ConfettiCanvas({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;

    const pieces = Array.from({ length: 160 }, () => ({
      x:    Math.random() * canvas.width,
      y:    -20,
      r:    5 + Math.random() * 6,
      d:    1.5 + Math.random() * 2.5,
      vx:   Math.random() * 4 - 2,
      spin: Math.random() * 0.2 - 0.1,
      angle: 0,
      color: `hsl(${Math.random() * 360},80%,60%)`,
    }));

    let done = false;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2);
        ctx.restore();
        p.y += p.d; p.x += p.vx; p.angle += p.spin;
      });
      if (!done && pieces.some(p => p.y < canvas.height)) {
        frameRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    draw();

    const timeout = setTimeout(() => { done = true; }, 4000);
    return () => { done = true; cancelAnimationFrame(frameRef.current); clearTimeout(timeout); };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        display: active ? 'block' : 'none',
      }}
    />
  );
}
