import {FundRaisers, UserRole} from "@/utils/types/queryTypedefs";

export type APIResponseCode =
	0 | 200 | 400 | 403 | 404 | 500
type APIResponseRequestStatus =
// 2xx
	"SUCCESS" |
	// 3xx
	// 4xx
	"ERR_BODY_REQUIRED" |
	"ERR_INTERNAL_ERROR" |
	"ERR_INVALID_METHOD" |
	"ERR_INVALID_BODY_PARAMS" |
	"ERR_MISSING_BODY_PARAMS" |
	"ERR_INVALID_QUERY_PARAMS" |
	"ERR_MISSING_QUERY_PARAMS" |
	"ERR_AUTH_REQUIRED"	|
	"ERR_NOT_FOUND"

interface APIResponse {
	requestStatus: APIResponseRequestStatus
	invalidParams?: string[]
}

interface LoginResponse extends APIResponse {
	userRole?: UserRole,
}

interface SignupResponse extends APIResponse {

}

interface CreateFundraiserResponse extends APIResponse {
	fundraiserId: number,
}

interface GetFundraiserResponse extends APIResponse {
	fundraiserData: FundRaisers
}

interface GetFundraiserFeedResponse extends APIResponse {
	feedData: GetFundraiserResponse["fundraiserData"][]
}

interface ContentManagementPresignedUrlResponse extends APIResponse {
	presignedUrl: string
}

export {
	SignupResponse,
	LoginResponse,
	APIResponse,
	CreateFundraiserResponse,
	GetFundraiserResponse,
	GetFundraiserFeedResponse,
	ContentManagementPresignedUrlResponse
};
