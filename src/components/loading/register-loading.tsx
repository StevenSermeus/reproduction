import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const RegisterSkeleton = () => {
	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader className="items-center">
				<Skeleton className="size-10 rounded-full bg-accent p-2.5 text-muted-foreground" />
				<Skeleton className="h-8 w-24" />
				<Skeleton className="h-4 w-72" />
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					{[undefined, undefined, undefined, undefined].map(() => (
						<span key={Math.random()} className="grid gap-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-10 w-full rounded-md" />
						</span>
					))}
					<Skeleton className="h-10 w-full rounded-md" />
				</div>
			</CardContent>
		</Card>
	);
};
