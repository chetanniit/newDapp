import React, { useEffect, useRef } from 'react';

const QRCodeComponent = ({ data, size = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && canvasRef.current) {
      generateQRCode(data, canvasRef.current, size);
    }
  }, [data, size]);

  const generateQRCode = (text, canvas, size) => {
    // Simple QR code generation without external dependencies
    // This creates a basic QR-like pattern for demonstration
    // In production, you'd use a proper QR code library
    
    const ctx = canvas.getContext('2d');
    const moduleSize = size / 25; // 25x25 grid
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    // Create a simple pattern based on the data
    ctx.fillStyle = 'black';
    
    // Generate pseudo-QR pattern
    const hash = simpleHash(text);
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Create pattern based on hash and position
        const shouldFill = (hash + i * j + i + j) % 3 === 0;
        if (shouldFill) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add corner squares (QR code markers)
    drawCornerSquare(ctx, 0, 0, moduleSize);
    drawCornerSquare(ctx, 18 * moduleSize, 0, moduleSize);
    drawCornerSquare(ctx, 0, 18 * moduleSize, moduleSize);
  };

  const drawCornerSquare = (ctx, x, y, moduleSize) => {
    // Outer square
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    
    // Inner white square
    ctx.fillStyle = 'white';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    
    // Center black square
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  return (
    <div className="qr-code-container">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        style={{ border: '2px solid #4ecdc4', borderRadius: '10px' }}
      />
    </div>
  );
};

export default QRCodeComponent;
