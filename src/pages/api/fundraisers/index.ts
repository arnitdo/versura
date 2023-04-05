import {
	requireMethods,
	requireAuthenticatedUser,
	requireMiddlewareChecks,
	requireBodyParams,
	requireValidBody,
	CustomApiRequest, CustomApiResponse, requireBodyValidators, requireQueryParams, requireQueryParamValidators
} from "@/utils/customMiddleware"
import {db} from "@/utils/db";
import {CreateFundraiserRequestBody, GetFundraiserFeedRequestParams} from "@/utils/types/apiRequests";
import {FundRaisers} from "@/utils/types/queryTypedefs";
import {NON_ZERO_NON_NEGATIVE, ALLOW_UNDEFINED_WITH_FN, STRLEN_GT} from "@/utils/validatorUtils";
import {CreateFundraiserResponse, GetFundraiserFeedResponse} from "@/utils/types/apiResponses";
import {withMethodDispatcher} from "@/utils/methodDispatcher"

type FundraiserRequestBodyMap = {
	GET: any,
	POST: CreateFundraiserRequestBody
}

type FundraiserRequestParamsMap = {
	GET: GetFundraiserFeedRequestParams,
	POST: any
}

async function createFundraiser(req: CustomApiRequest<CreateFundraiserRequestBody>, res: CustomApiResponse){
	const dbClient = await db.connect();
	try {
		const middlewareCheckPassed = await requireMiddlewareChecks(
			req,
			res,
			{
				[requireMethods.name]: requireMethods("POST"),
				[requireValidBody.name]: requireValidBody(),
				[requireAuthenticatedUser.name]: requireAuthenticatedUser(),
				[requireBodyParams.name]: requireBodyParams(
					"fundraiserTitle", "fundraiserDescription", "fundraiserTarget"
				),
				[requireQueryParams.name]: requireQueryParams(
					"fundraiserId"
				),
				[requireBodyValidators.name]: requireBodyValidators({
					fundraiserTarget: NON_ZERO_NON_NEGATIVE,
					fundraiserTitle: STRLEN_GT(16),
					fundraiserDescription: STRLEN_GT(200),
					fundraiserMinDonationAmount: ALLOW_UNDEFINED_WITH_FN(NON_ZERO_NON_NEGATIVE),
					fundraiserToken: ALLOW_UNDEFINED_WITH_FN((fundraiserToken: string) => {
						return fundraiserToken === "ETH"
					})
				}),
			}
		)
		
		if (!middlewareCheckPassed){
			return
		}
		
		let {
			fundraiserTitle,
			fundraiserDescription,
			fundraiserTarget,
			fundraiserToken,
			fundraiserMinDonationAmount
		} = req.body;
		
		fundraiserToken = fundraiserToken || "ETH"
		fundraiserMinDonationAmount = fundraiserMinDonationAmount || 1e-10
		
		const {walletAddress} = req.user!
		
		const dbCreateResponse = await dbClient.query<Pick<FundRaisers, "fundraiserId">>(
			`INSERT INTO "fundRaisers" VALUES
                (DEFAULT, $1, $2, $3, $4, $5, $6, 0, 0, NOW()) RETURNING "fundraiserId"`,
			[walletAddress, fundraiserTitle, fundraiserDescription, fundraiserTarget, fundraiserToken, fundraiserMinDonationAmount]
		)
		
		const {rows} = dbCreateResponse
		const returnedFundRaiserRow = rows[0]
		const {fundraiserId} = returnedFundRaiserRow
		
		res.status(200).json<CreateFundraiserResponse>({
			requestStatus: "SUCCESS",
			fundraiserId: fundraiserId
		})
		
	} catch (err: unknown){
		console.error(err)
		dbClient.release()
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	}
}

async function getFundraiserFeed(req: CustomApiRequest<any, GetFundraiserFeedRequestParams>, res: CustomApiResponse){
	const dbClient = await db.connect()
	try {
		const middlewareExecStatus = await requireMiddlewareChecks(
			req,
			res,
			{
				[requireMethods.name]: requireMethods("GET"),
				[requireQueryParamValidators.name]: requireQueryParamValidators({
					feedPage: ALLOW_UNDEFINED_WITH_FN(NON_ZERO_NON_NEGATIVE)
				}, true)
			}
		)
		
		if (!middlewareExecStatus){
			return
		}
		
		let {feedPage} = req.query
		feedPage = feedPage || 1
		
		const FEED_PAGE_SIZE = 10 as const
		
		const feedPageOffset = (feedPage - 1) * 10
		
		const {rows: feedRows} = await dbClient.query<FundRaisers>(
			`SELECT * FROM "fundRaisers"
        ORDER BY "fundraiserCreatedOn" DESC OFFSET $1 LIMIT $2`,
			[feedPageOffset, FEED_PAGE_SIZE]
		)
		
		dbClient.release()
		res.status(200).json<GetFundraiserFeedResponse>({
			requestStatus: "SUCCESS",
			feedData: feedRows
		})
		
	} catch (err: unknown){
		console.error(err)
		dbClient.release()
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	}
}

export default withMethodDispatcher<FundraiserRequestBodyMap, FundraiserRequestParamsMap>({
	POST: createFundraiser,
	GET: getFundraiserFeed
})