/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "versura-media.s3.ap-south-1.amazonaws.com"
			}
		],
		dangerouslyAllowSVG: true
	}
}

module.exports = nextConfig
