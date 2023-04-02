import type {NextApiRequest, NextApiResponse} from "next";
import type {DecodedJWTCookie} from "@/utils/types/apiTypedefs";
import {verify} from "jsonwebtoken";
import {db} from "@/utils/db";
import {APIResponse, APIResponseCode} from "@/utils/types/apiResponses";
import {CreateFundraiserRequest} from "@/utils/types/apiRequests";

export interface CustomApiRequest<T = any> extends NextApiRequest {
	user?: DecodedJWTCookie,
	body: Required<T>
}

export interface CustomApiResponse extends NextApiResponse {
	status: (statusCode: number | APIResponseCode) => CustomApiResponse
	json: <T extends APIResponse>(body: T) => void
}

export type MiddlewareOptions = {
	middlewareCallStack: string[]
	nextMiddleware: NextMiddleware,
	// setRequestProperty: (propertyName: string, value: any) => void
}

export type MiddlewareFn<T = any> = (req: CustomApiRequest<T>, res: CustomApiResponse, opts: MiddlewareOptions) => Promise<void>

export type NextMiddleware = (currentMiddlewareStatus: boolean) => void

export type ValidRequestMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type MiddlewareCallArgs<T> = {[middlewareFnName: string]: MiddlewareFn<T>}

export type ValidatorMapType<T> = {
	[validateProperty in keyof T]: (propValue: T[validateProperty]) => boolean;
};

function requireMethods(...acceptedMethods: ValidRequestMethods[]): MiddlewareFn {
	return async function (req: CustomApiRequest, res: CustomApiResponse, middlewareOptions: MiddlewareOptions): Promise<void> {
		const reqMethod = req.method as ValidRequestMethods || "GET"
		const {middlewareCallStack, nextMiddleware} = middlewareOptions
		if (!acceptedMethods.includes(reqMethod)) {
			res.status(400).json({
				requestStatus: "ERR_INVALID_METHOD"
			})
			nextMiddleware(false)
			return
		}
		// We don't need context of previous middleware evaluated here
		
		nextMiddleware(true)
		
	}
}

function requireValidBody(): MiddlewareFn {
	return async function (req: CustomApiRequest, res: CustomApiResponse, middlewareOptions: MiddlewareOptions): Promise<void> {
		const {middlewareCallStack, nextMiddleware} = middlewareOptions
		
		const acceptedRequestMethods: ValidRequestMethods[] = ["POST", "PUT", "PATCH"]
		if (!acceptedRequestMethods.includes(req.method as ValidRequestMethods || "GET")){
			if (!middlewareCallStack.includes(requireMethods.name)) {
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


function requireBodyParams<T>(...bodyParams: string[]): MiddlewareFn<T> {
	return async function (req: CustomApiRequest<T>, res: CustomApiResponse, middlewareOptions: MiddlewareOptions): Promise<void> {
		const {middlewareCallStack, nextMiddleware} = middlewareOptions
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

function requireAuthenticatedUser(): MiddlewareFn {
	return async function (req: CustomApiRequest, res: CustomApiResponse, middlewareOptions: MiddlewareOptions): Promise<void> {
		const authCookie = req.cookies["versura-auth-token"];
		const {nextMiddleware} = middlewareOptions
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
			
			req.user = decodedCookie
			
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

function requireValidators<T>(validatorsToRun: ValidatorMapType<T>): MiddlewareFn<T> {
	return async function (req: CustomApiRequest<T>, res: CustomApiResponse, middlewareOptions: MiddlewareOptions){
		const {middlewareCallStack, nextMiddleware} = middlewareOptions
		if (!middlewareCallStack.includes("requireBodyParams")){
			throw new Error(
				"requireValidators was called without verifying all properties in body (requireBodyParams)"
			)
		}
		const validParams: string[] = []
		const invalidParams: string[] = []
		// Only run validators on passed values
		for (const paramKey in validatorsToRun) {
			const paramValue = req.body[paramKey]
			const validatorToRun = validatorsToRun[paramKey]
			const validatorResult = validatorToRun(paramValue)
			if (validatorResult == true){
				validParams.push(paramKey)
			} else {
				invalidParams.push(paramKey)
			}
		}
		if (invalidParams.length > 0){
			res.status(400).json({
				requestStatus: "ERR_INVALID_PARAMS",
				invalidParams: invalidParams
			})
			nextMiddleware(false)
			return
		}
		nextMiddleware(true)
		return
	}
}

async function requireMiddlewareChecks<T>(req: CustomApiRequest<T>, res: CustomApiResponse, middlewaresToCall: MiddlewareCallArgs<T>): Promise<boolean> {
	const middlewareStack: string[] = []
	let middlewareExecutionStatus: boolean = true
	// true & successfulMiddleware => true
	// true & failedMiddleware => false
	// false & true | false & false => false
	
	for (const middlewareName in middlewaresToCall) {
		if (!middlewareExecutionStatus){
			break
		}
		const middlewareFnToExecute = middlewaresToCall[middlewareName]
		const nextFn: NextMiddleware = (middlewareStatus: boolean) => {
			middlewareExecutionStatus &&= middlewareStatus
		}
		
		// const setRequestProperty = (propertyName: string, value: any) => {
		// 	Object.defineProperty(req, propertyName, {value: value})
		// }
		
		const middlewareOptions: MiddlewareOptions = {
			middlewareCallStack: middlewareStack,
			nextMiddleware: nextFn,
			// setRequestProperty: setRequestProperty
		}
		
		try {
			await middlewareFnToExecute(
				req,
				res,
				middlewareOptions
			)
			middlewareStack.push(middlewareName)
		} catch (err: unknown){
			console.error(err)
			res.status(500).json({
				"requestStatus": "ERR_INTERNAL_ERROR"
			})
		}
	}
	
	return middlewareExecutionStatus
}

export {
	requireMethods,
	requireValidBody,
	requireBodyParams,
	requireAuthenticatedUser,
	requireValidators,
	
	requireMiddlewareChecks
}