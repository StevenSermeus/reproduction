import { Toaster } from "@/components/ui/sonner";
import {
	ReactQueryProvider,
	SessionProvider,
	ThemeProvider,
} from "@/providers";

import type React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ReactQueryProvider>
			<SessionProvider>
				<Toaster />
				<ThemeProvider>{children}</ThemeProvider>
			</SessionProvider>
		</ReactQueryProvider>
	);
}
