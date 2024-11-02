import { z } from "@hono/zod-openapi";

export const UserSchema = z
	.object({
		id: z.number().openapi({ example: 1 }),
		email: z.string().email().openapi({ example: "johndoe@gmail.com" }),
		username: z.string().openapi({ example: "jdoe" }),
		role: z
			.enum(["AUTHOR", "EDITOR", "ADMINISTRATOR", "PLAYER"])
			.openapi({ examples: ["AUTHOR", "EDITOR", "ADMINISTRATOR", "PLAYER"] }),
		displayName: z.string().openapi({ example: "John Doe" }),
	})
	.openapi("User");
