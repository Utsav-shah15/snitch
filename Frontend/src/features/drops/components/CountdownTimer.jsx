import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, onEnd }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();
            let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

            if (difference > 0) {
                newTimeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
                setIsExpired(false);
            } else {
                setIsExpired(true);
                if (onEnd) onEnd();
            }
            setTimeLeft(newTimeLeft);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onEnd]);

    if (isExpired) {
        return (
            <div className="inline-flex items-center px-4 py-2 border border-violet-500/30 bg-violet-950/20 text-violet-400 font-bold uppercase tracking-widest text-[10px] rounded-full shadow-lg shadow-violet-950/20 animate-pulse">
                🔥 Drop is Live!
            </div>
        );
    }

    const padZero = (num) => String(num).padStart(2, '0');

    return (
        <div className="flex items-center gap-3">
            {/* Days */}
            {timeLeft.days > 0 && (
                <div className="flex flex-col items-center">
                    <div className="text-xl md:text-2xl font-black text-white bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-1.5 min-w-[44px] text-center shadow-md shadow-black/40">
                        {padZero(timeLeft.days)}
                    </div>
                    <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Days</span>
                </div>
            )}

            {/* Hours */}
            <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-black text-white bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-1.5 min-w-[44px] text-center shadow-md shadow-black/40">
                    {padZero(timeLeft.hours)}
                </div>
                <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Hrs</span>
            </div>

            {/* Colon */}
            <span className="text-xl font-bold text-neutral-700 -mt-4">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-black text-white bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-1.5 min-w-[44px] text-center shadow-md shadow-black/40">
                    {padZero(timeLeft.minutes)}
                </div>
                <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Mins</span>
            </div>

            {/* Colon */}
            <span className="text-xl font-bold text-neutral-700 -mt-4">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-black text-violet-400 bg-neutral-900/80 border border-neutral-800 rounded-lg px-3 py-1.5 min-w-[44px] text-center shadow-lg shadow-violet-950/20">
                    {padZero(timeLeft.seconds)}
                </div>
                <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider mt-1">Secs</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
