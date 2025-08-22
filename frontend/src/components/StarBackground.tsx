import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Snowflake properties - enhanced for full footer
    const snowflakes: {x: number, y: number, size: number, speed: number, opacity: number, angle: number, spin: number}[] = [];
    const flakeCount = Math.floor(window.innerWidth / 15); // More snowflakes for better coverage
    
    // Create snowflakes with different layers
    for (let i = 0; i < flakeCount; i++) {
      const layer = Math.floor(Math.random() * 3); // 0, 1, or 2 for different layers
      const size = (Math.random() * 3 + 2) * (layer * 0.4 + 0.8); // Size range 2-5, scaled by layer
      const speed = (Math.random() * 0.8 + 0.3) * (layer * 0.3 + 0.7); // Speed varies by layer
      
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        speed: speed,
        opacity: Math.random() * 0.4 + 0.4, // 0.4 to 0.8 opacity
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05 * (layer * 0.5 + 1) // Faster spin for larger flakes
      });
    }
    
    // Animation
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw snowflakes with enhanced movement
      for (const flake of snowflakes) {
        // Move snowflakes with more dynamic movement
        flake.y += flake.speed;
        flake.x += Math.sin(flake.y * 0.01 + flake.size * 10) * (0.5 + flake.size * 0.1); // More pronounced side-to-side for larger flakes
        flake.angle += flake.spin;
        
        // Reset snowflake position if it goes below the canvas or too far to the sides
        if (flake.y > canvas.height + 20 || flake.x < -20 || flake.x > canvas.width + 20) {
          flake.y = -20;
          flake.x = Math.random() * canvas.width;
        }
        
        // Draw snowflake
        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.angle);
        
        // Enhanced snowflake design (6-pointed)
        const size = flake.size;
        // Slightly varied blue colors for more natural look
        const blueVariant = Math.random() * 20 - 10; // -10 to 10 variation
        const color = `rgba(
          ${160 + blueVariant}, 
          ${216 + blueVariant * 0.5}, 
          ${240 + blueVariant * 0.3}, 
          ${flake.opacity}
        )`;
        
        // Main branches
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          
          // Draw main branch
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -size * 2);
          
          // Draw side branches
          ctx.moveTo(0, -size * 0.7);
          ctx.lineTo(size * 0.7, -size * 0.7);
          
          ctx.moveTo(0, -size * 1.4);
          ctx.lineTo(size * 0.5, -size * 1.2);
          
          // Rotate for next branch
          ctx.rotate(angle);
          
          // Style and draw
          ctx.strokeStyle = color;
          ctx.lineWidth = size * 0.3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        
        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.restore();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
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
