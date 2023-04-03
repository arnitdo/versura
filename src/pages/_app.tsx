import {EuiProvider} from '@elastic/eui';
import {createContext, useState} from "react";

import type {AppProps} from 'next/app'

import '@elastic/eui/dist/eui_theme_dark.css'
import {PageHeader} from "@/components/pageHeader";
import {AuthContextType, AuthData} from "@/utils/types/componentTypedefs";


const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	metamaskAddress: undefined,
	userRole: undefined,
	updateAuthData: (newAuth) => {
		throw new Error(
			"Attempted to update authentication context before initialization of main application!"
		)
	}
})

export default function App({Component, pageProps}: AppProps) {
	const [authData, setAuthData] = useState<AuthData>({
		isAuthenticated: false,
		metamaskAddress: undefined,
		userRole: undefined
	})
	
	const authContextValue: AuthContextType = {
		...authData,
		updateAuthData: (autD) => {
			setAuthData(autD)
		}
	}
	
	const [showPageHeader, setShowPageHeader] = useState<boolean>(true);
	
	return (
		<>
			<EuiProvider colorMode={"dark"}>
				<AuthContext.Provider value={authContextValue}>
					{showPageHeader ? (
						<PageHeader />
					) : null}
					<Component
						{...pageProps}
						setShowPageHeader={setShowPageHeader}
					/>
				</AuthContext.Provider>
			</EuiProvider>
		</>
	)
}

export {
	AuthContext,
}