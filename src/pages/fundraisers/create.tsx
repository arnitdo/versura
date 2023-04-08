import EuiCenter from "@/components/customCenter";
import {
	EuiButton,
	EuiFieldNumber,
	EuiFieldText,
	EuiFilePicker,
	EuiFlexGrid,
	EuiFlexGroup,
	EuiFlexItem,
	EuiForm,
	EuiFormRow, EuiGlobalToastList,
	EuiHorizontalRule,
	EuiPanel,
	EuiProgress,
	EuiSelect,
	EuiText,
	EuiTextArea
} from "@elastic/eui";
import VersuraIcon from "@/assets/versura-icon.png";
import Link from "next/link"
import Image from "next/image"
import {EuiSelectOption} from "@elastic/eui/src/components/form/select/select";
import {useCallback, useEffect, useRef, useState} from "react";
import {
	AddFundraiserContentBody,
	AddFundraiserContentParams,
	CreateFundraiserRequestBody,
	MediaCallbackBody,
	PresignedURLBody
} from "@/utils/types/apiRequests";
import {makeAPIRequest} from "@/utils/apiHandler";
import {
	PresignedURLResponse,
	CreateFundraiserResponse,
	MediaCallbackResponse,
	APIResponse
} from "@/utils/types/apiResponses";
import {useToastList} from "@/utils/toastUtils";
import {useRouter} from "next/router";

type InvalidMap<T> = {
	[propName in keyof Required<T>]: boolean
}

