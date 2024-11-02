import { Suspense } from "react";

import { RegisterSkeleton } from "@/components/loading/register-loading";
import Register from "@/components/register";

export default function RegisterPage() {
	return (
		<Suspense fallback={<RegisterSkeleton />}>
			<Register />
		</Suspense>
	);
}
