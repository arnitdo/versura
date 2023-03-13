import {
	requireValidBody,
	requireBodyParams,
	requireMiddlewareChecks,
	CustomApiResponse,
	requireMethod
} from "@/utils/customMiddleware"
import type {NextApiRequest} from "next";
export default function loginUser(req: NextApiRequest, res: CustomApiResponse){
	requireMiddlewareChecks(
		req,
		res,
		[
			requireMethod("POST"),
			requireValidBody(),
			requireBodyParams("walletAddress", "userPass")
		]
	)
}