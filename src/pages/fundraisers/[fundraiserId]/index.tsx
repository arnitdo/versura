import {GetServerSideProps} from "next";
import {GetFundraiserRequestParams} from "@/utils/types/apiRequests";
import {GenericMedia, GetFundraiserResponse} from "@/utils/types/apiResponses";
import {NON_ZERO_NON_NEGATIVE} from "@/utils/validatorUtils";
import {
	gasAmountMap,
	gasTokenMap,
	LINK_TEXT_COLOR_OVERRIDE,
	requireBasicObjectValidation,
	useValueScale
} from "@/utils/common";
import {makeAPIRequest} from "@/utils/apiHandler";
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiPanel,
	EuiSpacer,
	EuiText,
	EuiMarkdownFormat,
	EuiAvatar,
	EuiHorizontalRule,
	EuiForm,
	EuiFieldText, EuiFormRow, EuiButton
} from "@elastic/eui";
import Image from "next/image";

import PlaceholderImage from "@/assets/placeholder-image.png"


type FundraiserPageProps = GetFundraiserResponse["fundraiserData"]

// @ts-ignore
export const getServerSideProps: GetServerSideProps<FundraiserPageProps, GetFundraiserRequestParams> = async (ctx) => {
	if (ctx.params === undefined){
		return {
			redirect: {
				destination: "/404"
			}
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
	
	const {isSuccess, isError, code, data, error} = await makeAPIRequest<GetFundraiserResponse, {}, GetFundraiserRequestParams>({
		endpointPath: `/api/fundraisers/:fundraiserId`,
		requestMethod: "GET",
		queryParams: {
			fundraiserId: fundraiserId
		},
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
	const {
		fundraiserId, fundraiserTarget, fundraiserMedia, fundraiserCreatedOn,
		fundraiserToken, fundraiserMilestoneCount, fundraiserContributorCount,
		fundraiserCreator, fundraiserDescription, fundraiserTitle,
		fundraiserMilestones, fundraiserRaisedAmount, fundraiserMinDonationAmount
	} = props
	
	const progressStatusColors = ["danger", "orange", "yellow", "green", "success"]
	
	const fundraiserCompletionPercentage = (fundraiserRaisedAmount * 100) / fundraiserTarget
	
	const selectedColor = useValueScale({
		minScale: 0,
		maxScale: 4,
		minValue: 0,
		maxValue: 100,
		currValue: fundraiserCompletionPercentage,
		scaledValues: progressStatusColors
	})
	
	const fundraiserPercentageInt = Number.parseInt(
		fundraiserCompletionPercentage.toString()
	)
	
	let selectedFundraiserMedia: GenericMedia | null = null
	for (const media of fundraiserMedia){
		const {mediaContentType} = media
		if (mediaContentType.startsWith("image/")){
			selectedFundraiserMedia = media
			break
		}
	}
	
	
	// @ts-ignore
	const selectedGasToken = gasTokenMap[fundraiserToken]
	// @ts-ignore
	const selectedGasAmount = gasAmountMap[fundraiserToken]
	
	const calculatedServiceFee = (
		/* SELECTED GAS AMT */selectedGasAmount +
		/* SELECTED DONATION AMT */ fundraiserMinDonationAmount * 1e-8
	) * 1e10
	
	return (
		<EuiFlexGroup
			direction={"column"}
			alignItems={"center"}
		>
			<EuiSpacer />
			<EuiPanel
				style={{
					width: "90vw"
				}}
			>
				<EuiFlexGroup
					direction={"row"}
					alignItems={"center"}
					justifyContent={"spaceAround"}
				>
					{
						selectedFundraiserMedia  && (
							<EuiFlexItem grow={0}>
								<Image
									src={
										selectedFundraiserMedia.mediaURL
									}
									alt={fundraiserTitle}
									width={240}
									height={-1}
									style={{
										maxHeight: 180,
										borderRadius: 12
									}}
								/>
							</EuiFlexItem>
						)
					}
					<EuiFlexItem grow={0}>
						<EuiText>
							<h2>{fundraiserTitle}</h2>
						</EuiText>
					</EuiFlexItem>
				</EuiFlexGroup>
			</EuiPanel>
			<EuiFlexGroup
				style={{
					width: "90vw"
				}}
			>
				<EuiFlexItem grow={7}>
					<EuiPanel>
						<EuiMarkdownFormat>
							{fundraiserDescription}
						</EuiMarkdownFormat>
					</EuiPanel>
				</EuiFlexItem>
				<EuiFlexItem grow={3}>
					<EuiFlexGroup
						direction={"column"}
					>
						<EuiFlexItem>
							<EuiPanel>
								<EuiFlexGroup
									direction={"column"}
									alignItems={"center"}
								>
									<EuiFlexItem>
										<Image
											src={`https://gravatar.com/avatar/${fundraiserCreator.slice(2)}?d=retro&f=y&s=240`}
											alt={fundraiserCreator}
											width={180}
											height={180}
											style={{
												borderRadius: 18
											}}
										/>
									</EuiFlexItem>
									<EuiFlexItem>
										<EuiText>
											{
												fundraiserCreator.slice(0, 12) +
												"..." +
												fundraiserCreator.slice(-12)
											}
										</EuiText>
									</EuiFlexItem>
									<EuiHorizontalRule margin={"none"}/>
									<EuiFlexItem>
										<EuiFlexGroup>
											<EuiFlexItem>
												<EuiFlexGroup
													direction={"column"}
													gutterSize={"s"}
												>
													<EuiFlexItem>
														<EuiText
															textAlign={"center"}
															color={selectedColor}
														>
															<h3>
																{fundraiserPercentageInt}%
															</h3>
														</EuiText>
													</EuiFlexItem>
													<EuiFlexItem>
														<EuiText
															textAlign={"center"}
														>
															<h5>Complete</h5>
														</EuiText>
													</EuiFlexItem>
												</EuiFlexGroup>
											</EuiFlexItem>
											<EuiFlexItem>
												<EuiFlexGroup
													direction={"column"}
													gutterSize={"s"}
												>
													<EuiFlexItem>
														<EuiText
															textAlign={"center"}
														>
															<h3>
																{fundraiserContributorCount}
															</h3>
														</EuiText>
													</EuiFlexItem>
													<EuiFlexItem>
														<EuiText
															textAlign={"center"}
														>
															<h5>Contributors</h5>
														</EuiText>
													</EuiFlexItem>
												</EuiFlexGroup>
											</EuiFlexItem>
											<EuiFlexItem>
												<EuiFlexGroup
													direction={"column"}
													gutterSize={"s"}
												>
													<EuiFlexItem>
														<EuiText
															textAlign={"center"}
														>
															<h3>
																{fundraiserMilestoneCount}
															</h3>
														</EuiText>
													</EuiFlexItem>
													<EuiFlexItem>
														<EuiText
															textAlign={"center"}
														>
															<h5>Milestones</h5>
														</EuiText>
													</EuiFlexItem>
												</EuiFlexGroup>
											</EuiFlexItem>
										</EuiFlexGroup>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiPanel>
						</EuiFlexItem>
						<EuiFlexItem>
							<EuiPanel>
								<EuiFlexGroup
									direction={"column"}
									alignItems={"center"}
								>
									<EuiFlexItem>
										<EuiText>
											<h2>Fund this Campaign</h2>
										</EuiText>
									</EuiFlexItem>
									<EuiFlexItem>
										<EuiForm>
											<EuiFormRow
												label={"Base Amount"}
											>
												<EuiFieldText
													placeholder={`${fundraiserMinDonationAmount}`}
													defaultValue={fundraiserMinDonationAmount}
													append={fundraiserToken}
												/>
											</EuiFormRow>
											<EuiFormRow
												label={"Gas Fees"}
											>
												<EuiFieldText
													// @ts-ignore
													placeholder={selectedGasAmount * 1e10}
													// @ts-ignore
													defaultValue={selectedGasAmount * 1e10}
													// @ts-ignore
													append={selectedGasToken + " (GAS)"}
												/>
											</EuiFormRow>
											<EuiFormRow
												label={"Service Fees"}
											>
												<EuiFieldText
													readOnly
													defaultValue={calculatedServiceFee}
													append={selectedGasToken}
												/>
											</EuiFormRow>
											<EuiFormRow
												label={"Final Transaction Amount"}
											>
												<EuiFieldText
													defaultValue={(
														fundraiserMinDonationAmount +
														selectedGasAmount +
														calculatedServiceFee * 1e-10
													)}
													readOnly
													append={fundraiserToken}
												/>
											</EuiFormRow>
										</EuiForm>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiPanel>
						</EuiFlexItem>
					</EuiFlexGroup>
				</EuiFlexItem>
			</EuiFlexGroup>
			<EuiSpacer />
		</EuiFlexGroup>
	)
}