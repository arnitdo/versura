// Refer to file `@/utils/init.sql` for PostgreSQL type definitions

import {UserRole} from "@/utils/types/queryTypedefs";

export type APIResponseCode =
	0 | 200 | 400 | 403 | 404 | 500

type APIResponseRequestStatus =
	// 2xx
	"SUCCESS" |
	// 3xx
	// 4xx
	"ERR_BODY_REQUIRED" 		|
	"ERR_INTERNAL_ERROR" 		|
	"ERR_INVALID_METHOD"		|
	"ERR_INVALID_PARAMS" 		|
	"ERR_MISSING_BODY_PARAMS" 	|
	"ERR_AUTH_REQUIRED"

interface APIResponse {
	requestStatus: APIResponseRequestStatus
	invalidParams?: string[]
}

interface LoginResponse extends APIResponse {
	userRole?: UserRole,
}

interface SignupResponse extends APIResponse{

}

interface DecodedJWTCookie {
	walletAddress: string,
	userRole: UserRole
}

export {
	APIResponse,
	LoginResponse,
	SignupResponse,
	DecodedJWTCookie
}