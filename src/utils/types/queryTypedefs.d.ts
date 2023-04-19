import {WithdrawalStatus} from "@/utils/types/apiTypedefs";

export type UserRole = "CLIENT" | "ADMIN"

export type AuthUsers = {
	walletAddress: string,
	userPass: string,
	userRole: UserRole
}

export type FundRaisers = {
	fundraiserId: number,
	fundraiserCreator: string,
	fundraiserTitle: string,
	fundraiserDescription: string,
	fundraiserTarget: number,
	fundraiserToken: string,
	fundraiserMinDonationAmount: number,
	fundraiserRaisedAmount: number,
	fundraiserContributorCount: number,
	fundraiserMilestoneCount: number,
	fundraiserMediaObjectKeys: string[]
	fundraiserCreatedOn: string,
	fundraiserWithdrawnAmount: number
}

export type S3BucketObjects = {
	bucketName: string,
	objectKey: string,
	objectSizeBytes: number,
	objectContentType: string
}

export type FundraiserMilestones = {
	milestoneId: number,
	milestoneFundraiserId: number,
	milestoneTitle: string,
	milestoneAmount: number,
	milestoneStatus: boolean,
	milestoneMediaObjectKeys: string[],
	milestoneReachedOn: string,
}

export type FundraiserWithdrawalRequests = {
	requestId: number,
	walletAddress: string,
	targetFundraiser: number,
	withdrawalAmount: number,
	withdrawalToken: string,
	requestStatus: WithdrawalStatus,
}