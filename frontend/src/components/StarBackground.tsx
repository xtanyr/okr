import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const snowflakes: {x: number, y: number, size: number, speed: number, opacity: number, angle: number, spin: number}[] = [];
    const flakeCount = Math.floor(window.innerWidth / 28);
    
    for (let i = 0; i < flakeCount; i++) {
      const layer = Math.floor(Math.random() * 3);
      const size = (Math.random() * 3 + 2) * (layer * 0.4 + 0.8);
      const speed = (Math.random() * 0.8 + 0.3) * (layer * 0.3 + 0.7);
      
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        speed: speed,
        opacity: Math.random() * 0.4 + 0.4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05 * (layer * 0.5 + 1)
      });
    }
    
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (const flake of snowflakes) {
        flake.y += flake.speed;
        flake.x += Math.sin(flake.y * 0.01 + flake.size * 10) * (0.5 + flake.size * 0.1);
        flake.angle += flake.spin;
        
        if (flake.y > canvas.height + 20 || flake.x < -20 || flake.x > canvas.width + 20) {
          flake.y = -20;
          flake.x = Math.random() * canvas.width;
        }
        
        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.angle);
        
        const size = flake.size;
        const blueVariant = Math.random() * 20 - 10;
        const color = `rgba(
          ${160 + blueVariant}, 
          ${216 + blueVariant * 0.5}, 
          ${240 + blueVariant * 0.3}, 
          ${flake.opacity}
        )`;
        
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI / 6) * i;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -size * 2);
          
          ctx.moveTo(0, -size * 0.7);
          ctx.lineTo(size * 0.7, -size * 0.7);
          
          ctx.moveTo(0, -size * 1.4);
          ctx.lineTo(size * 0.5, -size * 1.2);
          
          ctx.rotate(angle);
          
          ctx.strokeStyle = color;
          ctx.lineWidth = size * 0.3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.restore();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 1
      }}
    />
  );
};

export default StarBackground;
