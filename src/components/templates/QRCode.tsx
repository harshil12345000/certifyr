
import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 100, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [value, size]);

  if (!value) {
    return (
      <div 
        className={`border border-dashed border-gray-300 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-gray-400">QR Code</span>
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ maxWidth: size, maxHeight: size }}
    />
  );
};
