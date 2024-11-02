import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { z } from "zod";

import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Prisma } from "@prisma/client";

import { logger } from "@/libs/logger";
import { UserSchema } from "@/libs/openApi";
import { hash } from "@/libs/password";
import prisma from "@/libs/prisma";
import { env } from "@/server/api/config/env";
import { defaultHook } from "@/server/api/middleware/zod-handle";
import type { VariablesHono } from "@/server/api/variables";
import { subYears } from "date-fns";

export const registerRouteOpenApi = createRoute({
	method: "post",
	description: "Register a new user",
	tags: ["Auth"],
	path: "/register",
	security: [],
	request: {
		body: {
			content: {
				"application/json": {
					schema: z.object({
						username: z
							.string({ message: "You must provide a valid username !" })
							.min(2, "Your username should at least contain 2 letters")
							.refine(
								(value) => /^[a-zA-Z0-9_]*$/.test(value),
								"Your username cannot contain special characters",
							)
							.openapi({ example: "jdoe" }),
						email: z
							.string({ message: "You must provide a valid email !" })
							.email("You must provide a valid email !")
							.openapi({ example: "johndoe@gmail.com" }),
						password: z
							.string({ message: "You must provide a valid password !" })
							.min(8, "Your password must be at least 8 characters long")
							.regex(
								/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
								"Your password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character",
							)
							.openapi({ example: "CompleXPAssWORD123###" }),
						passwordConfirmation: z
							.string({ message: "You must provide a valid password !" })
							.min(8, "Your password must be at least 8 characters long")
							.regex(
								/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
								"Your password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character",
							)
							.openapi({ example: "CompleXPAssWORD123###" }),
						displayName: z
							.string({ message: "You must provide a valid name !" })
							.min(2, "Your name should at least contain 2 letters")
							.refine(
								(value) => /^[a-zA-Z0-9\-\s]*$/.test(value),
								"Your name cannot contain special characters",
							)
							.openapi({ example: "John Doe" }),
						dateOfBirth: z
							.string()
							.date("You must provide a valid date of birth !")
							.openapi({ example: "2000-01-01" }),
					}),
				},
			},
		},
	},
	responses: {
		400: {
			description: "Bad Request",
			content: {
				"application/json": {
					schema: z.object({
						message: z
							.string()
							.openapi({ example: "Failed to register, email already used" }),
					}),
				},
			},
		},
		500: {
			description: "Internal Server Error",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string(),
					}),
				},
			},
		},
		201: {
			description: "Login Successful",
			content: {
				"application/json": {
					schema: UserSchema,
				},
			},
		},
	},
});

const register = new OpenAPIHono<{ Variables: VariablesHono }>({
	defaultHook: defaultHook,
});

export const registerRoute = register.openapi(
	registerRouteOpenApi,
	async (c) => {
		const {
			email,
			password,
			username,
			passwordConfirmation,
			dateOfBirth,
			displayName,
		} = c.req.valid("json");

		if (
			new Date(dateOfBirth) > new Date() ||
			subYears(new Date(), 9) < new Date(dateOfBirth)
		) {
			return c.json(
				{ message: "You must provide a valid date of birth !" },
				400,
			);
		}

		if (password !== passwordConfirmation) {
			return c.json({ message: "Passwords do not match" }, 400);
		}

		const [hashedPassword, hashError] = await hash(password);

		if (hashError) {
			return c.json({ message: "Failed to register" }, 500);
		}

		try {
			const user = await prisma.user.create({
				data: {
					email,
					password: hashedPassword,
					username,
					displayName,
					role: "PLAYER",
					player: {
						create: {
							birthdate: new Date(dateOfBirth),
						},
					},
				},
			});

			const token = await sign(
				{
					user_id: user.id,
					exp:
						Math.floor(Date.now() / 1000) +
						60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
					iat: Math.floor(Date.now() / 1000),
				},
				env.JWT_ACCESS_SECRET,
			);
			const refreshToken = await sign(
				{
					user_id: user.id,
					exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
					iat: Math.floor(Date.now() / 1000),
				},
				env.JWT_REFRESH_SECRET,
			);

			setCookie(c, "refresh_token", refreshToken, {
				httpOnly: true,
				maxAge: 60 * 60 * 24 * env.REFRESH_TOKEN_EXPIRES_DAYS,
				path: "/api/v1/auth/token",
			});
			setCookie(c, "access_token", token, {
				httpOnly: true,
				maxAge: 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
			});

			await prisma.refreshToken.create({
				data: {
					token: refreshToken,
					userId: user.id,
				},
			});

			return c.json(
				{
					email: user.email,
					username: user.username,
					id: user.id,
					role: user.role,
					displayName: user.displayName,
				},
				201,
			);
		} catch (e) {
			console.error(e);
			logger.error(e);

			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				// The .code property can be accessed in a type-safe manner
				if (e.code === "P2002") {
					logger.info(
						"There is a unique constraint violation, a new user cannot be created",
					);

					return c.json(
						{
							message: `Failed to register, ${(e.meta?.target as string[])[0]} already used`,
						},
						400,
					);
				}
			}
			return c.json({ message: "Failed to register" }, 500);
		}
	},
);
