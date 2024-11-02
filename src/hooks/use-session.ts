import { SessionContext } from "@/providers/session";
import React from "react";

export function useSession() {
	return React.useContext(SessionContext);
}
