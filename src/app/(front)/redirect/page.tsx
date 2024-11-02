"use client";

import React, { useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { $api } from "@/app/_api";
import LoadingPage from "@/components/loading/loading-page";

export default function Page() {
	const router = useRouter();
	const searchParams = useSearchParams();

	async function refreshRedirect() {
		try {
			const pending = $api.v1.auth.token.renew.$get();
			const redirect = searchParams.get("redirect") ?? "/";
			const res = await pending;
			if (res.status === 200) {
				router.push(redirect);
				return;
			}
			router.push(`/login?redirect=${redirect}`);
		} catch (e) {
			router.push(`/login?redirect=${searchParams.get("redirect")}`);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to run this effect only once
	useEffect(() => {
		refreshRedirect();
	}, []);

	return <LoadingPage text="Redirecting ..." />;
}