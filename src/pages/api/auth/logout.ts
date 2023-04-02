import {
	CustomApiRequest,
	CustomApiResponse,
	requireAuthenticatedUser, requireMethods,
	requireMiddlewareChecks
} from "@/utils/customMiddleware";
import {LogoutUserRequest} from "@/utils/types/apiRequests";

export default async function logoutUser(req: CustomApiRequest<LogoutUserRequest>, res: CustomApiResponse){
	const middlewarePassed = await requireMiddlewareChecks(
		req,
		res,
		{
			"requireMethod": requireMethods("POST"),
			"requireAuthenticatedUser": requireAuthenticatedUser(false)
			// No need to set req.user since we aren't using it
		}
	)
	
	if (!middlewarePassed){
		return
	}
	
	res.setHeader(
		"Set-Cookie",
		"versura-auth-token=; HttpOnly; Max-Age=-1"
	)
	
	res.status(200).json({
		requestStatus: "SUCCESS"
	})
}