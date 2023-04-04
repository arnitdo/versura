import {ValidRequestMethods} from "@/utils/customMiddleware";
import {APIResponse, APIResponseCode} from "@/utils/types/apiResponses";
import {GetServerSidePropsContext} from "next";

export type APIRequestParams = {
	endpointPath: string,
	requestMethod: ValidRequestMethods,
	queryParams?: any,
	bodyParams?: any,
	ssrContext?: GetServerSidePropsContext
}

export type APIRequestResponse<T> = {
	isSuccess: boolean,
	isError: boolean,
	
	code: APIResponseCode,
	data?: T,
	error?: unknown
}

async function makeAPIRequest<T extends APIResponse>(reqParams: APIRequestParams): Promise<APIRequestResponse<T>> {
	const {requestMethod, endpointPath, queryParams, bodyParams, ssrContext} = reqParams
	let requestOptions: RequestInit = {
		method: requestMethod,
		headers: {
			"Content-Type": "application/json"
		}
	}
	
	const bodyMethods: ValidRequestMethods[] = ["POST", "PUT", "PATCH"]
	
	try {
		let resolvedQueryString = ``;
		if (bodyMethods.includes(requestMethod)){
			requestOptions.body = JSON.stringify(bodyParams)
		}
		if (queryParams) {
			const queryParamsObj = new URLSearchParams()
			for (const queryParamKey of queryParams) {
				const queryParamValue = queryParams[queryParamKey]
				queryParamsObj.set(queryParamKey, queryParamValue)
			}
			resolvedQueryString = `?${queryParamsObj.toString()}`
		}
		
		
		let resolvedUrl: string = `${endpointPath}${resolvedQueryString}`
		
		if (ssrContext){
			const {
				req: {
					headers: {
						host: hostName
					}
				}
			} = ssrContext
			resolvedUrl = `${hostName}${resolvedUrl}`
		}
		
		if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined){
			resolvedUrl = `http://${resolvedUrl}`
		} else if (resolvedUrl === "production"){
			resolvedUrl = `https://${resolvedUrl}`
		} else {
			throw new Error(
				"Could not distinguish process environment"
			)
		}
		
		const reqResponse = await fetch(
			resolvedUrl,
			requestOptions
		)
		const responseCode = reqResponse.status
		const responseJSON = await reqResponse.json() as T
		
		return {
			isSuccess: true,
			isError: false,
			code: responseCode as APIResponseCode,
			data: responseJSON,
			error: undefined
		}
	} catch (err: unknown){
		return {
			isSuccess: false,
			isError: true,
			code: 0,
			data: undefined,
			error: err
		}
	}
}

export {
	makeAPIRequest
}