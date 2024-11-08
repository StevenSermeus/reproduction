import { testClient } from "hono/testing";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { type AppRoutes, hono } from "@/api";
import prisma from "@/libs/prisma";
import { RESPONSE_TIMEOUT, Timer } from "@/tests/utils";

const client = testClient<AppRoutes>(hono);

describe("Login", () => {
	beforeAll(async () => {
		await client.api.v1.auth.register.$post({
			json: {
				email: "testlogin@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "loginjdoe",
				displayName: "John Doe",
			},
		});

		await client.api.v1.auth.register.$post({
			json: {
				email: "testlogin2@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "loginjaned",
				displayName: "Jane Doe",
			},
		});

		await client.api.v1.auth.register.$post({
			json: {
				email: "testlogin3@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "loginmariahc",
				displayName: "Mariah Carey",
			},
		});
	});

	afterAll(async () => {
		await prisma.user.deleteMany({
			where: {
				email: {
					contains: "login",
				},
			},
		});
	});

	test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
		const time = new Timer();

		await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin2@gmail.com",
				password: "#Password123",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
	});

	test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
		const time = new Timer();

		await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "dsqsdq@gmail.com",
				password: "#Password123",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
	});

	test("Multiple logins at the same time", async () => {
		// A client can share the same JWT in rare cases if the login is done at the same time
		// This is not a security issue
		// In case the refresh token is revoked it will be on all devices not only one
		const res = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin3@gmail.com",
				password: "#Password123",
			},
		});
		const res2 = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin3@gmail.com",
				password: "#Password123",
			},
		});
		const res3 = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin3@gmail.com",
				password: "#Password123",
			},
		});

		expect(res.status).toBe(200);
		expect(res2.status).toBe(200);
		expect(res3.status).toBe(200);
	});

	test("Correct email", async () => {
		const res = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin@gmail.com",
				password: "#Password123",
			},
		});

		expect(res.status).toBe(200);
		expect(res.headers.getSetCookie().length).toBe(2);
		expect(res.headers.getSetCookie()[0]).toContain("refresh_token");
		expect(res.headers.getSetCookie()[1]).toContain("access_token");
	});

	test("Correct username", async () => {
		const res = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "loginjdoe",
				password: "#Password123",
			},
		});

		expect(res.status).toBe(200);
		expect(res.headers.getSetCookie().length).toBe(2);
		expect(res.headers.getSetCookie()[0]).toContain("refresh_token");
		expect(res.headers.getSetCookie()[1]).toContain("access_token");
	});

	test("Wrong email", async () => {
		const res = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin4@gmail.com",
				password: "#Password123",
			},
		});

		expect(res.status).toBe(404);
		expect(res.headers.getSetCookie().length).toBe(0);
		expect(await res.json()).toEqual({ message: "Failed to login" });
	});

	test("Wrong username", async () => {
		const res = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "jdoe2",
				password: "#Password123",
			},
		});

		expect(res.status).toBe(404);
		expect(res.headers.getSetCookie().length).toBe(0);
		expect(await res.json()).toEqual({ message: "Failed to login" });
	});

	test("Wrong password", async () => {
		const res = await client.api.v1.auth.login.$post({
			json: {
				emailOrUsername: "testlogin@gmail.com",
				password: "#Password1234",
			},
		});

		expect(res.status).toBe(404);
		expect(res.headers.getSetCookie().length).toBe(0);
		expect(await res.json()).toEqual({ message: "Failed to login" });
	});
});
