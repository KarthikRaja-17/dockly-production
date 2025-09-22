"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminUser } from "../../comman";


export default function UserRedirectPage() {
    const router = useRouter();
    const [username, setUsername] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const isAdmin = adminUser(Number(role));


    useEffect(() => {
        const username = localStorage.getItem("username") || "";
        const role = localStorage.getItem("duser") || "";
        setUsername(username);
        setRole(role);
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            router.replace(`/${username}/dashboard`);
        } else if (isAdmin) {
            router.replace(`/admin/${username}/users`);
        }
    }, [username]);

    return;
}
