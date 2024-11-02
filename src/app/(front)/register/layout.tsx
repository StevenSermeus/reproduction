import type React from "react";

export default function RegistrationLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<section className="py-12">
			<div className="container">
				<div className="flex flex-col gap-4">{children}</div>
			</div>
		</section>
	);
}
