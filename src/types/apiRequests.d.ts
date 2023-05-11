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
	milestoneAmount: number,
}

interface AddFundraiserMilestoneParams {
	fundraiserId: string
}

interface AddMilestoneMediaContentBody {
	objectKey: string
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

interface FundraiserWithdrawalUpdateBody {
	withdrawalStatus: WithdrawalStatus
}

interface FundraiserWithdrawalUpdateParams {
	withdrawalId: string
}

interface AdminGetWithdrawalsParams {
	withdrawalPage?: string
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
	AddMilestoneMediaContentBody,
	FundraiserDonationBody,
	FundraiserDonationParams,
	FundraiserWithdrawalRequestParams,
	FundraiserWithdrawalRequestBody,
	FundraiserWithdrawalUpdateBody,
	FundraiserWithdrawalUpdateParams,
	AdminGetWithdrawalsParams
}