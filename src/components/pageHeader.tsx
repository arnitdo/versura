import {AuthContext} from "@/pages/_app";
import { AuthContextType } from "@/utils/types/componentTypedefs";
import {
	EuiHeader,
	EuiHeaderSection,
	EuiAvatar,
	EuiHeaderLinks,
	EuiHeaderLink,
    EuiHeaderSectionItemButton,
	useGeneratedHtmlId
} from "@elastic/eui"
import {useContext} from "react";
import Link from "next/link";
import Image from "next/image";

import VersuraIcon from "@/assets/versura-icon.png"
import {useRouter} from "next/router"
import {LINK_TEXT_COLOR_OVERRIDE} from "@/utils/common";

export default function PageHeader(): JSX.Element {
	const {isAuthenticated, metamaskAddress} = useContext<AuthContextType>(AuthContext)
	const {pathname} = useRouter()
	
	return (
		<EuiHeader
			style={{
				alignItems: "center"
			}}
		>
			<EuiHeaderSection
				side={"left"}
			>
				<EuiHeaderLinks
					popoverBreakpoints={"none"}
				>
					<EuiHeaderLink>
						<Link
							href={"/fundraisers"}
							style={{
								color: LINK_TEXT_COLOR_OVERRIDE
							}}
						>
							Explore
						</Link>
					</EuiHeaderLink>
					<EuiHeaderLink>
						<Link
							href={"/fundraisers/create"}
							style={{
								color: LINK_TEXT_COLOR_OVERRIDE
							}}
						>
							Create
						</Link>
					</EuiHeaderLink>
				</EuiHeaderLinks>
			</EuiHeaderSection>
			<EuiHeaderSection>
				<Link
					href={"/"}
					key={"header-link-home"}
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					<Image
						src={VersuraIcon}
						alt={"Versura Icon. Click to return to the home page"}
						height={24}
					/>
				</Link>
			</EuiHeaderSection>
			<EuiHeaderSection
				side={"right"}
				style={{
					alignItems: "center"
				}}
			>
				{isAuthenticated ? (
					<>
						<EuiHeaderLinks
							popoverBreakpoints={"none"}
						>
							<EuiHeaderLink>
								<Link
									href={`/auth/logout?returnTo=${pathname}`}
									style={{
										color: LINK_TEXT_COLOR_OVERRIDE
									}}
								>
									Log Out
								</Link>
							</EuiHeaderLink>
						</EuiHeaderLinks>
						<EuiAvatar
							name={metamaskAddress || ""}
							imageUrl={
								`//gravatar.com/avatar/${metamaskAddress?.slice(2) || ""}?d=retro&f=y`
							}
							color={"plain"}
							type={"space"}
						/>
					</>
				) : (
						<EuiHeaderLinks
							popoverBreakpoints={"none"}
						>
							<EuiHeaderLink>
								<Link
									href={`/auth/login?returnTo=${pathname}`}
									style={{
										color: LINK_TEXT_COLOR_OVERRIDE
									}}
								>
									Log In
								</Link>
							</EuiHeaderLink>
							<EuiHeaderLink>
								<Link
									href={`/auth/signup?returnTo=${pathname}`}
									style={{
										color: LINK_TEXT_COLOR_OVERRIDE
									}}
								>
									Sign Up
								</Link>
							</EuiHeaderLink>
						</EuiHeaderLinks>
				)}
			</EuiHeaderSection>
		</EuiHeader>
	)
}