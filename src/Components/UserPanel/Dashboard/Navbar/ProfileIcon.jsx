// ProfileIcon.js
import React, { useRef, useEffect } from 'react';

const ProfileIcon = ({ initials, diameter = 40, backgroundColor = '#3498db', textColor = '#fff' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = diameter / 2;
    const centerX = diameter / 2;
    const centerY = diameter / 2;

    // Draw circle
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw initials
    ctx.font = `bold ${diameter / 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(initials, centerX, centerY);
  }, [initials, diameter, backgroundColor, textColor]);

  return <canvas ref={canvasRef} width={diameter} height={diameter} />;
};

export default ProfileIcon;
