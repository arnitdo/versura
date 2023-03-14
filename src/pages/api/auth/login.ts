import {compare} from "bcryptjs";
import {sign} from "jsonwebtoken"
import {
	requireValidBody,
	requireBodyParams,
	requireMiddlewareChecks,
	CustomApiResponse,
	requireMethod
} from "@/utils/customMiddleware"
import type {NextApiRequest} from "next";
import {db} from "@/utils/db";
import type {AuthUsers} from "@/utils/queryTypedefs";
import {LoginResponse} from "@/utils/apiTypedefs";

export default async function loginUser(req: NextApiRequest, res: CustomApiResponse){
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
		const {rows} = await dbClient.query<AuthUsers>(
			`SELECT "userPass", "userRole" FROM "authUsers" WHERE "walletId" = $1`,
			[walletAddress]
		)
		console.log(rows, walletAddress)
		if (rows.length === 0){
			res.status(400).json<LoginResponse>({
				requestStatus: "ERR_INVALID_PARAMS",
				invalidParams: ["walletAddress"]
			})
			return
		}
		
		const currentUserRow = rows[0]
		const {userPass: hashedPass, userRole} = currentUserRow
		
		const isPassMatch = await compare(userPass, hashedPass)
		if (isPassMatch){
			const authToken = sign(
				{
					walletAddress: walletAddress,
					userRole: userRole
				},
				process.env.JWT_SECRET!,
				{
					algorithm: "HS256"
				}
			)
			res.setHeader("Set-Cookie", `versura-auth-token=${authToken}; HttpOnly`)
			res.status(200).json<LoginResponse>({
				requestStatus: "SUCCESS",
				userRole: userRole
			})
			return
		} else {
			res.status(400).json<LoginResponse>({
				requestStatus: "ERR_INVALID_PARAMS",
				invalidParams: ["userPass"]
			})
			return
		}
	} catch (err: unknown){
		await dbClient.query("ROLLBACK")
		res.status(500).json({
			requestStatus: "ERR_INTERNAL_ERROR"
		})
	} finally {
		await dbClient.release()
	}
}