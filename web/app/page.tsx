"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "./routes";
import DocklyLogin from "./docklyIn";
import { adminUser } from "./comman";

export default function Home() {
  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem("Dtoken");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("duser");
    const isAdmin = adminUser(Number(role));

    if (username && token) {
      router.replace(`/${username}/dashboard`);
    }

    if (isAdmin && username && token) {
      router.replace(`/admin/${username}/users`);
    }
  }, []);

  return <DocklyLogin />;
}
