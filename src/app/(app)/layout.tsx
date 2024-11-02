import { Providers, ThemeProvider } from "@/providers";
import type { Metadata } from "next";

import "@/styles/globals.css";

import { AppSidebar } from "@/components/navigation/app/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
	title: "CipeStories",
	description: "Welcome to CipeStories, your Cipe Studio website.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					GeistSans.variable,
					GeistMono.variable,
					"min-h-screen antialiased",
				)}
			>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Providers>
						<SidebarProvider>
							<AppSidebar />
							{children}
						</SidebarProvider>
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
