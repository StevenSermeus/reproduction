import type { AppRoutes } from "@/api";
import { hc } from "hono/client";

export const $api = hc<AppRoutes>("http://localhost:3000", {
	init: {
		credentials: "include",
	},
	async fetch(input, requestInit, Env, executionCtx) {
		console.log("fetching", Env, executionCtx);

		const res = await fetch(input, requestInit);
		if (res.status === 401 && !input.toString().includes("auth/token/renew")) {
			const resRenew = await $api.v1.auth.token.renew.$get();
			if (resRenew.ok) {
				console.log("Token has been renewed in the background");
				return fetch(input, requestInit);
			}

			console.log("Failed to renew token");
			await Promise.reject(res);
		}

		return res;
	},
}).api;
