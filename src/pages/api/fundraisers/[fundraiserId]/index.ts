import {withMethodDispatcher} from "@/utils/methodDispatcher";
import {
	CustomApiRequest,
	CustomApiResponse,
	requireMethods,
	requireMiddlewareChecks,
	requireQueryParams, requireQueryParamValidators
} from "@/utils/customMiddleware";
import {db} from "@/utils/db";
import {GetFundraiserRequestParams} from "@/utils/types/apiRequests";
import {NON_ZERO_NON_NEGATIVE} from "@/utils/validatorUtils";
import {FundRaisers} from "@/utils/types/queryTypedefs";
import {GetFundraiserResponse} from "@/utils/types/apiResponses";

type FundraiserBodyDispatch = {
	GET: any
}

type FundraiserQueryDispatch = {
	GET: GetFundraiserRequestParams
}

async function getFundraiser(req: CustomApiRequest<any, GetFundraiserRequestParams>, res: CustomApiResponse): Promise<void> {
	const middlewareStatus = await requireMiddlewareChecks(
		req,
		res,
		{
			[requireMethods.name]: requireMethods("GET"),
			[requireQueryParams.name]: requireQueryParams(
				"fundraiserId"
			),
			[requireQueryParamValidators.name]: requireQueryParamValidators({
				fundraiserId: (fundraiserId) => {
					const parsedFundraiserId = Number.parseInt(fundraiserId)
					if (Number.isNaN(parsedFundraiserId)){
						return false
					}
					return NON_ZERO_NON_NEGATIVE(parsedFundraiserId);
				}
			})
		}
	)
	
	if (!middlewareStatus){
		return
	}
	
	const dbClient = await db.connect()
	try {
		const {fundraiserId} = req.query
		const dbResponse = await db.query<FundRaisers>(
			`SELECT * FROM "fundRaisers" WHERE "fundraiserId" = $1`,
			[fundraiserId]
		)
		const {rows: dbRows} = dbResponse
		if (dbRows.length === 0){
			res.status(404).json({
				requestStatus: "ERR_NOT_FOUND",
			})
			return
		}
		
		const selectedFundraiser = dbRows[0]
		
		dbClient.release()
		res.status(200).json<GetFundraiserResponse>({
			requestStatus: "SUCCESS",
			fundraiserData: selectedFundraiser
		})
	} catch (err: unknown){
		console.error(err)
		dbClient.release()
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	}
}

export default withMethodDispatcher<FundraiserBodyDispatch, FundraiserQueryDispatch>({
	GET: getFundraiser
})