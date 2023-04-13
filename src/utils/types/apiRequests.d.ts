import {S3ObjectMethods} from "@/utils/types/apiTypedefs";

interface SignupUserRequestBody {
	walletAddress: string,
	userPass: string
}

interface LoginUserRequestBody {
	walletAddress: string,
	userPass: string
}

interface LogoutUserRequestBody {

}

interface CreateFundraiserRequestBody {
	fundraiserTitle: string,
	fundraiserDescription: string,
	fundraiserTarget: number,
	fundraiserToken?: string,
	fundraiserMinDonationAmount?: number
}

interface GetFundraiserRequestParams {
	fundraiserId: string
}

interface GetFundraiserFeedRequestParams {
	feedPage?: number
}

interface PresignedURLBody {
	requestMethod: S3ObjectMethods,
	objectKey: string
}

interface MediaCallbackBody {
	requestMethod: S3ObjectMethods,
	objectKey: string,
	objectSizeBytes: number,
	objectContentType: string
}

interface AddFundraiserMediaBody {
	objectKey: string
}

interface AddFundraiserMediaParams {
	fundraiserId: string
}

interface DeleteFundraiserMediaBody {
	objectKey: string
}

interface DeleteFundraiserMediaParams {
	fundraiserId: string
}

interface AddFundraiserMilestoneBody {
	milestoneTitle: string,
	milestoneAmount: number,
}

interface AddFundraiserMilestoneParams {
	fundraiserId: string
}

interface AddMilestoneMediaContent {
	objectKey: string
}

export {
	S3ObjectMethods,
	SignupUserRequestBody,
	LoginUserRequestBody,
	LogoutUserRequestBody,
	CreateFundraiserRequestBody,
	GetFundraiserRequestParams,
	GetFundraiserFeedRequestParams,
	PresignedURLBody,
	MediaCallbackBody,
	AddFundraiserMediaBody,
	AddFundraiserMediaParams,
	DeleteFundraiserMediaBody,
	DeleteFundraiserMediaParams,
	AddFundraiserMilestoneBody,
	AddFundraiserMilestoneParams,
	AddMilestoneMediaContent,
}