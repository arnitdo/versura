import {GetServerSideProps} from "next";
import {GetFundraiserRequestParams} from "@/utils/types/apiRequests";
import {GetFundraiserResponse} from "@/utils/types/apiResponses";
import {NON_ZERO_NON_NEGATIVE} from "@/utils/validatorUtils";
import {requireBasicObjectValidation} from "@/utils/common";
import {makeAPIRequest} from "@/utils/apiHandler";

type FundraiserPageProps = GetFundraiserResponse["fundraiserData"]

// @ts-ignore
export const getServerSideProps: GetServerSideProps<FundraiserPageProps, GetFundraiserRequestParams> = async (ctx) => {
	if (ctx.params === undefined){
		return {
			notFound: true
		}
	}
	
	const [isValidFundraiserId, _] = await requireBasicObjectValidation(
		ctx.params,
		{
			fundraiserId: (fundraiserId) => {
				const parsedFundraiserId = Number.parseInt(fundraiserId)
				if (Number.isNaN(parsedFundraiserId)){
					return false
				}
				return NON_ZERO_NON_NEGATIVE(parsedFundraiserId);
			}
		}
	)
	
	if (!isValidFundraiserId){
		return {
			redirect: {
				destination: "/400",
				permanent: true
			}
		}
	}
	
	const {fundraiserId} = ctx.params
	
	const {isSuccess, isError, code, data, error} = await makeAPIRequest<GetFundraiserResponse>({
		endpointPath: `/api/fundraisers/${fundraiserId}`,
		requestMethod: "GET",
		// @ts-ignore
		ssrContext: ctx
	})
	
	if (isError){
		console.error(error)
		return {
			redirect: {
				destination: "/500",
				permanent: true
			}
		}
	}
	
	if (isSuccess){
		const {requestStatus} = data!
		if (code === 500 && requestStatus === "ERR_INTERNAL_ERROR"){
			return {
				redirect: {
					destination: "/500",
					permanent: true
				}
			}
		}
		if (code === 200 && requestStatus === "SUCCESS"){
			return {
				props: data!.fundraiserData
			}
		}
		if (code === 400 && requestStatus === "ERR_INVALID_QUERY_PARAMS"){
			return {
				redirect: {
					destination: "/404",
					permanent: true
				}
			}
		}
		if (code === 404 && requestStatus === "ERR_NOT_FOUND"){
			return {
				redirect: {
					destination: "/404",
					permanent: true
				}
			}
		}
	}
	
	
	return {
		redirect: {
			destination: "/404",
			permanent: true
		}
	}
}

export default function FundraiserPage(props: FundraiserPageProps): JSX.Element {
	return (
		<>
			{JSON.stringify(props)}
		</>
	)
}