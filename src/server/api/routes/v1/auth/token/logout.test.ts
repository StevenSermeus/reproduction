import { testClient } from "hono/testing";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

import { type AppRoutes, hono } from "@/api";
import prisma from "@/libs/prisma";
import { RESPONSE_TIMEOUT, Timer } from "@/tests/utils";

const client = testClient<AppRoutes>(hono);

describe("Logout", () => {
  let cookies: string[] = [];

  beforeAll(async () => {
    await client.api.v1.auth.register.$post({
      json: {
        email: "logouttest@gmail.com",
        password: "#Password123",
        passwordConfirmation: "#Password123",
        displayName: "John Doe",
        username: "logouttest",
        dateOfBirth: "2000-01-01",
      },
    });
  });

  beforeEach(async () => {
    const res = await client.api.v1.auth.login.$post({
      json: {
        emailOrUsername: "logouttest",
        password: "#Password123",
      },
    });
    cookies = res.headers.getSetCookie();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "logout",
        },
      },
    });
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
    const time = new Timer();

    const res = await client.api.v1.auth.token.logout.$post(undefined, {
      headers: {
        cookie: cookies.join("; "),
      },
    });

    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(200);
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
    await client.api.v1.auth.token.logout.$post();
    const time = new Timer();
    console.log(cookies);
    const res = await client.api.v1.auth.token.logout.$post(undefined, {
      headers: {
        cookie: cookies.join("; "),
      },
    });

    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(401);
  });

  test("Correct", async () => {
    const res = await client.api.v1.auth.me.$get(undefined, {
      headers: {
        cookie: cookies.join("; "),
      },
    });
    expect(res.status).toBe(200);

    const time = new Timer();
    console.log(cookies);
    //403 even if the user is logged in===m
    const res2 = await client.api.v1.auth.token.logout.$post(undefined, {
      headers: {
        cookie: cookies.join("; "),
      },
    });

    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res2.status).toBe(200);
    expect(res2.headers.getSetCookie()).toEqual([
      "refresh_token=; Max-Age=0; Path=/; HttpOnly",
      "access_token=; Max-Age=0; Path=/; HttpOnly",
    ]);
  });
});
