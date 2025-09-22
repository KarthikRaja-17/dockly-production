"use client";
import { createContext, useContext } from "react";

export const UserContext = createContext<any>(null);
export const useCurrentUser = () => useContext(UserContext);