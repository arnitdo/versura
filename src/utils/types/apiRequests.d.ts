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

interface AddFundraiserContentBody {
	objectKey: string
}

interface AddFundraiserContentParams {
	fundraiserId: string
}

interface DeleteFundraiserContentBody {
	objectKey: string
}

interface DeleteFundraiserContentParams {
	fundraiserId: string
}

interface AddFundraiserMilestoneBody {
	milestoneTitle: string,
	milestoneDescription: string,
	milestoneAmount: number,
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
	AddFundraiserContentBody,
	AddFundraiserContentParams,
	DeleteFundraiserContentBody,
	DeleteFundraiserContentParams
}