export default function CreateFundraiser(): JSX.Element {
	const FUNDRAISER_REDIR_TIMEOUT_S = 5 as const;
	
	const [fundraiserFormData, setFundraiserFormData] = useState<CreateFundraiserRequestBody>({
		fundraiserTitle: "",
		fundraiserDescription: "",
		fundraiserTarget: 0,
		fundraiserToken: "ETH",
		fundraiserMinDonationAmount: 0
	});
	const [fundraiserMedia, setFundraiserMedia] = useState<File[]>([]);
	
	const [invalidInputMap, setInvalidInputMap] = useState<InvalidMap<CreateFundraiserRequestBody>>({
		fundraiserToken: false,
		fundraiserTarget: false,
		fundraiserMinDonationAmount: false,
		fundraiserDescription: false,
		fundraiserTitle: false
	})
	
	const navRouter = useRouter()
	
	const {fundraiserTitle, fundraiserDescription, fundraiserTarget, fundraiserToken, fundraiserMinDonationAmount} = fundraiserFormData
	const {
		fundraiserToken: isTokenInvalid,
		fundraiserTarget: isTargetInvalid,
		fundraiserMinDonationAmount: isDonationAmtInvalid,
		fundraiserTitle: isTitleInvalid,
		fundraiserDescription: isDescriptionInvalid
	} = invalidInputMap
	
	const {toasts, addToast, dismissToast} = useToastList({
		toastIdFactoryFn: (toastCount, toastType) => {
			return `create-fundraiser-${toastCount}`
		}
	})
	
	const filePickerRef = useRef<EuiFilePicker>()
	
	const fundraiserTokenOptions: EuiSelectOption[] = [
		{
			value: "ETH",
			text: "Ethereum (ETH)"
		}
	]
	
	const [fundraiserCreationProgressValue, setFundraiserCreationProgressValue] = useState<number>(0)
	const [fundraiserCreationProgressColor, setFundraiserCreationProgressColor] = useState<string>("red")
	
	const createFundraiserWithMedia = useCallback(async () => {
		let successFundraiserId: number = -1;
		let presignedUrls: string[] = []
		
		let fundraiserCreationStatus = {
			createFundraiser: false,
			getPresignedUrls: false,
			uploadMediaToUrl: false,
			contentMediaCallback: false,
			fundraiserContentUpdate: false
		}
		// Create fundraiser in API
		{
			const {isSuccess, isError, code, data, error} = await makeAPIRequest<CreateFundraiserResponse>({
				endpointPath: `/api/fundraisers`,
				requestMethod: "POST",
				bodyParams: fundraiserFormData
			})
			if (isError && error){
				addToast(
					"An error occurred when processing your request",
					(error as Error).message || "",
					"danger"
				)
				return
			}
			if (isSuccess && data){
				const {requestStatus} = data
				if (requestStatus === "ERR_MISSING_BODY_PARAMS" || requestStatus === "ERR_INVALID_BODY_PARAMS"){
					const missingParams = data.missingParams!
					const clonedInvalidMap = {...invalidInputMap}
					for (const missingParam of missingParams) {
						// @ts-ignore
						clonedInvalidMap[missingParam] = true
					}
					setInvalidInputMap(clonedInvalidMap)
					addToast(
						"Please fill all required fields",
						"",
						"danger"
					)
					return
				}
				if (requestStatus === "ERR_AUTH_REQUIRED"){
					addToast(
						"You need to be authenticated to create fundraisers",
						"Log in or Create an account to set up fundraisers",
						"danger"
					)
					return
				}
				if (requestStatus === "SUCCESS"){
					const {fundraiserId} = data
					successFundraiserId = fundraiserId
					fundraiserCreationStatus.createFundraiser = true
					setFundraiserCreationProgressValue(fundraiserMedia.length)
				}
			}
		}
		
		// Get presigned URLs for each media
		{
			if (!fundraiserCreationStatus.createFundraiser){
				return false
			}
			presignedUrls = await Promise.all(
				fundraiserMedia.map(async (mediaFile, mediaIdx) => {
					const objectKey = `fundraisers/${successFundraiserId}/media/${mediaIdx + 1}`
					const {isSuccess, isError, code, data, error, } = await makeAPIRequest<PresignedURLResponse, PresignedURLBody>({
						endpointPath: `/api/content/presigned_url`,
						requestMethod: "POST",
						bodyParams: {
							objectKey: objectKey,
							requestMethod: "PUT"
						}
					})
					if (isSuccess && data){
						const {requestStatus} = data
						if (requestStatus === "SUCCESS"){
							const {presignedUrl} = data
							setFundraiserCreationProgressValue((oldProgress) => {
								return oldProgress + 1
							})
							return presignedUrl
						} else {
							return ""
						}
					}
					return ""
				})
			)
			presignedUrls = presignedUrls.filter((presignedUrl) => {
				return presignedUrl.length > 0
			})
			if (presignedUrls.length === fundraiserMedia.length){
				fundraiserCreationStatus.getPresignedUrls = true
			}
		}
		{
			if (!fundraiserCreationStatus.getPresignedUrls){
				return
			}
			// Put to each PresignedURL
			let fileUploadStatuses = await Promise.all(
				presignedUrls.map(async (presignedUrl, index) => {
					const fileToPut = fundraiserMedia[index]
					try {
						await fetch(
							presignedUrl,
							{
								method: "PUT",
								body: fileToPut,
								headers: {
									"Content-Type": fileToPut.type
								}
							}
						)
						setFundraiserCreationProgressValue((oldProgress) => {
							return oldProgress + 1
						})
						return true
					} catch (e) {
						console.error(e)
						console.error(`Unable to upload file ${fileToPut.name}`)
						return false
					}
				})
			)
			fileUploadStatuses = fileUploadStatuses.filter(Boolean)
			if (fileUploadStatuses.length == fundraiserMedia.length){
				fundraiserCreationStatus.uploadMediaToUrl = true
			}
		}
		{
			if (!fundraiserCreationStatus.uploadMediaToUrl){
				return
			}
			let mediaCallbackStatuses = await Promise.all(
				fundraiserMedia.map(async (mediaFile, fileIdx) => {
					const objectKey = `fundraisers/${successFundraiserId}/media/${fileIdx + 1}`
					const {type: objectContentType, size: objectSizeBytes} = mediaFile
					const {isSuccess, isError, code, data, error} = await makeAPIRequest<MediaCallbackResponse, MediaCallbackBody>({
						endpointPath: `/api/content/media_callback`,
						requestMethod: "POST",
						bodyParams: {
							objectKey: objectKey,
							requestMethod: "PUT",
							objectContentType: objectContentType,
							objectSizeBytes: objectSizeBytes
						}
					})
					if (isSuccess && data){
						const {requestStatus} = data
						if (requestStatus === "SUCCESS"){
							setFundraiserCreationProgressValue((oldProgress) => {
								return oldProgress + 1
							})
							return true
						}
					}
					return false
				})
			)
			mediaCallbackStatuses = mediaCallbackStatuses.filter(Boolean)
			if (mediaCallbackStatuses.length === fundraiserMedia.length){
				fundraiserCreationStatus.contentMediaCallback = true
			}
		}
		{
			if (!fundraiserCreationStatus.contentMediaCallback){
				return
			}
			let fundraiserContentUpdateStatus = await Promise.all(
				fundraiserMedia.map(async (mediaFile, mediaIdx) => {
					const objectKey = `fundraisers/${successFundraiserId}/media/${mediaIdx + 1}`
					const {isSuccess, isError, code, data, error} = await makeAPIRequest<APIResponse, AddFundraiserContentBody, AddFundraiserContentParams>({
						endpointPath: "/api/fundraisers/:fundraiserId/content",
						requestMethod: "POST",
						queryParams: {
							fundraiserId: successFundraiserId.toString()
						},
						bodyParams: {
							objectKey: objectKey
						}
					})
					if (isSuccess && data){
						const {requestStatus} = data
						if (requestStatus === "SUCCESS"){
							setFundraiserCreationProgressValue((oldProgress) => {
								return oldProgress + 1
							})
							return true
						}
					}
					return false
				})
			)
			if (fundraiserContentUpdateStatus.length === fundraiserMedia.length){
				fundraiserCreationStatus.fundraiserContentUpdate = true
			}
		}
		{
			if (fundraiserCreationStatus.fundraiserContentUpdate == true){
				addToast(
					"Fundraiser created successfully",
					`You will be redirected in ${FUNDRAISER_REDIR_TIMEOUT_S} seconds`,
					"success"
				)
				setTimeout(
					() => {
						navRouter.push(`/fundraisers/${successFundraiserId}`)
					},
					FUNDRAISER_REDIR_TIMEOUT_S * 1000
				)
			}
		}
	}, [fundraiserFormData, fundraiserMedia, addToast])
	
	const resetForm = () => {
		setFundraiserFormData({
			fundraiserTitle: "",
			fundraiserDescription: "",
			fundraiserTarget: 0,
			fundraiserToken: "ETH",
			fundraiserMinDonationAmount: 0
		})
		setInvalidInputMap({
			fundraiserTitle: false,
			fundraiserDescription: false,
			fundraiserTarget: false,
			fundraiserToken: false,
			fundraiserMinDonationAmount: false
		})
		filePickerRef.current?.removeFiles()
	}
	
	return (
		<EuiCenter
			height={"180vh"}
			width={"100vw"}
		>
			<EuiPanel
				hasShadow={true}
				grow={true}
				style={{
					minWidth: "80vw"
				}}
			>
				<EuiFlexGroup
					direction={"row"}
					justifyContent={"spaceBetween"}
					alignItems={"flexEnd"}
				>
					<EuiFlexItem
						grow={0}
						style={{
							alignItems: "center"
						}}
					>
						<EuiText>
							<h1>Kickstart your fundraiser</h1>
						</EuiText>
					</EuiFlexItem>
					<EuiFlexItem grow={0}>
						<Link href={"/"}>
							<Image
								src={VersuraIcon}
								alt={"Versura Icon"}
								placeholder={"blur"}
								height={40}
								width={291}
							/>
						</Link>
					</EuiFlexItem>
				</EuiFlexGroup>
				<EuiHorizontalRule />
				<EuiFlexGroup
					direction={"column"}
				>
					<EuiForm
						component={"form"}
						onSubmit={e => e.preventDefault()}
					>
						<EuiFormRow
							label={"Fundraiser Title"}
							fullWidth
						>
							<EuiFieldText
								placeholder={"A title, short and sweet"}
								fullWidth
								required
								onChange={e => {
									setFundraiserFormData((oldFormData) => {
										return {
											...oldFormData,
											fundraiserTitle: e.target.value
										}
									})
								}}
								isInvalid={isTitleInvalid}
							/>
						</EuiFormRow>
						<EuiFormRow
							label={"Fundraiser Description"}
							fullWidth
						>
							<EuiTextArea
								placeholder={"A descriptive summary of your fundraiser. Explain your targets, and how you plan on achieving them"}
								fullWidth
								required
								resize={"none"}
								onChange={e => {
									setFundraiserFormData((oldFormData) => {
										return {
											...oldFormData,
											fundraiserDescription: e.target.value
										}
									})
								}}
								isInvalid={isDescriptionInvalid}
							/>
						</EuiFormRow>
						<EuiFormRow
							label={"Fundraiser Token"}
							fullWidth
						>
							<EuiSelect
								options={fundraiserTokenOptions}
								fullWidth
								required
								value={fundraiserToken}
								onChange={e => {
									setFundraiserFormData((oldFormData) => {
										return {
											...oldFormData,
											fundraiserToken: e.target.value
										}
									})
								}}
								isInvalid={isTokenInvalid}
							/>
						</EuiFormRow>
						<EuiFormRow
							label={"Fundraiser Target"}
							fullWidth
						>
							<EuiFieldText
								placeholder={`Target ${fundraiserToken} amount for the fundraiser`}
								fullWidth
								required
								onChange={e => {
									setFundraiserFormData((oldFormData) => {
										const targetAmtString = e.target.value
										const parsedTargetAmt= Number.parseFloat(targetAmtString)
										if (Number.isNaN(parsedTargetAmt)){
											return oldFormData
										}
										return {
											...oldFormData,
											fundraiserTarget: parsedTargetAmt
										}
									})
								}}
								append={fundraiserToken}
								isInvalid={isTargetInvalid}
							/>
						</EuiFormRow>
						<EuiFormRow
							label={"Fundraiser Minimum Amount"}
							fullWidth
						>
							<EuiFieldText
								placeholder={`Minimum ${fundraiserToken} value that can be donated`}
								fullWidth
								required
								onChange={e => {
									setFundraiserFormData((oldFormData) => {
										const minDonationAmtString = e.target.value
										const parsedDonationAmt = Number.parseFloat(minDonationAmtString)
										if (Number.isNaN(parsedDonationAmt)){
											return oldFormData
										}
										
										return {
											...oldFormData,
											fundraiserMinDonationAmount: parsedDonationAmt
										}
									})
								}}
								append={fundraiserToken}
								isInvalid={isDonationAmtInvalid}
							/>
						</EuiFormRow>
						<EuiHorizontalRule />
						<EuiFormRow
							label={"Fundraiser Media"}
							fullWidth
						>
							<EuiFilePicker
							 	display={"large"}
								fullWidth
								multiple
								initialPromptText={"Select or drag and drop multiple files"}
								onChange={(fileList) => {
									const fileArray = Array.from(fileList || [])
									setFundraiserMedia(fileArray)
								}}
								// @ts-ignore
								ref={filePickerRef}
							/>
						</EuiFormRow>
						<EuiHorizontalRule />
						<EuiProgress
							value={fundraiserCreationProgressValue}
							max={fundraiserMedia.length * 5}
						/>
						<EuiHorizontalRule />
						<EuiFormRow
							label={""}
							fullWidth
						>
							<EuiFlexGroup
								direction={"row"}
							>
								<EuiButton
									color={"primary"}
									onClick={createFundraiserWithMedia}
									fullWidth
								>
									Create Fundraiser
								</EuiButton>
								<EuiButton
									color={"ghost"}
									onClick={resetForm}
									fullWidth
								>
									Clear Data
								</EuiButton>
							</EuiFlexGroup>
						</EuiFormRow>
					</EuiForm>
				</EuiFlexGroup>
			</EuiPanel>
			<EuiGlobalToastList
				dismissToast={dismissToast}
				toastLifeTimeMs={5000}
				toasts={toasts}
			/>
		</EuiCenter>
	)
}