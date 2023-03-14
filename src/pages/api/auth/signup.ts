import {hash} from "bcryptjs";
import {
	requireValidBody,
	requireBodyParams,
	requireMiddlewareChecks,
	CustomApiResponse,
	requireMethod
} from "@/utils/customMiddleware"
import type {NextApiRequest} from "next";
import {db} from "@/utils/db";
export default async function signupUser(req: NextApiRequest, res: CustomApiResponse){
	const middlewarePassed = requireMiddlewareChecks(
		req,
		res,
		{
			"requireMethod": requireMethod("POST"),
			"requireValidBody": requireValidBody(),
			"requireBodyParams": requireBodyParams("walletAddress", "userPass")
		}
	)
	if (!middlewarePassed){
		return
	}
	
	const {walletAddress, userPass} = req.body
	const dbClient = await db.connect();
	try {
		const hashedPassword = await hash(userPass, 10)
		await dbClient.query("BEGIN")
		await dbClient.query(
			`INSERT INTO "authUsers" VALUES ($1, $2)`,
			[walletAddress, hashedPassword]
		)
		await dbClient.query("COMMIT")
		res.status(200).json({
			requestStatus: "SUCCESS"
		})
	} catch (err: unknown){
		await dbClient.query("ROLLBACK")
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	} finally {
		await dbClient.release()
	}
}