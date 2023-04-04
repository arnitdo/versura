import {PageHeaderControlComponentProps} from "@/utils/types/componentTypedefs";
import {EuiButton, EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiText} from "@elastic/eui";
import { useEffect } from "react";
import CustomCenter from "@/components/customCenter";
import Link from "next/link"


export default function NotFoundPage({setShowPageHeader}: PageHeaderControlComponentProps){
	useEffect(() => {
		setShowPageHeader(false)

		return () => {
			setShowPageHeader(true)
		}
	}, [])
	
	return (
		<EuiPageTemplate
			panelled={true}
			bottomBorder={"extended"}
		>
			<CustomCenter>
				<EuiFlexGroup
					direction={"column"}
					justifyContent={"center"}
					alignItems={"center"}
				>
					<EuiFlexItem>
						<EuiText color={"danger"}>
							<h1>404 Not Found</h1>
						</EuiText>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiText>
							<h2>We could not find the page you were looking for</h2>
						</EuiText>
					</EuiFlexItem>
					<EuiFlexItem>
						<Link
							href={"/"}
						>
							<EuiButton
								color={"ghost"}
							>
								Take me to the Home Page
							</EuiButton>
						</Link>
					</EuiFlexItem>
				</EuiFlexGroup>
			</CustomCenter>
		</EuiPageTemplate>
	)
}