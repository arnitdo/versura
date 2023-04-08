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
	invalidParams?: string[],
	missingParams?: string[]
}

interface LoginResponse extends APIResponse {
	userRole?: UserRole,
}

interface SignupResponse extends APIResponse {

}

interface LogoutResponse extends APIResponse {

}

interface CreateFundraiserResponse extends APIResponse {
	fundraiserId: number,
}

interface FundraiserMedia {
	mediaURL: string,
	mediaContentType: string
}

interface GetFundraiserResponse extends APIResponse {
	fundraiserData: Omit<
		FundRaisers,
		"fundraiserMediaObjectKeys"
	> & {
		"fundraiserMedia": FundraiserMedia[]
	}
}

interface GetFundraiserFeedResponse extends APIResponse {
	feedData: GetFundraiserResponse["fundraiserData"][]
}

interface PresignedURLResponse extends APIResponse {
	presignedUrl: string
}

interface MediaCallbackResponse extends APIResponse {

}

export {
	SignupResponse,
	LoginResponse,
	LogoutResponse,
	APIResponse,
	CreateFundraiserResponse,
	GetFundraiserResponse,
	GetFundraiserFeedResponse,
	PresignedURLResponse,
	FundraiserMedia,
	MediaCallbackResponse
};
