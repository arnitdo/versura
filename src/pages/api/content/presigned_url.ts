import {
	CustomApiRequest,
	CustomApiResponse, requireBodyParams, requireBodyValidators,
	requireMethods,
	requireMiddlewareChecks,
	requireValidBody
} from "@/utils/customMiddleware";
import {db} from "@/utils/db";
import {getPresignedURL} from "@/utils/s3";
import {ContentManagementEndpointBody} from "@/utils/types/apiRequests";
import {PASSTHROUGH} from "@/utils/validatorUtils";
import {ContentManagementPresignedUrlResponse} from "@/utils/types/apiResponses";

export default async function contentManagementEndpoint(req: CustomApiRequest<ContentManagementEndpointBody>, res: CustomApiResponse){
	const middlewareExecStatus = await requireMiddlewareChecks(
		req,
		res,
		{
			[requireMethods.name]: requireMethods("POST"),
			[requireValidBody.name]: requireValidBody(),
			[requireBodyParams.name]: requireBodyParams("requestMethod", "objectKey"),
			[requireBodyValidators.name]: requireBodyValidators({
				requestMethod: (reqMethod) => {
					return ["GET", "PUT", "DELETE"].includes(reqMethod)
				},
				objectKey: PASSTHROUGH
			})
		}
	)
	
	if (!middlewareExecStatus){
		return
	}
	
	const dbClient = await db.connect()
	try {
		const {requestMethod, objectKey} = req.body
		
		const presignedUrl = await getPresignedURL({
			requestMethod,
			objectKey
		})
		
		dbClient.release()
		res.status(200).json<ContentManagementPresignedUrlResponse>({
			requestStatus: "SUCCESS",
			presignedUrl: presignedUrl
		})
	} catch (err: unknown){
		console.error(err)
		dbClient.release()
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	}
}