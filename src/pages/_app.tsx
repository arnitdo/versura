import {EuiProvider} from '@elastic/eui';
import {createContext, useState} from "react";

import type {AppProps} from 'next/app'

import '@elastic/eui/dist/eui_theme_dark.css'
import {UserRole} from "@/utils/types/queryTypedefs";

type AuthData = {
	isAuthenticated: boolean,
	metamaskAddress?: string
	userRole?: UserRole
}

export type AuthContextType = AuthData & {
	updateAuthData: (newAuthData: AuthData) => void
}

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
		updateAuthData: setAuthData
	}
	
	return (
		<>
			<EuiProvider colorMode={"dark"}>
				<AuthContext.Provider value={authContextValue}>
					<Component {...pageProps} />
				</AuthContext.Provider>
			</EuiProvider>
		</>
	)
}

export {
	AuthContext,
}