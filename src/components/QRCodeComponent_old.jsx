import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeComponent = ({ data, size = 200 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && canvasRef.current) {
      generateQRCode(data, canvasRef.current, size);
    }
  }, [data, size]);

  const generateQRCode = async (text, canvas, size) => {
    try {
      // Generate proper QR code that Trust Wallet can read
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
      
      // Fallback: display URL as text if QR generation fails
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR Error', size / 2, size / 2 - 10);
      ctx.fillText('Use URL instead', size / 2, size / 2 + 10);
    }
  };
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
