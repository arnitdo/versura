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

import VersuraIcon from "@/assets/versura-icon.png";
import MetamaskFoxIcon from "@/assets/metamask-fox.svg"

import {useToastList} from "@/utils/toastUtils";
import {AuthContext, AuthContextType} from "@/pages/_app"

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
	const authCtx = useContext<AuthContextType | undefined>(AuthContext)
	
	const [
		[metamaskConnected, metamaskAddress],
		setMetamaskInfo
	] = useState<[boolean, string]>([false, ""])
	
	const toastCountRef = useRef<number>(0)
	
	const {toasts, addToast, dismissToast} = useToastList({
		toastIdFactoryFn: (toastType) => {
			return `signup-page-${toastCountRef.current}`
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
			toastCountRef.current += 1
			return
		}
		// @ts-ignore
		if (!window.ethereum.isMetaMask){
			addToast(
				"Non-MetaMask wallet detected",
				"We only support Metamask wallets as of now",
				"danger"
			)
			toastCountRef.current += 1
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
			toastCountRef.current += 1
			return
		}
	}, [])
	
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
										fullWidth
									/>
								</EuiFormRow>
								<EuiFormRow
									label={"Confirm Password"}
								>
									<EuiFieldPassword
										fullWidth
									/>
								</EuiFormRow>
								<EuiFormRow>
									<EuiButton fill fullWidth>
										Sign Up
									</EuiButton>
								</EuiFormRow>
								<EuiFormRow>
									<EuiButton fullWidth>
										Log In Instead
									</EuiButton>
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