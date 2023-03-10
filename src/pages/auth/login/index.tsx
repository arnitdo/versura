import React from "react";
import EuiCenter from '@/components/customCenter'
import {EuiText, EuiButton, EuiFlexGroup} from "@elastic/eui";
function LoginPage(): JSX.Element {
	return (
		<EuiCenter
			height={"100vh"}
			width={"100vw"}
		>
			<EuiFlexGroup
				direction={"column"}
			>
				<EuiButton>Test 1</EuiButton>
				<EuiButton>Test 2</EuiButton>
			</EuiFlexGroup>
		</EuiCenter>
	)
}

export default LoginPage;