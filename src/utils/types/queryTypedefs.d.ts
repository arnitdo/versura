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
	fundraiserCreatedOn: string
}