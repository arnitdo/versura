import React from "react";
import EuiCenter from '@/components/customCenter'
import {EuiText, EuiButton, EuiPanel, EuiFlexGroup} from "@elastic/eui";
function LoginPage(): JSX.Element {
	return (
		<EuiCenter
			height={"100vh"}
			width={"100vw"}
			growChildren={false}
		>
			<EuiFlexGroup
				direction={"column"}
			>
				<EuiPanel
					hasShadow={true}
				>
				
				</EuiPanel>
			</EuiFlexGroup>
		</EuiCenter>
	)
}

export default LoginPage;