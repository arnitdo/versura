import {ValidatorMapType} from "@/utils/customMiddleware";

const LINK_TEXT_COLOR_OVERRIDE = "#DFE5EF" as const

export type ValidationResultMap<T> = {
	[propName in keyof T]: boolean
}

async function requireBasicObjectValidation<T>(objToValidate: T, validationMap: ValidatorMapType<T>): Promise<[boolean, ValidationResultMap<T>]>{
	const keysToValidate = Object.keys(validationMap) as (keyof T)[]
	const validationResultMap: ValidationResultMap<T> = {} as ValidationResultMap<T>
	const validationResultAcc = await Promise.all(
		keysToValidate.map(async (propKey) => {
			const validationFn = validationMap[propKey]
			const valueToValidate = objToValidate[propKey]
			const validationResult = await validationFn(valueToValidate)
			validationResultMap[propKey] = validationResult
			return validationResult
		})
	)
	
	const reducedValidationResult = validationResultAcc.reduce((prev, next) => {
		return prev && next
	}, true)
	
	return [
		reducedValidationResult,
		validationResultMap
	]
}

export {
	LINK_TEXT_COLOR_OVERRIDE,
	requireBasicObjectValidation
}