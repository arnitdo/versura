// Refer to file `@/utils/init.sql` for PostgreSQL type definitions

type APIResponseRequestStatus =
	// 2xx
	// 3xx
	// 4xx
	"ERR_BODY_REQUIRED" |
	"ERR_INTERNAL_ERROR" |
	"ERR_INVALID_METHOD" |
	"ERR_MISSING_BODY_PARAMS"

type APIResponse = {
	requestStatus: APIResponseRequestStatus
}


export {
	APIResponse
}