import {
	CustomApiRequest,
	CustomApiResponse, requireAuthenticatedUser, requireBodyParams,
	requireBodyValidators,
	requireMethods,
	requireMiddlewareChecks, requireQueryParams, requireQueryParamValidators, requireValidBody
} from "@/utils/customMiddleware";
import {
	AddFundraiserContentBody,
	AddFundraiserContentParams,
	DeleteFundraiserContentBody, DeleteFundraiserContentParams
} from "@/utils/types/apiRequests";
import {withMethodDispatcher} from "@/utils/methodDispatcher";
import { db } from "@/utils/db";

type FundraiserContentBodyMap = {
	POST: AddFundraiserContentBody,
	DELETE: DeleteFundraiserContentBody
}

type FundraiserContentQueryMap = {
	POST: AddFundraiserContentParams,
	DELETE: DeleteFundraiserContentParams
}

async function addFundraiserContent(req: CustomApiRequest<AddFundraiserContentBody, AddFundraiserContentParams>, res: CustomApiResponse){
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
				fundraiserId: async (fundraiserId) => {
					const {rows} = await dbClient.query(
						`SELECT 1 FROM "fundRaisers" WHERE "fundraiserId" = $1`,
						[fundraiserId]
					)
					if (rows.length == 1){
						return true
					}
					dbClient.release()
					return false
				}
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
					dbClient.release()
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

async function deleteFundraiserContent(req: CustomApiRequest<DeleteFundraiserContentBody, DeleteFundraiserContentParams>, res: CustomApiResponse){
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
				fundraiserId: async (fundraiserId) => {
					const {rows} = await dbClient.query(
						`SELECT 1 FROM "fundRaisers" WHERE "fundraiserId" = $1`,
						[fundraiserId]
					)
					if (rows.length == 1){
						return true
					}
					return false
				}
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

export default withMethodDispatcher<FundraiserContentBodyMap, FundraiserContentQueryMap>({
	POST: addFundraiserContent,
	DELETE: deleteFundraiserContent
})