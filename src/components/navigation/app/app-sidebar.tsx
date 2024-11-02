"use client";

import type * as React from "react";

import { BookOpen, LifeBuoy, Send, Settings2 } from "lucide-react";

import { NavMain } from "@/components/navigation/app/nav-main";
import { NavSecondary } from "@/components/navigation/app/nav-secondary";
import { NavUser } from "@/components/navigation/app/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
	user: {
		name: "John Doe",
		email: "me@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Play",
			url: "#",
			icon: BookOpen,
			isActive: true,
			items: [
				{
					title: "Stories",
					url: "#",
					isActive: true,
				},
				{
					title: "Playing Sessions",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Support",
			url: "#",
			icon: LifeBuoy,
		},
		{
			title: "Feedback",
			url: "#",
			icon: Send,
		},
		{
			title: "Settings",
			url: "#",
			icon: Settings2,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="#">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
									<img
										src="https://www.shadcnblocks.com/images/block/block-1.svg"
										className="size-8"
										alt="logo"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">CipeStories</span>
									<span className="truncate text-xs">The best stories</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
