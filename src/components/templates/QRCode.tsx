
import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 75, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value && value.trim() !== '') {
      const generateQR = async () => {
        try {
          await QRCodeLib.toCanvas(canvasRef.current, value, {
            width: size,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };
      generateQR();
    }
  }, [value, size]);

  if (!value || value.trim() === '') {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ maxWidth: size, maxHeight: size }}
    />
  );
};
