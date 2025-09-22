"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DocklyLogin from "../docklyIn";
import { adminUser } from "../comman";

export default function Home() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("Dtoken");
        const username = localStorage.getItem("username");
        const role = localStorage.getItem("duser");
        const checkAdmin = adminUser(Number(role));

        if (checkAdmin && username && token) {
            router.replace(`/admin/${username}/users`);
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [router]);


    if (isAdmin === false) {
        return <DocklyLogin />;
    }

    return null;
}
