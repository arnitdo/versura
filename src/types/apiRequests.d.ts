import {S3ObjectMethods, WithdrawalStatus} from "@/types/apiTypedefs";

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
	feedPage?: string
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
	milestoneAmount: number
}

interface AddFundraiserMilestoneParams {
	fundraiserId: string
}

interface AddFundraiserUpdateParams {
	fundraiserId: string
}

interface AddFundraiserUpdateBody {
	updateTitle: string,
	updateDescription: string,
}

interface FundraiserDonationBody {
	donatedAmount: number,
	transactionHash: string,
}

interface FundraiserDonationParams {
	fundraiserId: string
}

interface FundraiserWithdrawalRequestBody {
	withdrawalAmount: number
}

interface FundraiserWithdrawalRequestParams {
	fundraiserId: string
}

interface AdminUpdateWithdrawalBody {
	withdrawalStatus: WithdrawalStatus
}

interface AdminUpdateWithdrawalParams {
	withdrawalId: string
}

interface AdminGetWithdrawalsParams {
	withdrawalPage?: string
}

interface AdminGetFundraisersParams {
	fundraiserPage?: string
}

interface AdminUpdateFundraiserParams {
	fundraiserId: string
}

interface AdminUpdateFundraiserBody {
	fundraiserStatus: "OPEN" | "CLOSED"
}

export {
	WithdrawalStatus,
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
	AddFundraiserUpdateBody,
	AddFundraiserUpdateParams,
	AddMilestoneMediaContentBody,
	FundraiserDonationBody,
	FundraiserDonationParams,
	FundraiserWithdrawalRequestParams,
	FundraiserWithdrawalRequestBody,
	AdminUpdateWithdrawalBody,
	AdminUpdateWithdrawalParams,
	AdminGetWithdrawalsParams,
	AdminGetFundraisersParams,
	AdminUpdateFundraiserParams,
	AdminUpdateFundraiserBody
}