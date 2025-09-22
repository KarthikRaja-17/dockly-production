'use client';
import React, { useEffect, useState, useRef } from 'react';
import { BellDot } from 'lucide-react';

interface NotificationBellProps {
    count: number;
    onClick?: () => void;
    scrollToId?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
    count,
    onClick,
    scrollToId = 'recent-activity',
}) => {
    const [isAnimated, setIsAnimated] = useState(false);
    const [shake, setShake] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (count > 0) {
            setIsAnimated(true);
            const timer = setTimeout(() => setIsAnimated(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [count]);

    const handleClick = () => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        onClick?.();

        if (scrollToId) {
            const target = document.getElementById(scrollToId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div
            style={{ cursor: 'pointer' }}
            ref={bellRef}
            onClick={handleClick}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center 
        backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-[#e0f7ff] to-white 
        border border-white/30 shadow-md cursor-pointer hover:scale-105 active:scale-95 
        ${isAnimated ? 'pulse-ring' : ''} ${shake ? 'shake-bell' : ''}`}
        >
            {/* Bell Icon */}
            <BellDot className="text-[#007B8F]" size={24} />

            {/* Notification Count Badge */}
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-white text-[10px] bg-red-500 rounded-full px-[6px] flex items-center justify-center font-bold  animate-bounce">
                    {count > 5 ? '5+' : count}
                </span>
            )}

            {/* Custom Animations */}
            <style jsx>{`
        .pulse-ring {
          animation: ringPulse 1.6s ease-out;
        }

        .shake-bell {
          animation: shakeBell 0.6s;
        }

        .badge-glow {
          box-shadow: 0 0 6px rgba(255, 0, 0, 0.6), 0 0 2px rgba(255, 0, 0, 0.4);
        }

        @keyframes ringPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 123, 143, 0.5);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(0, 123, 143, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 123, 143, 0);
          }
        }

        @keyframes shakeBell {
          0% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-12deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-6deg); }
          100% { transform: rotate(0); }
        }
      `}</style>
        </div>
    );
};

export default NotificationBell;
