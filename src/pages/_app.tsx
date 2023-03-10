import {EuiProvider} from '@elastic/eui';

import type {AppProps} from 'next/app'

import '@elastic/eui/dist/eui_theme_dark.css'

export default function App({Component, pageProps}: AppProps) {
	return (
		<>
			<EuiProvider colorMode={"dark"}>
				<Component {...pageProps} />
			</EuiProvider>
		</>
	)
}
