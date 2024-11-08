import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { type AppRoutes, hono } from "@/api";
import prisma from "@/libs/prisma";
import { RESPONSE_TIMEOUT, Timer } from "@/tests/utils";

const client = testClient<AppRoutes>(hono);

describe("Renew", () => {
	let cookies: string[] = [];

	beforeAll(async () => {
		const res = await client.api.v1.auth.register.$post({
			json: {
				email: "renewtest@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				displayName: "John Doe",
				username: "renewtest",
				dateOfBirth: "2000-01-01",
			},
		});
		cookies = res.headers.getSetCookie();
	});

	afterAll(async () => {
		await prisma.user.deleteMany({
			where: {
				email: {
					in: ["renewtest@gmail.com"],
				},
			},
		});
	});

	test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
		const time = new Timer();

		await client.api.v1.auth.token.renew.$get(undefined, {
			headers: { cookie: cookies.join("; ") },
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
	});

	test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
		const time = new Timer();

		await client.api.v1.auth.token.renew.$get();

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
	});

	test("Correct", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.token.renew.$get(undefined, {
			headers: {
				cookie: cookies.join("; "),
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(200);
		expect(res.headers.getSetCookie().length).toBe(1);
		expect(res.headers.getSetCookie()[0]).toContain("access_token");
		expect(await res.json()).toEqual({ message: "Token renewed" });
	});

	test("Incorrect", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.token.renew.$get(undefined, {
			headers: {
				cookie: "access_token=invalid",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(401);
		expect(res.headers.getSetCookie().length).toBe(0);
		expect(await res.json()).toEqual({ message: "Unauthorized" });
	});

	test("No cookie", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.token.renew.$get();

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(401);
		expect(res.headers.getSetCookie().length).toBe(0);
		expect(await res.json()).toEqual({ message: "Unauthorized" });
	});

	test("Invalid cookie", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.token.renew.$get(undefined, {
			headers: {
				cookie: "refresh_token=invalid",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(401);
		expect(res.headers.getSetCookie().length).toBe(0);
		expect(await res.json()).toEqual({ message: "Unauthorized" });
	});
});
