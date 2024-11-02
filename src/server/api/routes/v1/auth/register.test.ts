import { testClient } from "hono/testing";
import { afterAll, describe, expect, test } from "vitest";

import { type AppRoutes, hono } from "@/api";
import prisma from "@/libs/prisma";
import { RESPONSE_TIMEOUT, Timer } from "@/tests/utils";

const client = testClient<AppRoutes>(hono);

describe("Register", () => {
	afterAll(async () => {
		await prisma.user.deleteMany({
			where: {
				email: {
					contains: "register",
				},
			},
		});
	});

	test("Correct", async () => {
		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertest@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerjdoe",
			},
		});
		const res2 = await client.api.v1.auth.me.$get(undefined, {
			headers: {
				cookie: res.headers.getSetCookie().join("; "),
			},
		});

		expect(res.status).toBe(201);
		expect(await res.json()).toMatchObject({
			email: "registertest@gmail.com",
			username: "registerjdoe",
		});
		expect(res2.status).toBe(200);
	}, 1000000000);

	test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
		const time = new Timer();

		await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertesttime@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registertime",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
	});

	test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
		const time = new Timer();

		await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertest@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registertimefailure",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
	});

	test("Already used email", async () => {
		await client.api.v1.auth.register.$post({
			json: {
				displayName: "Already Used",
				email: "registertestusedmail@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerusedemail",
			},
		});
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "Already Used",
				email: "registertestusedmail@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerusedemail2",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "Failed to register, email already used",
		});
	});

	test("Already used username", async () => {
		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertestusernametaken@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerjdoe",
			},
		});

		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "Failed to register, username already used",
		});
	});
});

describe("Register input validation", () => {
	test("No @ in the email", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registerinputtest",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerinputjdoe",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "You must provide a valid email !",
		});
	});

	test("No . in the email", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertest@gmail",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerinputjdoe",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "You must provide a valid email !",
		});
	});

	test("No username", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			//@ts-expect-error - Testing invalid input
			json: {
				displayName: "registerJohn Doe",
				email: "test@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "You must provide a valid username !",
		});
	});

	test("Too weak password => too small and only numbers", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertest@gmail.com",
				password: "123",
				passwordConfirmation: "123",
				dateOfBirth: "2000-01-01",
				username: "registerinputjdoe",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "Your password must be at least 8 characters long",
		});
	});

	test("Too weak password only letters", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertest@gmail.com",
				password: "testqqsdqsmdqs",
				passwordConfirmation: "testqqsdqsmdqs",
				dateOfBirth: "2000-01-01",
				username: "registerinputjdoe",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message:
				"Your password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character",
		});
	});

	test("Special characters in the username", async () => {
		const time = new Timer();

		const res = await client.api.v1.auth.register.$post({
			json: {
				displayName: "John Doe",
				email: "registertest@gmail.com",
				password: "#Password123",
				passwordConfirmation: "#Password123",
				dateOfBirth: "2000-01-01",
				username: "registerinputjdoe@",
			},
		});

		expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			message: "Your username cannot contain special characters",
		});
	});
});
