import React, {useCallback, useContext, useEffect, useState} from "react";
import EuiCenter from '@/components/customCenter'
import {useRouter} from "next/router"
import Image from 'next/image'
import {EuiButton, EuiFlexGroup, EuiFlexItem, EuiGlobalToastList, EuiLoadingSpinner, EuiPanel} from "@elastic/eui";

import VersuraIcon from "@/assets/versura-icon.png";
import {useToastList} from "@/utils/toastUtils";
import {AuthContext} from "@/pages/_app"
import {makeAPIRequest} from "@/utils/apiHandler";
import Link from "next/link";
import {AuthContextType, PageHeaderControlComponentProps} from "@/utils/types/componentTypedefs";
import {LogoutUserRequestBody} from "@/utils/types/apiRequests";
import {LogoutResponse} from "@/utils/types/apiResponses";

function LogoutPage(props: PageHeaderControlComponentProps): JSX.Element {
	const authCtx = useContext<AuthContextType>(AuthContext)
	
	useEffect(() => {
		props.setShowPageHeader(false)
		
		return () => {
			props.setShowPageHeader(true)
		}
	}, [])
	
	const {toasts, addToast, dismissToast} = useToastList({
		toastIdFactoryFn: (toastCount, toastType) => {
			return `logout-page-${toastCount}`
		}
	})
	
	const [logoutHandlerActive, setLogoutHandlerActive] = useState<boolean>(false);
	
	const navRouter = useRouter()
	const {query} = navRouter
	const {returnTo} = query
	const LOGOUT_REDIRECT_TIMER_S = 5;
	
	const returnToPreviousPage = useCallback(() => {
		navRouter.back()
	}, [navRouter])
	
	const attemptUserLogout = useCallback(async () => {
		setLogoutHandlerActive(true)
		const {isSuccess, isError, code, data, error} = await makeAPIRequest<LogoutResponse, LogoutUserRequestBody>({
			endpointPath: `/api/auth/logout`,
			requestMethod: "POST"
		})
		
		if (isError && error) {
			addToast(
				"An error occurred when processing your request",
				(error as Error).message || "",
				"danger"
			)
			return
		}
		
		if (isSuccess && data) {
			const {requestStatus} = data
			if (code === 500 && requestStatus === "ERR_INTERNAL_ERROR") {
				addToast(
					"An error occurred when processing your request",
					"An internal error occurred",
					"danger"
				)
				setLogoutHandlerActive(false)
				return
			}
			if (code === 403 && requestStatus === "ERR_AUTH_REQUIRED") {
				addToast(
					"You are not authenticated yet",
					"Log in before attempting to log out of an account",
					"danger"
				)
				setLogoutHandlerActive(false)
				return
			}
			if (code === 200 && requestStatus === "SUCCESS") {
				addToast(
					"You have been logged out successfully",
					`You will be redirected in ${LOGOUT_REDIRECT_TIMER_S} seconds`,
					"success"
				)
				authCtx.updateAuthData({
					isAuthenticated: false,
					metamaskAddress: undefined,
					userRole: undefined
				})
				setLogoutHandlerActive(false)
				await navRouter.prefetch(returnTo as string || '/')
				setTimeout(() => {
					navRouter.push(returnTo as string || '/')
				}, LOGOUT_REDIRECT_TIMER_S * 1000)
				return
			}
		}
	}, [navRouter])
	
	
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
						<EuiFlexItem>
							<h2
								style={{
									fontStyle: "revert"
								}}
							>
								Are you sure you want to log out of Versura?
							</h2>
						</EuiFlexItem>
						<EuiFlexItem>
							<EuiFlexGroup>
								<EuiFlexItem>
									<EuiButton
										color={"primary"}
										fill
										onClick={attemptUserLogout}
										disabled={logoutHandlerActive}
									>
										{
											logoutHandlerActive ? (
												<EuiLoadingSpinner/>
											) : (
												'Yes, Log me out'
											)
										}
									</EuiButton>
								</EuiFlexItem>
								<EuiFlexItem>
									<EuiButton
										color={"danger"}
										fill
										onClick={returnToPreviousPage}
										disabled={logoutHandlerActive}
									>
										No, take me back
									</EuiButton>
								</EuiFlexItem>
							</EuiFlexGroup>
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

export default LogoutPage;