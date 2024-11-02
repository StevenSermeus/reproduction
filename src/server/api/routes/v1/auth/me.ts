import { z } from "zod";

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

import { logger } from "@/libs/logger";
import { UserSchema } from "@/libs/openApi";
import prisma from "@/libs/prisma";
import { protectedRoute } from "@/server/api/middleware/auth";
import { defaultHook } from "@/server/api/middleware/zod-handle";
import type { VariablesHono } from "@/server/api/variables";

const me = new OpenAPIHono<{ Variables: VariablesHono }>({
	defaultHook: defaultHook,
});

const meRouteOpenApi = createRoute({
	method: "get",
	description: "Get user information",
	tags: ["Auth"],
	path: "/me",
	security: [
		{
			AccessToken: [],
		},
	],
	middleware: [protectedRoute],
	responses: {
		404: {
			description: "User not found",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		401: {
			description: "Unauthorized",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		500: {
			description: "Internal server error",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		200: {
			description: "User information",
			content: {
				"application/json": {
					schema: UserSchema,
				},
			},
		},
	},
});

export const meRoute = me.openapi(meRouteOpenApi, async (c) => {
	try {
		const userId = c.get("user_id");

		if (!userId || Number.isNaN(Number(userId))) {
			return c.json({ message: "User not found" }, 404);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: Number(userId),
			},
		});

		if (!user) {
			return c.json({ message: "User not found" }, 404);
		}

		return c.json(
			{
				id: user.id,
				email: user.email,
				username: user.username,
				role: user.role,
				displayName: user.displayName,
			},
			200,
		);
	} catch (e) {
		logger.error(e);

		return c.json({ message: "Internal server error" }, 500);
	}
});
