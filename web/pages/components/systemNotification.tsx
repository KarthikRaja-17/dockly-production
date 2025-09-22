'use client';
import { useEffect, useRef } from 'react';

interface Props {
    message: string;
    onDone?: () => void;
}

const SystemNotification: React.FC<Props> = ({ message, onDone }) => {
    const hasNotified = useRef(false);

    useEffect(() => {
        if (hasNotified.current) return;

        const notify = () => {
            hasNotified.current = true;

            if (Notification.permission === 'granted') {
                new Notification(message);
                onDone?.();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                        new Notification(message);
                    }
                    onDone?.();
                });
            } else {
                onDone?.();
            }
        };

        notify();
    }, [message, onDone]);

    return null;
};

export default SystemNotification;