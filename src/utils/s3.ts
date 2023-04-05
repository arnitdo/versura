import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand, DeleteObjectCommand
} from "@aws-sdk/client-s3"
import {
	getSignedUrl
} from "@aws-sdk/s3-request-presigner"
import {db} from "@/utils/db";
import {S3ObjectMethods} from "@/utils/types/apiTypedefs";

const s3Client = new S3Client({
	region: "ap-south-1",
	credentials: {
		accessKeyId: process.env.AWS_S3_KEY_ID!,
		secretAccessKey: process.env.AWS_S3_KEY_SECRET!
	}
})

type PresignedURLOpts = {
	requestMethod: S3ObjectMethods
	objectKey: string
}

type RequestCommandMap = {
	[reqMethod in S3ObjectMethods]:
		typeof GetObjectCommand |
		typeof PutObjectCommand |
		typeof DeleteObjectCommand
}

const requestCommandMap: RequestCommandMap = {
	GET: GetObjectCommand,
	PUT: PutObjectCommand,
	DELETE: DeleteObjectCommand
}

async function getPresignedURL({requestMethod, objectKey}: PresignedURLOpts): Promise<string> {
	const assocMethodCommand = requestCommandMap[requestMethod]
	
	const objCommand = new assocMethodCommand({
		Bucket: process.env.AWS_S3_BUCKET!,
		Key: objectKey
	})
	
	const presignedUrl = await getSignedUrl(
		s3Client,
		objCommand,
		{
			expiresIn: 600 // 10min
		}
	)
	
	return presignedUrl
}

export {
	getPresignedURL
}