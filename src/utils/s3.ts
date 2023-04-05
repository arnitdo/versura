import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand
} from "@aws-sdk/client-s3"
import {
	getSignedUrl
} from "@aws-sdk/s3-request-presigner"
import {db} from "@/utils/db";

const s3Client = new S3Client({
	region: "ap-south-1",
	credentials: {
		accessKeyId: process.env.AWS_S3_KEY_ID!,
		secretAccessKey: process.env.AWS_S3_KEY_SECRET!
	}
})

type PresignedURLOpts = {
	requestMethod: "PUT" | "GET"
	objectKey: string
}

type RequestCommandMap = {
	[reqMethod in PresignedURLOpts["requestMethod"]]: typeof GetObjectCommand | typeof PutObjectCommand
}

const requestCommandMap: RequestCommandMap = {
	GET: GetObjectCommand,
	PUT: PutObjectCommand
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