import type {NextApiRequest, NextApiResponse} from "next";
import type {APIResponse} from "@/utils/apiTypedefs";

export interface CustomApiResponse extends NextApiResponse {
	status: (statusCode: number) => CustomApiResponse
	json: <T extends APIResponse>(body: T) => void
}

export type MiddlewareChain = {
	middlewareCallStack: string[]
	nextMiddleware?: () => void
}

export type MiddlewareFn = (req: NextApiRequest, res: CustomApiResponse, next: MiddlewareChain) => void

export type ValidRequestMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

function requireMethod(requestMethod: ValidRequestMethods): MiddlewareFn {
	return function (req: NextApiRequest, res: CustomApiResponse, next: MiddlewareChain): void {
		if (req.method !== requestMethod) {
			res.status(400).json({
				requestStatus: "ERR_INVALID_METHOD"
			})
			return
		}
		// We don't need context of previous middleware evaluated here
		const {middlewareCallStack, nextMiddleware} = next
		if (nextMiddleware) {
			nextMiddleware()
		}
	}
}

function requireValidBody(): MiddlewareFn {
	return function (req: NextApiRequest, res: CustomApiResponse, next: MiddlewareChain): void {
		const {middlewareCallStack, nextMiddleware} = next
		
		const acceptedRequestMethods: ValidRequestMethods[] = ["POST", "PUT", "PATCH"]
		if (!acceptedRequestMethods.includes(req.method as ValidRequestMethods || "GET")){
			if (!middlewareCallStack.includes(requireMethod.name)) {
				throw new Error(`Incorrect body check called for method ${req.method}. Are you calling requireMethod?`)
			} else {
				throw new Error(`requireMethod was called with mismatching methods and body`)
			}
		}
		
		if (req.body === null) {
			res.status(400).json({
				requestStatus: "ERR_BODY_REQUIRED"
			})
			return
		}
		// Body will only exist on "POST", "PUT", "PATCH" methods
		
		if (nextMiddleware) {
			nextMiddleware()
		}
	}
}


function requireBodyParams(...bodyParams: string[]): MiddlewareFn {
	return function (req: NextApiRequest, res: CustomApiResponse, next: MiddlewareChain): void {
		const {middlewareCallStack, nextMiddleware} = next
		if (!middlewareCallStack.includes(requireValidBody.name)) {
			throw new Error(
				"requireBodyParams was called without verifying a valid body"
			)
		}
		const requestBodyKeys = Object.keys(req.body)
		const missingBodyParams: string[] = bodyParams.filter((bodyParam) => {
			if (requestBodyKeys.includes(bodyParam)){
				return false
			}
			return true
		})
		
		if (missingBodyParams.length > 0){
			res.status(400).json({
				requestStatus: "ERR_MISSING_BODY_PARAMS",
				missingParams: missingBodyParams
			})
			return
		}
		
		if (nextMiddleware) {
			nextMiddleware()
		}
	}
}

function requireMiddlewareChecks(req: NextApiRequest, res: CustomApiResponse, middlewaresToCall: MiddlewareFn[]): boolean {
	const middlewareStack: string[] = []
	let middlewaresExecutedSuccessfully: boolean = true
	
	// true & successfulMiddleware => true
	// true & failedMiddleware => false
	// false & true | false & false => false
	
	for (let middlewareIdx = 0; middlewareIdx < middlewaresToCall.length; middlewareIdx){
		const middlewareFnToCall = middlewaresToCall[middlewareIdx]
		const nextFn = () => {
			middlewareIdx += 1
		}
		
		try {
			console.debug(`Calling ${middlewareFnToCall.name} with middlewareStack: ${middlewareStack}`)
			middlewareFnToCall(req, res, {
				middlewareCallStack: middlewareStack,
				nextMiddleware: nextFn
			})
			middlewareStack.push(middlewareFnToCall.name)
		} catch (err: unknown){
			res.status(500).json({
				requestStatus: "ERR_INTERNAL_ERROR"
			})
			middlewaresExecutedSuccessfully &&= false
			break
		}
	}
	return middlewaresExecutedSuccessfully
}

export {
	requireMethod,
	requireValidBody,
	requireBodyParams,
	requireMiddlewareChecks
}