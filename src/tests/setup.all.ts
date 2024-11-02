import { beforeAll } from "vitest";
import { inject } from "vitest";

import { PrismaClient } from "@prisma/client";

import prisma from "@/server/api/libs/prisma";

beforeAll(() => {
	const db = inject("DATABASE_URL");
	// @ts-expect-error
	// biome-ignore lint/suspicious/noImportAssign: We need to assign the prisma client to a variable
	prisma = new PrismaClient({
		datasources: {
			db: {
				url: db,
			},
		},
	});
});
