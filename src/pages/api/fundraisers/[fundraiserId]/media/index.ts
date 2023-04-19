import {
	CustomApiRequest,
	CustomApiResponse, requireAuthenticatedUser, requireBodyParams,
	requireBodyValidators,
	requireMethods,
	requireMiddlewareChecks, requireQueryParams, requireQueryParamValidators, requireValidBody
} from "@/utils/customMiddleware";
import {
	AddFundraiserMediaBody,
	AddFundraiserMediaParams,
	DeleteFundraiserMediaBody, DeleteFundraiserMediaParams
} from "@/utils/types/apiRequests";
import {withMethodDispatcher} from "@/utils/methodDispatcher";
import { db } from "@/utils/db";
import {VALID_FUNDRAISER_ID_CHECK} from "@/utils/validatorUtils";

type FundraiserMediaBodyMap = {
	POST: AddFundraiserMediaBody,
	DELETE: DeleteFundraiserMediaBody
}

type FundraiserMediaQueryMap = {
	POST: AddFundraiserMediaParams,
	DELETE: DeleteFundraiserMediaParams
}

async function addFundraiserMedia(req: CustomApiRequest<AddFundraiserMediaBody, AddFundraiserMediaParams>, res: CustomApiResponse){
	const dbClient = await db.connect()
	
	const middlewareStatus = await requireMiddlewareChecks(
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
			[requireBodyParams.name]: requireBodyParams("objectKey"),
			[requireBodyValidators.name]: requireBodyValidators({
				objectKey: async (objectKey) => {
					const {rows: objectRows} = await dbClient.query(
						`SELECT 1 FROM "internalS3BucketObjects" WHERE "objectKey" = $1`,
						[objectKey]
					)
					if (objectRows.length == 1){
						const {rows: fundraiserMediaRows} = await dbClient.query(
							`SELECT 1 FROM "fundRaisers" WHERE $1 = ANY("fundraiserMediaObjectKeys")`,
							[objectKey]
						)
						if (fundraiserMediaRows.length > 0){
							// Don't allow duplication
							return false
						}
						return true
					}
					return false
				}
			})
		}
	)
	
	if (!middlewareStatus) return
	
	const {objectKey} = req.body
	const {fundraiserId} = req.query
	
	await dbClient.query(
		`UPDATE "fundRaisers" SET
		"fundraiserMediaObjectKeys" = ARRAY_APPEND("fundraiserMediaObjectKeys", $1)
		WHERE "fundraiserId" = $2`,
		[objectKey, fundraiserId]
	)
	
	dbClient.release()
	res.status(200).json({
		requestStatus: "SUCCESS"
	})
}

async function deleteFundraiserMedia(req: CustomApiRequest<DeleteFundraiserMediaBody, DeleteFundraiserMediaParams>, res: CustomApiResponse){
	const dbClient = await db.connect()
	
	const middlewareStatus = await requireMiddlewareChecks(
		req,
		res,
		{
			[requireMethods.name]: requireMethods("DELETE"),
			[requireAuthenticatedUser.name]: requireAuthenticatedUser(),
			[requireValidBody.name]: requireValidBody(),
			[requireQueryParams.name]: requireQueryParams("fundraiserId"),
			[requireQueryParamValidators.name]: requireQueryParamValidators({
				fundraiserId: VALID_FUNDRAISER_ID_CHECK(dbClient)
			}),
			[requireBodyParams.name]: requireBodyParams("objectKey"),
			[requireBodyValidators.name]: requireBodyValidators({
				objectKey: async (objectKey) => {
					const {rows} = await dbClient.query(
						`SELECT 1 FROM "internalS3BucketObjects" WHERE "objectKey" = $1`,
						[objectKey]
					)
					if (rows.length == 1){
						const {rows: fundraiserMediaRows} = await dbClient.query(
							`SELECT 1 FROM "fundRaisers" WHERE $1 = ANY("fundraiserMediaObjectKeys")`,
							[objectKey]
						)
						if (fundraiserMediaRows.length > 0){
							// Only allow deletion on existing object keys
							return true
						}
						return false
					}
					return false
				}
			})
		}
	)
	
	if (!middlewareStatus) {
		dbClient.release()
		return
	}
	
	const {objectKey} = req.body
	const {fundraiserId} = req.query
	
	await dbClient.query(
		`UPDATE "fundRaisers" SET
		"fundraiserMediaObjectKeys" = ARRAY_REMOVE("fundraiserMediaObjectKeys", $1)
		WHERE "fundraiserId" = $2`,
		[objectKey, fundraiserId]
	)
	
	dbClient.release()
	res.status(200).json({
		requestStatus: "SUCCESS"
	})
}

export default withMethodDispatcher<FundraiserMediaBodyMap, FundraiserMediaQueryMap>({
	POST: addFundraiserMedia,
	DELETE: deleteFundraiserMedia
})