import {ValidatorMapType} from "@/utils/customMiddleware";

export type ValidationResultMap<T> = {
	[propName in keyof T]: boolean
}

async function requireBasicObjectValidation<T>(objToValidate: T, validationMap: ValidatorMapType<T>): Promise<[boolean, ValidationResultMap<T>]>{
	const keysToValidate = Object.keys(validationMap) as (keyof T)[]
	const validationResultMap: ValidationResultMap<T> = {} as ValidationResultMap<T>
	const validationResultAcc = keysToValidate.map((propKey) => {
		const validationFn = validationMap[propKey]
		const valueToValidate = objToValidate[propKey]
		const validationResult = validationFn(valueToValidate)
		validationResultMap[propKey] = validationResult
		return validationResult
	})
	
	const reducedValidationResult = validationResultAcc.reduce((prev, next) => {
		return prev && next
	}, true)
	
	return [
		reducedValidationResult,
		validationResultMap
	]
}

export {
	requireBasicObjectValidation
}