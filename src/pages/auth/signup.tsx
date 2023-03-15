import React, {useCallback, useContext, useRef, useState} from "react";
import EuiCenter from '@/components/customCenter'
import Image from 'next/image'
import {
	EuiFlexItem,
	EuiButton,
	EuiPanel,
	EuiFlexGroup,
	EuiForm,
	EuiFormRow,
	EuiFieldText,
	EuiFieldPassword,
	EuiGlobalToastList
} from "@elastic/eui";
import Link from "next/link"
import VersuraIcon from "@/assets/versura-icon.png";
import MetamaskFoxIcon from "@/assets/metamask-fox.svg"

import {useToastList} from "@/utils/toastUtils";
import {AuthContext, AuthContextType} from "@/pages/_app"
import {makeAPIRequest} from "@/utils/apiHandler";
import {LoginResponse} from "@/utils/types/apiTypedefs";

function MetamaskFoxIconWrapped(): JSX.Element {
	return (
		<Image
			src={MetamaskFoxIcon}
			alt={"Metamask Icon"}
			height={16}
			width={16}
		/>
	)
}

function SignupPage(): JSX.Element {
	const authCtx = useContext<AuthContextType>(AuthContext)
	
	const [
		[metamaskConnected, metamaskAddress],
		setMetamaskInfo
	] = useState<[boolean, string]>([false, ""])
	
	const [userPassword, setUserPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	
	const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false);
	
	const {toasts, addToast, dismissToast} = useToastList({
		toastIdFactoryFn: (toastCount, toastType) => {
			return `signup-page-${toastCount}`
		}
	})
	
	const authenticateWithMetamask = useCallback(async () => {
		// @ts-ignore
		if (!window.ethereum){
			addToast(
				"We couldn't connect to MetaMask",
				"Check if you have the MetaMask extension installed!",
				"danger"
			)
			return
		}
		// @ts-ignore
		if (!window.ethereum.isMetaMask){
			addToast(
				"Non-MetaMask wallet detected",
				"We only support Metamask wallets as of now",
				"danger"
			)
			return
		}
		
		try {
			// @ts-ignore
			const ethAccounts: string[] = await window.ethereum.request({method: "eth_requestAccounts"})
			
			const selectedAccount = ethAccounts[0]
			
			setMetamaskInfo([true, selectedAccount])
		} catch (err: unknown){
			addToast(
				"Please authenticate with MetaMask",
				"Connect your MetaMask account with Versura to continue",
				"danger"
			)
			return
		}
	}, [])
	
	const attemptUserSignup = useCallback(async () => {
		if (!metamaskConnected){
			addToast(
				"Metamask Authentication is required",
				"Connect to Metamask by clicking the \"Connect\" button",
				"danger"
			)
			return
		}
		
		if (userPassword !== confirmPassword){
			console.log({userPassword, confirmPassword})
			setPasswordMismatch(true)
			addToast(
				"Passwords do not match",
				"Passwords are case and whitespace sensitive",
				"danger"
			)
			return
		}
		
		const signupAPIResponse = await makeAPIRequest<LoginResponse>({
			endpointPath: `/api/auth/signup`,
			requestMethod: "POST",
			bodyParams: {
				walletAddress: metamaskAddress,
				userPass: userPassword
			}
		})
		
		const {isSuccess, isError, code, data, error} = signupAPIResponse
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
			if (code === 400){
				if (requestStatus === "ERR_INVALID_PARAMS"){
					const {invalidParams} = data
					if (invalidParams && invalidParams.includes("walletAddress")){
						addToast(
							"An account already exists with that wallet",
							"Try logging in with that wallet and password",
							"danger"
						)
						return
					}
				}
			}
			if (code === 200){
				if (requestStatus === "SUCCESS"){
					const {userRole} = data
					authCtx?.updateAuthData({
						isAuthenticated: true,
						metamaskAddress: metamaskAddress,
						userRole: userRole
					})
				}
			}
		}
	}, [metamaskConnected, metamaskAddress, userPassword, confirmPassword])
	
	return (
		<>
			<EuiCenter
				height={"100vh"}
				width={"100vw"}
				growChildren={false}
			>
				<EuiPanel
					hasShadow={true}
					paddingSize={"xl"}
					style={{
						minWidth: 341,
						maxWidth: "60vw"
					}}
				>
					<EuiFlexGroup
						direction={"column"}
						justifyContent={"center"}
						alignItems={"center"}
						gutterSize={"xl"}
					>
						<EuiFlexItem>
							<Image
								src={VersuraIcon}
								alt={"Versura Icon"}
								placeholder={"blur"}
								height={40}
								width={291}
							/>
						</EuiFlexItem>
						<EuiFlexItem>
							<EuiForm
								component={"form"}
								style={{
									minWidth: "20vw"
								}}
								onSubmit={(e) => {
									e.preventDefault()
									attemptUserSignup()
								}}
							>
								<EuiFormRow
									label={"Metamask Authentication"}
								>
									{metamaskConnected ? (
										<EuiFieldText
											value={metamaskAddress}
											disabled
										/>
									) : (
										<EuiButton
											iconType={MetamaskFoxIconWrapped}
											color={"warning"}
											fullWidth
											onClick={authenticateWithMetamask}
										>
											Connect to Metamask
										</EuiButton>
									)}
								</EuiFormRow>
								<EuiFormRow
									label={"Password"}
								>
									<EuiFieldPassword
										type={"dual"}
										onChange={(e) => {
											setPasswordMismatch(false)
											setUserPassword(e.target.value)
										}}
										fullWidth
									/>
								</EuiFormRow>
								<EuiFormRow
									label={"Confirm Password"}
								>
									<EuiFieldPassword
										isInvalid={passwordMismatch}
										onChange={(e) => {
											setConfirmPassword(e.target.value)
											setPasswordMismatch(false)
										}}
										fullWidth
									/>
								</EuiFormRow>
								<EuiFormRow>
									<EuiButton
										fill fullWidth
										onClick={attemptUserSignup}
									>
										Sign Up
									</EuiButton>
								</EuiFormRow>
								<EuiFormRow>
									<Link href={"/auth/login"}>
										<EuiButton fullWidth>
											Log In Instead
										</EuiButton>
									</Link>
								</EuiFormRow>
							</EuiForm>
						</EuiFlexItem>
					</EuiFlexGroup>
				</EuiPanel>
			</EuiCenter>
			<EuiGlobalToastList
				toasts={toasts}
				dismissToast={dismissToast}
				toastLifeTimeMs={5000}
			/>
		</>
	)
}

export default SignupPage;