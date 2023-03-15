import type {NextApiRequest, NextApiResponse} from "next";
import type {APIResponse, APIResponseCode, DecodedJWTCookie} from "@/utils/apiTypedefs";
import {verify} from "jsonwebtoken";
import {db} from "@/utils/db";

export interface CustomApiRequest extends NextApiRequest {
	user?: DecodedJWTCookie
}

export interface CustomApiResponse extends NextApiResponse {
	status: (statusCode: number | APIResponseCode) => CustomApiResponse
	json: <T extends APIResponse>(body: T) => void
}

export type MiddlewareChain = {
	middlewareCallStack: string[]
	nextMiddleware: NextMiddleware
}

export type MiddlewareFn = (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain) => Promise<void>

export type NextMiddleware = (currentMiddlewareStatus: boolean) => void

export type ValidRequestMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type MiddlewareCallArgs = {[middlewareFnName: string]: MiddlewareFn}

function requireMethod(requestMethod: ValidRequestMethods): MiddlewareFn {
	return async function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): Promise<void> {
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
	return async function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): Promise<void> {
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
	return async function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): Promise<void> {
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

function requireAuthenticatedUser(setReqProperty: boolean = true): MiddlewareFn {
	return async function (req: CustomApiRequest, res: CustomApiResponse, next: MiddlewareChain): Promise<void> {
		const authCookie = req.cookies["versura-auth-token"];
		const {nextMiddleware} = next
		if (authCookie == null || authCookie == '') {
			res.status(403).json({
				requestStatus: "ERR_AUTH_REQUIRED"
			})
			nextMiddleware(false)
			return
		}
		
		const dbClient = await db.connect()
		
		try {
			const decodedCookie: DecodedJWTCookie = verify(
				authCookie,
				process.env.JWT_SECRET!
			) as DecodedJWTCookie
			const {walletAddress, userRole} = decodedCookie
			
			const {rows: currentUserRows} = await dbClient.query(
				`SELECT 1
                 FROM "authUsers"
                 WHERE "walletAddress" = $1
                   AND "userRole" = $2`,
				[walletAddress, userRole]
			)
			
			if (currentUserRows.length == 0) {
				// Silently fail
				// Having a signed token, but with invalid user means that the JWT_SECRET is compromised
				// We should never reach this point
				res.status(403).json({
					requestStatus: "ERR_AUTH_REQUIRED"
				})
				nextMiddleware(false)
				dbClient.release()
				return
			}
			
			// Having 1 row means that the current user exists in our database
			// We can go ahead and assume that the user is authenticated
			
			if (setReqProperty){
				req.user = decodedCookie
			}
			
			nextMiddleware(true)
			dbClient.release()
			
		} catch (err: unknown) {
			// Corrupted or invalid token
			res.status(403).json({
				requestStatus: "ERR_AUTH_REQUIRED"
			})
			nextMiddleware(false)
			dbClient.release()
			return
		}
	}
}

async function requireMiddlewareChecks(req: CustomApiRequest, res: CustomApiResponse, middlewaresToCall: MiddlewareCallArgs): Promise<boolean> {
	const middlewareStack: string[] = []
	let middlewaresExecutedSuccessfully: boolean = true
	let lastMiddlewareIdx = -1
	// true & successfulMiddleware => true
	// true & failedMiddleware => false
	// false & true | false & false => false
	
	for (let middlewareKVPairIdx = 0; middlewareKVPairIdx < Object.keys(middlewaresToCall).length; middlewaresExecutedSuccessfully && middlewareKVPairIdx > lastMiddlewareIdx){
		const middlewareEntries = Object.entries(middlewaresToCall)
		const currentEntry = middlewareEntries[middlewareKVPairIdx]
		// @ts-ignore
		const [middlewareFnName, middlewareFnToCall] = currentEntry
		const nextFn: NextMiddleware = (middlewareStatus) => {
			middlewaresExecutedSuccessfully &&= middlewareStatus
			middlewareKVPairIdx += 1
			lastMiddlewareIdx += 1
		}
		
		try {
			await middlewareFnToCall(req, res, {
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
	requireAuthenticatedUser,
	
	requireMiddlewareChecks
}