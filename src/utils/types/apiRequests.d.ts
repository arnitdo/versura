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

interface ContentManagementEndpointBody {
	requestMethod: "PUT" | "GET",
	objectKey: string
}

export {
	SignupUserRequestBody,
	LoginUserRequestBody,
	LogoutUserRequestBody,
	CreateFundraiserRequestBody,
	GetFundraiserRequestParams,
	GetFundraiserFeedRequestParams,
	ContentManagementEndpointBody
}