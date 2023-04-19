import {
	CustomApiRequest,
	CustomApiResponse, requireAuthenticatedUser, requireBodyParams, requireBodyValidators,
	requireMethods,
	requireMiddlewareChecks, requireQueryParams, requireQueryParamValidators,
	requireValidBody
} from "@/utils/customMiddleware";
import {AddFundraiserMilestoneBody, AddFundraiserMilestoneParams} from "@/utils/types/apiRequests";
import {STRLEN_GT, VALID_FUNDRAISER_ID_CHECK} from "@/utils/validatorUtils";
import {db} from "@/utils/db";
import {FundraiserMilestones, FundRaisers} from "@/utils/types/queryTypedefs";
import {CreateFundraiserMilestoneResponse} from "@/utils/types/apiResponses";

export default async function createMilestone(req: CustomApiRequest<AddFundraiserMilestoneBody, AddFundraiserMilestoneParams>, res: CustomApiResponse){
	const dbClient = await db.connect()
	const middlewareChecks = await requireMiddlewareChecks(
		req,
		res,
		{
			[requireMethods.name]: requireMethods("POST"),
			[requireAuthenticatedUser.name]: requireAuthenticatedUser(),
			[requireValidBody.name]: requireValidBody(),
			[requireQueryParams.name]: requireQueryParams("fundraiserId"),
			[requireQueryParamValidators.name]: requireQueryParamValidators({
				fundraiserId: VALID_FUNDRAISER_ID_CHECK(dbClient)
			}),
			[requireBodyParams.name]: requireBodyParams(
				"milestoneTitle", "milestoneAmount"
			),
			[requireBodyValidators.name]: requireBodyValidators({
				milestoneTitle: STRLEN_GT(16),
				milestoneAmount: async (milestoneAmt: number) => {
					const fundraiserId = req.query.fundraiserId
					const {rows} = await dbClient.query<Pick<FundRaisers, "fundraiserTarget">>(
						`SELECT "fundraiserTarget" FROM "fundRaisers" WHERE "fundraiserId" = $1`,
						[fundraiserId]
					)
					const selectedFundraiser = rows[0]
					const {fundraiserTarget} = selectedFundraiser
					if (fundraiserTarget < milestoneAmt){
						return false
					}
					return true
				}
			})
		}
	)
	if (!middlewareChecks){
		dbClient.release()
		return
	}
	try {
		const {milestoneTitle, milestoneAmount} = req.body
		const {fundraiserId} = req.query
		const {rows: createdMilestoneRows} = await dbClient.query<Pick<FundraiserMilestones, "milestoneId">>(
			`INSERT INTO "fundraiserMilestones"
			VALUES (DEFAULT, $1, $2, $3, DEFAULT, DEFAULT, DEFAULT)
			RETURNING "milestoneId"`,
			[fundraiserId, milestoneTitle, milestoneAmount]
		)
		const createdMilestoneRow = createdMilestoneRows[0]
		const {milestoneId} = createdMilestoneRow
		res.status(200).json<CreateFundraiserMilestoneResponse>({
			requestStatus: "SUCCESS",
			milestoneId: milestoneId
		})
	} catch (err: unknown) {
		console.error(err)
		dbClient.release()
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	}
	
}