import {
	CustomApiRequest,
	CustomApiResponse,
	requireAuthenticatedUser,
	requireMethods,
	requireMiddlewareChecks
} from "@/utils/customMiddleware";
import {LogoutUserRequestBody} from "@/utils/types/apiRequests";

export default async function logoutUser(req: CustomApiRequest<LogoutUserRequestBody>, res: CustomApiResponse){
	const middlewarePassed = await requireMiddlewareChecks(
		req,
		res,
		{
			[requireMethods.name]: requireMethods("POST"),
			[requireAuthenticatedUser.name]: requireAuthenticatedUser()
			// No need to set req.user since we aren't using it
		}
	)
	
	if (!middlewarePassed){
		return
	}
	
	res.setHeader(
		"Set-Cookie",
		`versura-auth-token=""; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
	)
	
	res.status(200).json({
		requestStatus: "SUCCESS"
	})
}