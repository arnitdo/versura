import {
	CustomApiRequest,
	CustomApiResponse,
	optionalAuthenticatedUser,
	requireMethods,
	requireMiddlewareChecks,
	requireQueryParams,
	requireQueryParamValidators
} from "@/utils/customMiddleware";
import {db} from "@/utils/db";
import {GetFundraiserRequestParams} from "@/types/apiRequests";
import {VALID_FUNDRAISER_ID_CHECK} from "@/utils/validatorUtils";
import {FundraiserDonations, FundraiserMilestones, FundRaisers, S3BucketObjects} from "@/types/queryTypedefs";
import {FundraiserMilestone, GenericMedia, GetFundraiserResponse} from "@/types/apiResponses";
import {getObjectUrl} from "@/utils/s3";

/*type FundraiserBodyDispatch = {
	GET: any
}

type FundraiserQueryDispatch = {
	GET: GetFundraiserRequestParams
}*/

export default async function getFundraiser(req: CustomApiRequest<any, GetFundraiserRequestParams>, res: CustomApiResponse): Promise<void> {
	const dbClient = await db.connect()

	const middlewareStatus = await requireMiddlewareChecks(
		req,
		res,
		{
			[requireMethods.name]: requireMethods("GET"),
			[optionalAuthenticatedUser.name]: optionalAuthenticatedUser(),
			[requireQueryParams.name]: requireQueryParams(
				"fundraiserId"
			),
			[requireQueryParamValidators.name]: requireQueryParamValidators({
				fundraiserId: VALID_FUNDRAISER_ID_CHECK(dbClient)
			})
		}
	)

	if (!middlewareStatus) {
		dbClient.release()
		return
	}

	try {
		const {fundraiserId} = req.query

		const adminUserAccess = req.user?.userRole === "ADMIN"

		const {rows: dbRows} = await db.query<FundRaisers>(
			`SELECT *
             FROM "fundRaisers"
             WHERE "fundraiserId" = $1
               AND ("fundraiserStatus" = 'OPEN'
                 ${adminUserAccess ? `OR "fundraiserStatus" = 'IN_QUEUE')` : `)`}`,
			[fundraiserId]
		)
		if (dbRows.length === 0) {
			res.status(404).json({
				requestStatus: "ERR_NOT_FOUND",
			})
			return
		}

		const selectedFundraiser = dbRows[0]
		const {fundraiserMediaObjectKeys} = selectedFundraiser

		const {rows: objectContentTypeRows} = await dbClient.query<Pick<S3BucketObjects, "objectKey" | "objectContentType">>(
			`SELECT "objectKey", "objectContentType"
             FROM "internalS3BucketObjects"
             WHERE "objectKey" = ANY ($1)`,
			[fundraiserMediaObjectKeys]
		)

		const objectKeyContentMap: { [objKey: string]: string } = {}

		for (const objectContentTypeRow of objectContentTypeRows) {
			const {objectKey, objectContentType} = objectContentTypeRow
			objectKeyContentMap[objectKey] = objectContentType
		}

		const fundraiserMedia: GenericMedia[] = []

		for (const objectKey of fundraiserMediaObjectKeys) {
			const presignedURL = await getObjectUrl({
				requestMethod: "GET",
				objectKey: objectKey
			})
			const mappedContentType = objectKeyContentMap[objectKey]
			fundraiserMedia.push({
				mediaURL: presignedURL,
				mediaContentType: mappedContentType
			})
		}

		const {rows: dbMilestoneRows} = await dbClient.query<FundraiserMilestones>(
			`SELECT *
             FROM "fundraiserMilestones"
             WHERE "milestoneFundraiserId" = $1`,
			[fundraiserId]
		)

		const fundraiserResponseMilestones: FundraiserMilestone[] = await Promise.all(
			dbMilestoneRows.map(async (milestoneRow) => {
				const {milestoneMediaObjectKeys} = milestoneRow

				const {rows: mediaObjectContentTypeRows} = await dbClient.query<Pick<S3BucketObjects, "objectKey" | "objectContentType">>(
					`SELECT "objectKey", "objectContentType"
                     FROM "internalS3BucketObjects"
                     WHERE "objectKey" = ANY ($1)`,
					[milestoneMediaObjectKeys]
				)

				for (const mediaObjectContentTypeRow of mediaObjectContentTypeRows) {
					const {objectKey, objectContentType} = mediaObjectContentTypeRow
					objectKeyContentMap[objectKey] = objectContentType
				}

				const milestoneMedia: GenericMedia[] = await Promise.all(
					milestoneMediaObjectKeys.map(async (objectKey) => {
						const presignedUrl = await getObjectUrl({
							objectKey: objectKey,
							requestMethod: "GET"
						})

						const mappedContentType = objectKeyContentMap[objectKey]
						return {
							mediaURL: presignedUrl,
							mediaContentType: mappedContentType
						}
					})
				)

				const resolvedMilestoneData = {
					...milestoneRow,
					milestoneMedia: milestoneMedia
				}

				// @ts-ignore
				delete resolvedMilestoneData["milestoneMediaObjectKeys"]

				return resolvedMilestoneData
			})
		)

		const {rows: fundraiserDonationRows} = await dbClient.query<FundraiserDonations>(
			`SELECT "donorAddress", "donatedAmount", "donationTimestamp", "transactionHash"
             FROM "fundraiserDonations"
             WHERE "donatedFundraiser" = $1
             ORDER BY "donatedAmount" DESC`,
			[fundraiserId]
		)

		const fundraiserData = {
			...selectedFundraiser,
			fundraiserMedia: fundraiserMedia,
			fundraiserMilestones: fundraiserResponseMilestones,
			fundraiserDonations: fundraiserDonationRows
		}

		// @ts-ignore
		delete fundraiserData["fundraiserMediaObjectKeys"]

		dbClient.release()
		res.status(200).json<GetFundraiserResponse>({
			requestStatus: "SUCCESS",
			fundraiserData: fundraiserData
		})
	} catch (err: unknown) {
		console.error(err)
		dbClient.release()
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	}
}