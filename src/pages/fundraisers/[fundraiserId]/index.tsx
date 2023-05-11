import {GetServerSideProps} from "next";
import {
	FundraiserDonationBody,
	FundraiserDonationParams,
	FundraiserWithdrawalRequestBody,
	FundraiserWithdrawalRequestParams,
	GetFundraiserRequestParams
} from "@/types/apiRequests";
import {APIResponse, GetFundraiserResponse} from "@/types/apiResponses";
import {NON_ZERO_NON_NEGATIVE} from "@/utils/validatorUtils";
import {
	calculateServiceFeeWeiForAmount,
	gasAmountMap,
	gasTokenMap,
	LINK_TEXT_COLOR_OVERRIDE,
	requireBasicObjectValidation,
	useValueScale
} from "@/utils/common";
import {makeAPIRequest} from "@/utils/apiHandler";
import {
	EuiButton,
	EuiCheckbox,
	EuiFieldText,
	EuiFlexGroup,
	EuiFlexItem,
	EuiForm,
	EuiFormRow,
	EuiGlobalToastList,
	EuiHorizontalRule,
	EuiLoadingSpinner,
	EuiMarkdownFormat,
	EuiPanel,
	EuiSpacer,
	EuiText,
	useGeneratedHtmlId
} from "@elastic/eui";
import Image from "next/image";

import React, {useCallback, useContext, useEffect, useState} from "react";
import {AuthContext} from "@/pages/_app";
import {useToastList} from "@/utils/toastUtils";
import Link from "next/link";
import Head from "next/head";


type FundraiserPageProps = GetFundraiserResponse["fundraiserData"]

