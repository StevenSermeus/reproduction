"use client";

import React from "react";
import { useForm } from "react-hook-form";

import { useRouter, useSearchParams } from "next/navigation";

import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { $api } from "@/api/react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserRound } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
	emailOrUsername: z.string({
		message: "You must provide a valid email or username!",
	}),
	password: z
		.string({
			message: "You must provide a valid password !",
		})
		.min(8, "Your password must be at least 8 characters long"),
});

export default function Login() {
	const param = useSearchParams();
	const router = useRouter();
	const login = $api.v1.auth.login.$post;
	const queryClient = useQueryClient();

	const loginMutation = useMutation<
		InferResponseType<typeof login>,
		Error,
		InferRequestType<typeof login>["json"]
	>({
		mutationFn: async (json) => {
			const res = await login({ json });
			if (res.ok) {
				return await res.json();
			}
			throw new Error((await res.json()).message || "Failed to login");
		},
		mutationKey: ["auth", "login"],
	});

	const form = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			emailOrUsername: "",
			password: "",
		},
	});

	function onSubmit(values: z.infer<typeof loginSchema>) {
		const t = toast.loading("Logging in...");
		loginMutation.mutate(values, {
			onSuccess: () => {
				toast.dismiss(t);
				toast.success("Logged in successfully");
				queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
				const redirect = param.get("redirect") ?? "/";
				router.push(redirect);
			},
			onError: (error) => {
				toast.dismiss(t);
				toast.error(error.message, {
					action: {
						label: "Close",
						onClick: () => console.log("close"),
					},
				});
			},
		});
	}

	return (
		<section className="py-32">
			<div className="container">
				<div className="flex flex-col gap-4">
					<Card className="mx-auto w-full max-w-md">
						<CardHeader className="items-center">
							<UserRound className="size-10 rounded-full bg-accent p-2.5 text-muted-foreground" />
							<CardTitle className="text-xl">Log in with your email</CardTitle>
							<CardDescription>Enter your information to login</CardDescription>
						</CardHeader>
						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)}>
									<div className="grid gap-4">
										<div className="grid gap-2">
											<FormField
												control={form.control}
												name="emailOrUsername"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email or username</FormLabel>
														<FormControl>
															<Input placeholder="me@example.com" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<div className="grid gap-2">
											<FormField
												control={form.control}
												name="password"
												render={({ field }) => (
													<FormItem className="w-full">
														<FormLabel>Password</FormLabel>
														<FormControl>
															<Input {...field} type="password" />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<Button type="submit" className="w-full">
											Log in
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
					<div className="mx-auto flex gap-1 text-sm">
						<p>Don&apos;t have an account yet?</p>
						<Link href="/register" className="underline">
							Register
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
