import type { Context } from "hono";
import type { ZodError } from "zod";

import {
	ConnectionAttemptsCounter,
	ConnectionAttemptsFailedCounter,
} from "@/server/api/libs/prometheus";

export const defaultHook = (
	result:
		| {
				success: false;
				error: ZodError;
		  }
		| {
				success: true;
				// biome-ignore lint/suspicious/noExplicitAny: any is used to avoid circular dependencies
				data: any;
		  },
	c: Context,
) => {
	if (!result.success) {
		return c.json(
			{
				message: result.error.errors[0]?.message,
			},
			400,
		);
	}
};

export const loginValidationHook = (
	result:
		| {
				success: false;
				error: ZodError;
		  }
		| {
				success: true;
				// biome-ignore lint/suspicious/noExplicitAny: any is used to avoid circular dependencies
				data: any;
		  },
	c: Context,
) => {
	ConnectionAttemptsCounter.inc(1);

	if (!result.success) {
		ConnectionAttemptsFailedCounter.inc(1);

		return c.json(
			{
				message: result.error.errors[0]?.message,
			},
			400,
		);
	}
};
