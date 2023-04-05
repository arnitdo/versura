// Refer to file `@/utils/init.sql` for PostgreSQL type definitions

import {UserRole} from "@/utils/types/queryTypedefs";

interface DecodedJWTCookie {
	walletAddress: string,
	userRole: UserRole
}

type S3ObjectMethods = "PUT" | "GET" | "DELETE"

export {
	DecodedJWTCookie,
	S3ObjectMethods
}