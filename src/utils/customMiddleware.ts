import type {NextApiRequest, NextApiResponse} from "next";
import type {APIResponse, DecodedJWTCookie} from "@/utils/apiTypedefs";

export interface CustomApiRequest extends NextApiRequest {
	user?: DecodedJWTCookie
}

export interface CustomApiResponse extends NextApiResponse {
	status: (statusCode: number) => CustomApiResponse
	json: <T extends APIResponse>(body: T) => void
}

export type MiddlewareChain = {
	middlewareCallStack: string[]
	nextMiddleware: NextMiddleware
}

export type MiddlewareFn = (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain) => void

export type NextMiddleware = (currentMiddlewareStatus: boolean) => void

export type ValidRequestMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

function requireMethod(requestMethod: ValidRequestMethods): MiddlewareFn {
	return function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): void {
		if (req.method !== requestMethod) {
			res.status(400).json({
				requestStatus: "ERR_INVALID_METHOD"
			})
			return
		}
		// We don't need context of previous middleware evaluated here
		const {middlewareCallStack, nextMiddleware} = next
		nextMiddleware(true)
		
	}
}

function requireValidBody(): MiddlewareFn {
	return function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): void {
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
			nextMiddleware(false)
			return
		}
		// Body will only exist on "POST", "PUT", "PATCH" methods
		
		nextMiddleware(true)
	}
}


function requireBodyParams(...bodyParams: string[]): MiddlewareFn {
	return function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): void {
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
			nextMiddleware(false)
			return
		}
		
		nextMiddleware(true)
	}
}

type MiddlewareCallArgs = {[middlewareFnName: string]: MiddlewareFn}

function requireMiddlewareChecks(req: CustomApiRequest, res: CustomApiResponse, middlewaresToCall: MiddlewareCallArgs): boolean {
	const middlewareStack: string[] = []
	let middlewaresExecutedSuccessfully: boolean = true
	
	// true & successfulMiddleware => true
	// true & failedMiddleware => false
	// false & true | false & false => false
	
	for (let middlewareKVPairIdx = 0; middlewareKVPairIdx < Object.keys(middlewaresToCall).length; middlewaresExecutedSuccessfully){
		const middlewareEntries = Object.entries(middlewaresToCall)
		const currentEntry = middlewareEntries[middlewareKVPairIdx]
		// @ts-ignore
		const [middlewareFnName, middlewareFnToCall] = currentEntry
		const nextFn: NextMiddleware = (middlewareStatus) => {
			middlewaresExecutedSuccessfully &&= middlewareStatus
			middlewareKVPairIdx += 1
		}
		
		try {
			middlewareFnToCall(req, res, {
				middlewareCallStack: middlewareStack,
				nextMiddleware: nextFn
			})
			middlewareStack.push(middlewareFnName)
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