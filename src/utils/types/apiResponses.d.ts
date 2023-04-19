import {FundraiserMilestones, FundRaisers, UserRole} from "@/utils/types/queryTypedefs";
import {DecodedJWTCookie} from "@/utils/types/apiTypedefs";

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
	"ERR_ADMIN_REQUIRED" |
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

interface AuthRefreshResponse extends APIResponse {
	authStatus: "NO_AUTH" | "AUTH_ACTIVE",
	authData?: DecodedJWTCookie
}

interface CreateFundraiserResponse extends APIResponse {
	fundraiserId: number,
}

interface GenericMedia {
	mediaURL: string,
	mediaContentType: string
}

type FundraiserMilestone = Omit<FundraiserMilestones, "milestoneMediaObjectKeys"> & {
	milestoneMedia: GenericMedia[]
}

interface GetFundraiserResponse extends APIResponse {
	fundraiserData: Omit<
		FundRaisers,
		"fundraiserMediaObjectKeys"
	> & {
		fundraiserMedia: GenericMedia[],
		fundraiserMilestones: FundraiserMilestone[]
	}
}

interface GetFundraiserFeedResponse extends APIResponse {
	feedData: Omit<
		GetFundraiserResponse["fundraiserData"],
		"fundraiserMilestones"
	>[]
}

interface PresignedURLResponse extends APIResponse {
	presignedUrl: string
}

interface MediaCallbackResponse extends APIResponse {

}

interface CreateFundraiserMilestoneResponse extends APIResponse {
	milestoneId: number
}

export {
	SignupResponse,
	LoginResponse,
	LogoutResponse,
	AuthRefreshResponse,
	APIResponse,
	CreateFundraiserResponse,
	GetFundraiserResponse,
	GetFundraiserFeedResponse,
	PresignedURLResponse,
	GenericMedia,
	MediaCallbackResponse,
	CreateFundraiserMilestoneResponse,
	FundraiserMilestone
};
