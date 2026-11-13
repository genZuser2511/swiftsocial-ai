import { useState, useEffect } from 'react';

export function useAgentDeployStatus(createdAt: string, name: string) {
    const isDefaultAgent = name === 'Inbound call agent' || name === 'Outbound call agent';
    
    const calculateTimeRemaining = () => {
        if (isDefaultAgent) return { isLive: true, text: '' };
        if (!createdAt) return { isLive: true, text: '' }; // Fallback
        
        const createdTime = new Date(createdAt).getTime();
        const liveTime = createdTime + 48 * 60 * 60 * 1000;
        const now = Date.now();
        
        if (now >= liveTime) return { isLive: true, text: '' };
        
        const diffMs = liveTime - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return { 
            isLive: false, 
            text: `${hours}h ${minutes}m` 
        };
    };

    const [status, setStatus] = useState(calculateTimeRemaining());

    useEffect(() => {
        if (status.isLive) return;

        // Update the timer every minute (60,000 ms)
        const interval = setInterval(() => {
            setStatus(calculateTimeRemaining());
        }, 60000);

        return () => clearInterval(interval);
    }, [createdAt, name, status.isLive]);

    return status;
}
