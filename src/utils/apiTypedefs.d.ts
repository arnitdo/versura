// Refer to file `@/utils/init.sql` for PostgreSQL type definitions

import {UserRole} from "@/utils/queryTypedefs";

type APIResponseRequestStatus =
	// 2xx
	"SUCCESS" |
	// 3xx
	// 4xx
	"ERR_BODY_REQUIRED" |
	"ERR_INTERNAL_ERROR" |
	"ERR_INVALID_METHOD" |
	"ERR_INVALID_PARAMS" |
	"ERR_MISSING_BODY_PARAMS"

interface APIResponse {
	requestStatus: APIResponseRequestStatus
}

interface LoginResponse extends APIResponse {
	userRole?: UserRole,
	invalidParams?: string[]
}

export {
	APIResponse,
	LoginResponse
}