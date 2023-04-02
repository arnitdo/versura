interface SignupUserRequest {
	walletAddress: string,
	userPass: string
}

interface LoginUserRequest {
	walletAddress: string,
	userPass: string
}

interface LogoutUserRequest {

}

interface CreateFundraiserRequest {
	fundraiserTitle: string,
	fundraiserDescription: string,
	fundraiserTarget: number,
	fundraiserToken?: string,
	fundraiserMinDonationAmount?: number
}

export {
	SignupUserRequest,
	LoginUserRequest,
	LogoutUserRequest,
	CreateFundraiserRequest
}