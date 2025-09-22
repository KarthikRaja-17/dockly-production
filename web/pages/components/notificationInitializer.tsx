'use client';

import usePushNotifications from "../../utils/useNotification";


export default function NotificationInitializer() {
    usePushNotifications();
    return null; // doesn't render anything visible
}