"use client";

import type { InferRequestType, InferResponseType } from "hono";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { $api } from "@/api/react";
import DatePickerWithYearSelection from "@/components/date-picker-with-year";
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
import { subYears } from "date-fns";

const registerSchema = z.object({
	username: z
		.string({ message: "You must provide a valid name !" })
		.min(2, "Your name should at least contain 2 letters"),
	displayName: z
		.string({ message: "You must provide a valid name !" })
		.min(2, "Your name should at least contain 2 letters"),
	email: z
		.string({
			message: "You must provide a valid email!",
		})
		.email("You must provide a valid email!"),
	dateOfBirth: z.string().date("You must provide a valid date of birth!"),
	password: z
		.string({
			message: "You must provide a valid password!",
		})
		.min(8, "Your password must be at least 8 characters long")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
			"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
		),
	passwordConfirmation: z
		.string({
			message: "You must provide a valid password!",
		})
		.min(8, "Your password must be at least 8 characters long")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
			"Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
		),
});

export default function Register() {
	const router = useRouter();
	const params = useSearchParams();
	const register = $api.v1.auth.register.$post;
	const registerMutation = useMutation<
		InferResponseType<typeof register>,
		Error,
		InferRequestType<typeof register>["json"]
	>({
		mutationFn: async (json) => {
			const res = await register({ json });
			if (res.ok) {
				return await res.json();
			}
			throw new Error((await res.json()).message);
		},
		mutationKey: ["auth", "register"],
	});

	const form = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			displayName: "",
			email: "",
			password: "",
			passwordConfirmation: "",
			dateOfBirth: "",
		},
	});

	function onSubmit(values: z.infer<typeof registerSchema>) {
		if (values.password !== values.passwordConfirmation) {
			toast.error("Passwords do not match");
			return;
		}

		if (new Date(values.dateOfBirth) > new Date()) {
			toast.error("Date of birth cannot be in the future");
			return;
		}

		if (subYears(new Date(), 9) < new Date(values.dateOfBirth)) {
			toast.error("You must be at least 9 years old to register");
			return;
		}

		if (subYears(new Date(), 100) > new Date(values.dateOfBirth)) {
			toast.error("You must be at most 100 years old to register");
			return;
		}

		const loadingToast = toast.loading("Registering...");
		registerMutation.mutate(values, {
			onSuccess: () => {
				toast.dismiss(loadingToast);
				toast.success("Registered successfully");
				const redirect = params.get("redirect");
				router.push(redirect || "/");
			},
			onError: (error) => {
				toast.dismiss(loadingToast);
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
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="items-center">
				<UserRound className="size-10 rounded-full bg-accent p-2.5 text-muted-foreground" />
				<CardTitle className="text-xl">Sign Up</CardTitle>
				<CardDescription>
					Enter your information to create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="jdoe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="displayName"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Name & surname</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="me@example.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="dateOfBirth"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Date of birth</FormLabel>
										<DatePickerWithYearSelection
											onChange={field.onChange}
											value={field.value}
											minDate={subYears(new Date(), 100)}
										/>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="passwordConfirmation"
								render={({ field }) => (
									<FormItem className="grid gap-2">
										<FormLabel>Password confirmation</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full">
								Create an account
							</Button>
						</div>
						<div className="mt-4 text-sm text-muted-foreground">
							By continuing, you&apos;re agreeing to our
							<Link href="#" className="ml-1 underline hover:text-primary">
								Terms and Privacy Policy.
							</Link>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
