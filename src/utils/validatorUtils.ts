function NON_ZERO(value: number){
	return value != 0
}

function NON_ZERO_NON_NEGATIVE(value: number){
	return value > 0
}

function NON_ZERO_NON_POSITIVE(value: number){
	return value < 0
}

function PASSTHROUGH<T>(value: T){
	return true
}

function STRLEN_GT(len: number){
	return (value: string) => {
		return value.length > len
	}
}

function STRLEN_GT_EQ(len: number){
	return (value: string) => {
		return value.length >= len
	}
}

function STRLEN_EQ(len: number){
	return (value: string) => {
		return value.length == len
	}
}

function STRLEN_LT_EQ(len: number){
	return (value: string) => {
		return value.length <= len
	}
}

function STRLEN_LT(len: number){
	return (value: string) => {
		return value.length < len
	}
}

function STRLEN_NZ(value: string){
	return value.length > 0
}

function ALLOW_UNDEFINED_WITH_FN<T>(fn: (value: T) => boolean){
	return function(value: T | undefined){
		if (!value){
			return true
		} else {
			return fn(value)
		}
	}
}

export {
	NON_ZERO,
	NON_ZERO_NON_NEGATIVE,
	NON_ZERO_NON_POSITIVE,
	
	PASSTHROUGH,
	ALLOW_UNDEFINED_WITH_FN,
	
	STRLEN_LT,
	STRLEN_GT,
	STRLEN_EQ,
	STRLEN_LT_EQ,
	STRLEN_GT_EQ,
	STRLEN_NZ
}