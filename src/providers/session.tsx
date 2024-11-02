"use client";

import type React from "react";
import { createContext } from "react";

import { useQuery } from "@tanstack/react-query";

import { $api } from "@/api/react";

type Session = {
	id: string;
	email: string;
	name: string;
};

export const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
	const query = useQuery({
		queryKey: ["auth", "me"],
		queryFn: async () => {
			try {
				const res = await $api.v1.auth.me.$get();

				if (res.ok) {
					return await res.json();
				}
			} catch (error) {
				return null;
			}
		},
	});

	return (
		<SessionContext.Provider value={query.data ?? null}>
			{children}
		</SessionContext.Provider>
	);
}