// @ts-ignore
export const getServerSideProps: GetServerSideProps<FundraiserPageProps, GetFundraiserRequestParams> = async (ctx) => {
	if (ctx.params === undefined) {
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
				if (Number.isNaN(parsedFundraiserId)) {
					return false
				}
				return NON_ZERO_NON_NEGATIVE(parsedFundraiserId);
			}
		}
	)

	if (!isValidFundraiserId) {
		return {
			redirect: {
				destination: "/400",
				permanent: true
			}
		}
	}

	const {fundraiserId} = ctx.params

	const {
		isSuccess,
		isError,
		code,
		data,
		error
	} = await makeAPIRequest<GetFundraiserResponse, {}, GetFundraiserRequestParams>({
		endpointPath: `/api/fundraisers/:fundraiserId`,
		requestMethod: "GET",
		queryParams: {
			fundraiserId: fundraiserId
		},
		// @ts-ignore
		ssrContext: ctx
	})

	if (isError) {
		console.error(error)
		return {
			redirect: {
				destination: "/500",
				permanent: true
			}
		}
	}

	if (isSuccess) {
		const {requestStatus} = data!
		if (code === 500 && requestStatus === "ERR_INTERNAL_ERROR") {
			return {
				redirect: {
					destination: "/500",
					permanent: true
				}
			}
		}
		if (code === 200 && requestStatus === "SUCCESS") {
			return {
				props: data!.fundraiserData
			}
		}
		if (code === 400 && requestStatus === "ERR_INVALID_QUERY_PARAMS") {
			return {
				redirect: {
					destination: "/404",
					permanent: true
				}
			}
		}
		if (code === 404 && requestStatus === "ERR_NOT_FOUND") {
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
	const authCtx = useContext(AuthContext)

	const {
		fundraiserId, fundraiserTarget, fundraiserMedia, fundraiserCreatedOn,
		fundraiserToken, fundraiserMilestoneCount, fundraiserContributorCount,
		fundraiserCreator, fundraiserDescription, fundraiserTitle,
		fundraiserMilestones, fundraiserRaisedAmount, fundraiserMinDonationAmount,
		fundraiserWithdrawnAmount
	} = props

	const parsedFundraiserCreationDate = new Date(fundraiserCreatedOn)

	const relativeFundraiserDate = parsedFundraiserCreationDate.toDateString()

	// @ts-ignore
	const selectedGasToken = gasTokenMap[fundraiserToken]
	// @ts-ignore
	const gasAmountWei = gasAmountMap[fundraiserToken]

	const [donationAmount, setDonationAmount] = useState<number>(fundraiserMinDonationAmount)
	const [donationInvalid, setDonationInvalid] = useState<boolean>(false);
	const [donationRequestActive, setDonationRequestActive] = useState(false);

	const [conditionsAccepted, setConditionsAccepted] = useState<boolean>(false)

	const [raisedAmount, setRaisedAmount] = useState<number>(fundraiserRaisedAmount)
	const [contribCount, setContribCount] = useState<number>(fundraiserContributorCount);

	const {toasts, addToast, dismissToast} = useToastList({
		toastIdFactoryFn: (toastCount, toastType) => {
			return `fundraiser-page-${toastCount}`
		}
	})

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
	const fundraiserPercentageInt = fundraiserCompletionPercentage.toFixed(0)

	const calculatedServiceFeeWei = calculateServiceFeeWeiForAmount(
		donationAmount,
		fundraiserToken
	)

	const calculatedServiceFeeEth = calculatedServiceFeeWei * 1e-18

	const finalAmountEth = (
		donationAmount +
		calculatedServiceFeeEth
	)

	const sendFundraiserDonation = useCallback(async () => {
		if (!authCtx.isAuthenticated) {
			addToast(
				"Log in to send funds",
				"You must be authenticated to send funds",
				"danger"
			)
			return
		}

		if (donationInvalid) {
			addToast(
				"Invalid amount entered",
				`Please enter a value greater than ${fundraiserMinDonationAmount} ${fundraiserToken}`,
				"danger"
			)
			return
		}

		if (!conditionsAccepted) {
			addToast(
				"You must accept the Terms and Conditions",
				"",
				"danger"
			)
			return
		}

		const holdingAccountAddress = process.env.NEXT_PUBLIC_VERSURA_ACCOUNT_ADDRESS

		try {
			setDonationRequestActive(true)

			const finalAmountWei = finalAmountEth * 1e18
			const finalAmountString = finalAmountWei.toString(16)

			const requestParams = {
				from: authCtx.metamaskAddress!,
				to: holdingAccountAddress,
				value: finalAmountString
			}


			// @ts-ignore
			const ethResponse: string = await window.ethereum.request({
				method: "eth_sendTransaction",
				params: [
					requestParams
				]
			})

			const {
				isSuccess,
				isError,
				code,
				data,
				error
			} = await makeAPIRequest<APIResponse, FundraiserDonationBody, FundraiserDonationParams>({
				endpointPath: `/api/fundraisers/:fundraiserId/donations`,
				requestMethod: "POST",
				queryParams: {
					fundraiserId: fundraiserId.toString()
				},
				bodyParams: {
					donatedAmount: donationAmount,
					transactionHash: ethResponse
				}
			})

			if (isError && error) {
				addToast(
					"We encountered an error when processing your request",
					(error as Error).message || "",
					"danger"
				)
				setDonationRequestActive(false)
				return
			}

			if (isSuccess && data) {
				const {requestStatus} = data
				if (requestStatus === "SUCCESS") {
					setRaisedAmount((prevAmount) => {
						return prevAmount + donationAmount
					})
					setContribCount((contCount) => {
						return contCount + 1
					})
					addToast(
						"Transaction created successfully!",
						(
							<Link
								href={`https://${process.env.NEXT_PUBLIC_EVM_CHAIN_NAME}.etherscan.io/tx/${ethResponse}`}
								target={"_blank"}
							>
								<EuiText
									color={LINK_TEXT_COLOR_OVERRIDE}
								>
									View on Etherscan
								</EuiText>
							</Link>
						),
						"success"
					)
					setDonationRequestActive(false)
					return
				} else {
					addToast(
						"We encountered an error when processing your request",
						"",
						"danger"
					)
					setDonationRequestActive(false)
					return
				}
			}
		} catch (err) {
			// @ts-ignore
			if (err.code === 4001) {
				addToast(
					"Transaction was cancelled",
					"Transaction was cancelled by the user",
					"warning"
				)
				setDonationRequestActive(false)
				return
			}
			console.error(err)
			addToast(
				"An unexpected error occurred",
				"We weren't able to complete your transaction",
				"danger"
			)
			setDonationRequestActive(false)
			return
		}
	}, [donationAmount, gasAmountWei, calculatedServiceFeeWei, finalAmountEth, authCtx, conditionsAccepted])

	const [withdrawalAmount, setWithdrawalAmount] = useState(raisedAmount);
	const [withdrawalInvalid, setWithdrawalInvalid] = useState<boolean>(false)

	const [withdrawalRequestActive, setWithdrawalRequestActive] = useState<boolean>(false)

	const maxWithdrawableAmount = raisedAmount - fundraiserWithdrawnAmount

	useEffect(() => {
		setWithdrawalAmount(maxWithdrawableAmount)
		if (maxWithdrawableAmount == 0) {
			setWithdrawalInvalid(true)
		}
	}, [raisedAmount])

	const createWithdrawalRequest = useCallback(async () => {
		if (withdrawalInvalid) {
			addToast(
				"Invalid withdrawal amount provided",
				"The withdrawal amount cannot be greater than the funds accumulated",
				"danger"
			)
			return
		}

		setWithdrawalRequestActive(true)
		const {
			isSuccess,
			isError,
			code,
			data,
			error
		} = await makeAPIRequest<APIResponse, FundraiserWithdrawalRequestBody, FundraiserWithdrawalRequestParams>({
			endpointPath: "/api/fundraisers/:fundraiserId/withdrawals",
			requestMethod: "POST",
			queryParams: {
				fundraiserId: fundraiserId.toString()
			},
			bodyParams: {
				withdrawalAmount: withdrawalAmount
			}
		})

		if (isError && error) {
			addToast(
				"We encountered an error when processing your request",
				(error as Error).message || "",
				"danger"
			)
			setWithdrawalRequestActive(false)
			return
		}

		if (isSuccess && data) {
			const {requestStatus, invalidParams} = data
			if (requestStatus === "SUCCESS") {
				addToast(
					"Your request was successfully registered",
					"Funds will be made available to you once the request is manually approved",
					"success"
				)
				setWithdrawalRequestActive(false)
				return
			} else if (requestStatus === "ERR_INVALID_BODY_PARAMS") {
				if (invalidParams!.includes("withdrawalAmount")) {
					addToast(
						"Invalid withdrawal amount specified",
						"The amount you entered has not been acquired yet",
						"danger"
					)
					setWithdrawalRequestActive(false)
					return
				}
			} else {
				addToast(
					"We encountered an error when processing your request",
					"",
					"danger"
				)
				setWithdrawalRequestActive(false)
				return
			}
		}
	}, [withdrawalAmount, withdrawalInvalid])

	const checkboxId = useGeneratedHtmlId({
		prefix: "fundraiser-checkbox"
	})

	return (
		<>
			<Head>
				<title>{fundraiserTitle}</title>
				<meta name="description" content={fundraiserDescription}/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<link rel="icon" href="/favicon.ico"/>
			</Head>
			<EuiFlexGroup
				direction={"column"}
				alignItems={"center"}
			>
				<EuiSpacer/>
				<EuiPanel
					style={{
						width: "90vw"
					}}
				>
					<EuiFlexGroup
						direction={"row"}
						alignItems={"center"}
					>
						<EuiFlexItem>
							<EuiText>
								<h1>{fundraiserTitle}</h1>
							</EuiText>
						</EuiFlexItem>
						<EuiFlexItem grow={0}>
							<EuiText grow={false}>
								<h4>{relativeFundraiserDate}</h4>
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
							<EuiMarkdownFormat
								grow={true}
							>
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
																	{`${fundraiserTarget} ${fundraiserToken}`}
																</h3>
															</EuiText>
														</EuiFlexItem>
														<EuiFlexItem>
															<EuiText
																textAlign={"center"}
															>
																<h5>Target</h5>
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
																	{contribCount}
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
											</EuiFlexGroup>
										</EuiFlexItem>
									</EuiFlexGroup>
								</EuiPanel>
							</EuiFlexItem>
							{
								authCtx.metamaskAddress === fundraiserCreator ? (
									<EuiFlexItem>
										<EuiPanel>
											<EuiFlexGroup
												direction={"column"}
												alignItems={"center"}
											>
												<EuiFlexItem>
													<EuiText>
														<h1>Request Withdrawal</h1>
													</EuiText>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiForm fullWidth>
														<EuiFormRow
															label={"Amount to withdraw"}
															fullWidth
														>
															<EuiFieldText
																fullWidth
																defaultValue={maxWithdrawableAmount}
																append={fundraiserToken}
																isInvalid={withdrawalInvalid}
																onChange={(e) => {
																	const withdrawalAmtString = e.target.value
																	const parsedAmount = Number.parseFloat(withdrawalAmtString)
																	if (Number.isNaN(parsedAmount)) {
																		setWithdrawalInvalid(true)
																		return
																	}
																	if (parsedAmount > maxWithdrawableAmount) {
																		setWithdrawalInvalid(true)
																		return;
																	}
																	if (parsedAmount <= 0) {
																		setWithdrawalInvalid(true)
																		return
																	}
																	setWithdrawalAmount(parsedAmount)
																	setWithdrawalInvalid(false)
																}}
															/>
														</EuiFormRow>
														<EuiFormRow fullWidth>
															<EuiButton
																color={"primary"}
																fullWidth
																fill
																disabled={withdrawalInvalid || withdrawalRequestActive || maxWithdrawableAmount == 0}
																onClick={createWithdrawalRequest}
															>
																{
																	withdrawalRequestActive ? (
																		<EuiLoadingSpinner/>
																	) : (
																		`Create Request`
																	)
																}
															</EuiButton>
														</EuiFormRow>
													</EuiForm>
												</EuiFlexItem>
											</EuiFlexGroup>
										</EuiPanel>
									</EuiFlexItem>
								) : (
									<EuiFlexItem>
										<EuiPanel>
											<EuiFlexGroup
												direction={"column"}
												alignItems={"center"}
											>
												<EuiFlexItem>
													<EuiText>
														<h1>Fund this Campaign</h1>
													</EuiText>
												</EuiFlexItem>
												<EuiHorizontalRule margin={"none"}/>
												<EuiFlexItem>
													<EuiForm fullWidth>
														<EuiFormRow
															label={"Base Amount"}
															helpText={"This amount will directly go to the fundraiser creator"}
														>
															<EuiFieldText
																placeholder={`${fundraiserMinDonationAmount}`}
																defaultValue={fundraiserMinDonationAmount}
																append={fundraiserToken}
																onChange={(e) => {
																	const parsedDonationAmount = Number.parseFloat(e.target.value)
																	if (Number.isNaN(parsedDonationAmount)) {
																		setDonationInvalid(true)
																		return
																	}
																	if (parsedDonationAmount < fundraiserMinDonationAmount) {
																		setDonationInvalid(true)
																		return
																	}
																	setDonationAmount(parsedDonationAmount)
																	setDonationInvalid(false)
																}}
																isInvalid={donationInvalid}
															/>
														</EuiFormRow>
														<EuiFormRow
															label={"Service Fees"}
															helpText={"This service fee is levied by Versura"}
														>
															<EuiFieldText
																readOnly
																value={calculatedServiceFeeEth.toFixed(8)}
																append={fundraiserToken}
															/>
														</EuiFormRow>
														<EuiFormRow
															label={"Final Transaction Amount"}
															fullWidth
															helpText={"Final Amount Payable"}
														>
															<EuiFieldText
																value={finalAmountEth.toFixed(8)}
																readOnly
																append={fundraiserToken}
																fullWidth
															/>
														</EuiFormRow>
														<EuiFormRow>
															<EuiCheckbox
																id={checkboxId}
																checked={conditionsAccepted}
																onChange={(e) => {
																	setConditionsAccepted(e.target.checked)
																}}
																label={"I accept the Terms and Conditions"}
															/>
														</EuiFormRow>
														<EuiFormRow
															fullWidth
														>
															{authCtx.isAuthenticated ? (
																<EuiButton
																	color={"primary"}
																	fill
																	fullWidth
																	onClick={sendFundraiserDonation}
																	disabled={(!donationInvalid && !conditionsAccepted) || donationRequestActive}
																>
																	{donationRequestActive ? (
																		<EuiLoadingSpinner/>
																	) : (
																		`Send ${fundraiserToken}`
																	)}
																</EuiButton>
															) : (
																<EuiButton
																	color={"primary"}
																	fill
																	disabled
																	fullWidth
																>
																	Log in to donate funds
																</EuiButton>
															)}
														</EuiFormRow>
													</EuiForm>
												</EuiFlexItem>
											</EuiFlexGroup>
										</EuiPanel>
									</EuiFlexItem>
								)
							}
						</EuiFlexGroup>
					</EuiFlexItem>
				</EuiFlexGroup>
				<EuiSpacer/>
				<EuiGlobalToastList
					dismissToast={dismissToast}
					toasts={toasts}
					toastLifeTimeMs={5000}
				/>
			</EuiFlexGroup>
		</>
	)
}