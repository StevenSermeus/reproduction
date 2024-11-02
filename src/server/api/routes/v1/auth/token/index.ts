import { OpenAPIHono } from "@hono/zod-openapi";

import { defaultHook } from "@/server/api/middleware/zod-handle";

import { logoutRoute } from "./logout";
import { renewRoute } from "./renew";

export const tokenRoute = new OpenAPIHono({
	defaultHook: defaultHook,
})
	.route("/", logoutRoute)
	.route("/", renewRoute);
