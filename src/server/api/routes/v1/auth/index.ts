import { OpenAPIHono } from "@hono/zod-openapi";

import { defaultHook } from "@/server/api/middleware/zod-handle";

import { loginRoute } from "./login";
import { meRoute } from "./me";
import { registerRoute } from "./register";
import { tokenRoute } from "./token";

export const authRoute = new OpenAPIHono({
	defaultHook: defaultHook,
})
	.route("/", loginRoute)
	.route("/", meRoute)
	.route("/", registerRoute)
	.route("/token", tokenRoute);
