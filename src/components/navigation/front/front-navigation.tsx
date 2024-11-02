"use client";

import type { InferResponseType } from "hono";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { $api } from "@/app/_api";
import { ModeToggle } from "@/components/theme-selector";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

export default function FrontNavigation() {
	const router = useRouter();
	const client = useQueryClient();
	const params = useSearchParams();
	const session = useSession();
	const redirect = params.get("redirect");

	const logout = $api.v1.auth.token.logout.$post;
	const logoutMutation = useMutation<
		InferResponseType<typeof logout>,
		Error,
		void
	>({
		mutationFn: async () => {
			const res = await logout();
			if (res.ok) {
				return await res.json();
			}
			throw new Error((await res.json()).message || "Failed to log out");
		},
		mutationKey: ["auth", "logout"],
	});

	return (
		<section className="py-3">
			<div className="container">
				<nav className="hidden justify-between lg:flex">
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<img
								src="https://www.shadcnblocks.com/images/block/block-1.svg"
								className="w-8"
								alt="logo"
							/>
							<span className="text-xl font-bold">CipeStories</span>
						</div>
						<div className="flex items-center">
							<NavigationMenu>
								<NavigationMenuList>
									<NavigationMenuItem>
										<NavigationMenuLink
											className={cn(
												navigationMenuTriggerStyle(),
												"text-muted-foreground",
											)}
											href="/"
										>
											Home
										</NavigationMenuLink>
									</NavigationMenuItem>
									<NavigationMenuItem>
										<NavigationMenuLink
											className={cn(
												navigationMenuTriggerStyle(),
												"text-muted-foreground",
											)}
											href="/protected"
										>
											Protected
										</NavigationMenuLink>
									</NavigationMenuItem>
								</NavigationMenuList>
							</NavigationMenu>

							<Link
								className={cn(
									"text-muted-foreground",
									navigationMenuTriggerStyle,
									buttonVariants({
										variant: "ghost",
									}),
								)}
								href="#"
							>
								Pricing
							</Link>
							<Link
								className={cn(
									"text-muted-foreground",
									navigationMenuTriggerStyle,
									buttonVariants({
										variant: "ghost",
									}),
								)}
								href="#"
							>
								Blog
							</Link>
						</div>
					</div>
					{!session && (
						<div className="flex gap-2">
							<Button variant="outline" asChild>
								<Link href="/login">Log in</Link>
							</Button>
							<Button asChild>
								<Link href="/register">Sign up</Link>
							</Button>
							<ModeToggle />
						</div>
					)}
					{session && (
						<div className="flex gap-2">
							<Button
								variant="destructive"
								onClick={() => {
									const t = toast.loading("Logging out...");
									logoutMutation.mutate(undefined, {
										onSuccess: async () => {
											toast.dismiss(t);
											toast.success("Logged out");
											await client.invalidateQueries({
												queryKey: ["auth", "me"],
											});
											router.push("/login");
										},
										onError: (error) => {
											toast.dismiss(t);
											toast.error(error.message);
										},
									});
								}}
							>
								Log out
							</Button>
							<ModeToggle />
						</div>
					)}
				</nav>
				<div className="block lg:hidden">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<img
								src="https://www.shadcnblocks.com/images/block/block-1.svg"
								className="w-8"
								alt="logo"
							/>
							<span className="text-xl font-bold">CipeStories</span>
						</div>
						<Sheet>
							<SheetTrigger asChild>
								<Button variant={"outline"} size={"icon"}>
									<Menu className="size-4" />
								</Button>
							</SheetTrigger>
							<SheetContent className="overflow-y-auto">
								<SheetHeader>
									<SheetTitle>
										<div className="flex items-center gap-2">
											<img
												src="https://www.shadcnblocks.com/images/block/block-1.svg"
												className="w-8"
												alt="logo"
											/>
											<span className="text-xl font-bold">CipeStories</span>
											<ModeToggle />
										</div>
									</SheetTitle>
								</SheetHeader>
								<div className="my-8 flex flex-col gap-4">
									<Link href="#" className="font-semibold">
										Home
									</Link>
									<Link href="#" className="font-semibold">
										Pricing
									</Link>
									<Link href="#" className="font-semibold">
										Blog
									</Link>
								</div>
								<div className="border-t pt-4">
									<div className="grid grid-cols-2 justify-start">
										<Link
											className={cn(
												buttonVariants({
													variant: "ghost",
												}),
												"justify-start text-muted-foreground",
											)}
											href="#"
										>
											Press
										</Link>
										<Link
											className={cn(
												buttonVariants({
													variant: "ghost",
												}),
												"justify-start text-muted-foreground",
											)}
											href="#"
										>
											Contact
										</Link>
										<Link
											className={cn(
												buttonVariants({
													variant: "ghost",
												}),
												"justify-start text-muted-foreground",
											)}
											href="#"
										>
											Imprint
										</Link>
										<Link
											className={cn(
												buttonVariants({
													variant: "ghost",
												}),
												"justify-start text-muted-foreground",
											)}
											href="#"
										>
											Sitemap
										</Link>
										<Link
											className={cn(
												buttonVariants({
													variant: "ghost",
												}),
												"justify-start text-muted-foreground",
											)}
											href="#"
										>
											Legal
										</Link>
										<Link
											className={cn(
												buttonVariants({
													variant: "ghost",
												}),
												"justify-start text-muted-foreground",
											)}
											href="#"
										>
											Cookie Settings
										</Link>
									</div>
									{!session && (
										<div className="mt-2 flex flex-col gap-3">
											<Button variant={"outline"}>Log in</Button>
											<Button>Sign up</Button>
										</div>
									)}
									{session && (
										<Button
											variant="destructive"
											className="w-full"
											onClick={() => {
												const t = toast.loading("Logging out...");
												logoutMutation.mutate(undefined, {
													onSuccess: async () => {
														toast.dismiss(t);
														toast.success("Logged out");
														await client.invalidateQueries({
															queryKey: ["auth", "me"],
														});
														router.push("/login");
													},
													onError: (error) => {
														toast.dismiss(t);
														toast.error(error.message);
													},
												});
											}}
										>
											Log out
										</Button>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</section>
	);
}
