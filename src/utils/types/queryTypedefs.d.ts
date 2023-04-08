import {MediaCallbackBody} from "@/utils/types/apiRequests";

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
	fundraiserMinDonationAmount: number,
	fundraiserRaisedAmount: number,
	fundraiserContributorCount: number,
	fundraiserMilestoneCount: number,
	fundraiserMediaObjectKeys: string[]
	fundraiserCreatedOn: Date
}

export type S3BucketObjects = {
	bucketName: string,
	objectKey: string,
	objectSizeBytes: number,
	objectContentType: string
}