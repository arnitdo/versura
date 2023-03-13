import Head from 'next/head'
import {useEffect} from "react";

export default function IndexPage() {
	return (
		<>
			<Head>
				<title>Versura</title>
				<meta name="description" content="Versura, a blockchain based crowdfunding platform"/>
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
				<link rel="icon" href="/public/favicon.ico"/>
			</Head>
			Hello
		</>
	)
}
