'use client';
import { useEffect } from "react";

export default function usePushNotifications() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            console.warn("Service workers not supported or not in browser.");
            return;
        }

        const subscribe = async () => {
            try {
                const register = await navigator.serviceWorker.register("/sw.js");
                console.log("✅ Service Worker registered");

                const { publicKey } = await fetch("http://localhost:5000/vapidPublicKey").then(res => res.json());

                // Get existing subscription
                const existingSubscription = await register.pushManager.getSubscription();
                if (existingSubscription) {
                    console.warn("🔁 Unsubscribing existing push subscription...");
                    await existingSubscription.unsubscribe();
                }

                // Now create a new subscription
                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: publicKey
                });

                console.log("✅ New push subscription:", subscription);

                await fetch("http://localhost:5000/subscribe", {
                    method: "POST",
                    body: JSON.stringify(subscription),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                console.log("✅ Subscription sent to server successfully.");
            } catch (err) {
                console.error("❌ Error during push subscription:", err);
            }
        };

        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
            if (permission === "granted") {
                subscribe();
            } else {
                console.warn("Permission not granted.");
            }
        });
    }, []);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
