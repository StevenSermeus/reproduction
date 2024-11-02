import { OpenAPIHono } from "@hono/zod-openapi";

import { defaultHook } from "@/server/api/middleware/zod-handle";

import { authRoute } from "./auth";

export const v1Route = new OpenAPIHono({
	defaultHook: defaultHook,
}).route("/auth", authRoute);
