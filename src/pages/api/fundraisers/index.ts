import {
	requireMethods,
	requireAuthenticatedUser,
	requireMiddlewareChecks,
	requireBodyParams,
	requireValidBody,
	CustomApiRequest, CustomApiResponse, requireBodyValidators, requireQueryParams
} from "@/utils/customMiddleware"
import {db} from "@/utils/db";
import {CreateFundraiserRequestBody} from "@/utils/types/apiRequests";
import {FundRaisers} from "@/utils/types/queryTypedefs";
import {NON_ZERO_NON_NEGATIVE, ALLOW_UNDEFINED_WITH_FN, STRLEN_GT} from "@/utils/validatorUtils";
import {CreateFundraiserResponse} from "@/utils/types/apiResponses";

export default async function createFundraiser(req: CustomApiRequest<CreateFundraiserRequestBody>, res: CustomApiResponse){
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
                (DEFAULT, $1, $2, $3, $4, $5, $6, 0, 0) RETURNING "fundraiserId"`,
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