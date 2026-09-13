import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'official' | 'gradient' | 'white' | 'teal' | 'cream';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isotypeOnly?: boolean;
}

export function AtlascoreLogo({
  variant = 'official',
  showText = true,
  size = 'md',
  className = '',
  isotypeOnly = false,
}: LogoProps) {
  // If official variant is selected, render the official brand graphic
  if (variant === 'official') {
    const imgWidth = size === 'sm' ? 120 : size === 'md' ? 160 : size === 'lg' ? 220 : 280;
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Image
          src="/brand/atlascore_logo_dark.png"
          alt="Atlascore"
          width={imgWidth}
          height={Math.round(imgWidth * 0.77)}
          className="h-auto object-contain transition-transform duration-300 hover:scale-105"
          priority
        />
      </div>
    );
  }

  // Dimension settings
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', spacing: 'gap-2.5' },
    md: { icon: 38, text: 'text-xl', spacing: 'gap-3.5' },
    lg: { icon: 52, text: 'text-2xl', spacing: 'gap-4' },
    xl: { icon: 72, text: 'text-4xl', spacing: 'gap-5' },
  };

  const { icon, text, spacing } = sizeMap[size];

  // Color & Gradient rules according to Brand Manual:
  // Page 3 & 10: Gradient (Mint #8BD990 to Violet #4B4BA1), or solid White, or solid Teal (#023A40)
  const isGradient = variant === 'gradient';
  const strokeColor = 
    variant === 'white' ? '#FFFFFF' :
    variant === 'cream' ? '#F0EBD8' :
    variant === 'teal' ? '#023A40' : 'url(#atlascore-gradient)';

  const textClass =
    variant === 'white' ? 'text-white' :
    variant === 'cream' ? 'text-[#F0EBD8]' :
    variant === 'teal' ? 'text-[#023A40]' : 'atlas-gradient-text';

  return (
    <div className={`inline-flex items-center ${spacing} ${className}`}>
      {/* Official Atlascore Geometric Orbital Star Isotype */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="atlascore-gradient" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#8BD990" />
            <stop offset="45%" stopColor="#68C7A2" />
            <stop offset="75%" stopColor="#5575B5" />
            <stop offset="100%" stopColor="#4B4BA1" />
          </linearGradient>
          <filter id="atlas-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#8BD990" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter={isGradient ? "url(#atlas-glow)" : undefined}>
          {/* Outer Ring */}
          <circle
            cx="60"
            cy="60"
            r="44"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            className="opacity-95"
          />

          {/* Secondary Intersecting Orbit Ring */}
          <ellipse
            cx="60"
            cy="60"
            rx="45"
            ry="24"
            transform="rotate(-28 60 60)"
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinecap="round"
            className="opacity-80"
          />

          {/* Internal Geometric Star Structure */}
          {/* Points connected forming the iconic Atlascore tech core */}
          <polygon
            points="60,18 73,46 102,48 78,68 85,97 60,81 35,97 42,68 18,48 47,46"
            stroke={strokeColor}
            strokeWidth="3.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />

          {/* Central Nucleus Node */}
          <circle
            cx="60"
            cy="60"
            r="4"
            fill={isGradient ? "#8BD990" : strokeColor}
          />
        </g>
      </svg>

      {/* Official Wordmark */}
      {showText && !isotypeOnly && (
        <span
          className={`font-brand font-bold tracking-[0.2em] uppercase select-none ${text} ${textClass}`}
        >
          ATLASCORE
        </span>
      )}
    </div>
  );
}
