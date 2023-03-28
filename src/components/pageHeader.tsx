import {AuthContext} from "@/pages/_app";
import { AuthContextType } from "@/utils/types/componentTypedefs";
import {
	EuiHeader,
	EuiHeaderSection,
	EuiAvatar,
	EuiHeaderLinks,
	EuiHeaderLink,
	EuiHeaderSectionItemButton,
	EuiPopover,
	EuiFlexGroup,
	EuiFlexItem,
	EuiText,
	useGeneratedHtmlId
} from "@elastic/eui"
import {useCallback, useContext, useState} from "react";
import Link from "next/link";
import Image from "next/image";

import VersuraIcon from "@/assets/versura-icon.png"


function PageHeader(): JSX.Element {
	const {isAuthenticated, metamaskAddress} = useContext<AuthContextType>(AuthContext)

	const profilePopoverId = useGeneratedHtmlId({
		prefix: "headerProfilePopover"
	})

	const [profilePopoverOpen, setProfilePopoverOpen] = useState<boolean>(false);

	return (
		<EuiHeader
			style={{
				alignItems: "center"
			}}
		>
			<EuiHeaderSection
				side={"left"}
			>
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
						<EuiHeaderLinks>
							<EuiHeaderLink>
								<Link
									href={"/auth/logout"}
									style={{
										color: "#DFE5EF"
									}}
								>
									Log Out
								</Link>
							</EuiHeaderLink>
						</EuiHeaderLinks>
						<EuiAvatar
							name={metamaskAddress || ""}
							imageUrl={
								`//gravatar.com/avatar/${metamaskAddress || ""}?d=retro&f=y`
							}
							color={"plain"}
							type={"space"}
						/>
					</>
				) : (
						<EuiHeaderLinks>
							<EuiHeaderLink>
								<Link
									href={"/auth/login"}
									style={{
										color: "#DFE5EF"
									}}
								>
									Log In
								</Link>
							</EuiHeaderLink>
							<EuiHeaderLink>
								<Link
									href={"/auth/signup"}
									style={{
										color: "#DFE5EF"
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

export {
	PageHeader
}

