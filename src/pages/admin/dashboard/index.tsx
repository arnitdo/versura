/*
* Sample dashboard data
* Use this data to create a mock dashboard UI
* Page component *must* accept the following data as props
* */

import {FundRaisers, FundraiserWithdrawalRequests} from "@/utils/types/queryTypedefs";
import {GetServerSideProps, GetServerSidePropsContext} from "next";

type AdminDashboardProps = {
	fundraiserApprovalPage: number, // Paginated
	withdrawalApprovalPage: number, // Paginated
	totalPendingFundraiserCount: number, // NON-Paginated, total number of pending fundraisers
	totalPendingWithdrawalCount: number, // Same as above
	pendingFundraisers: FundRaisers[] // Array of pending fundraiser data
	pendingWithdrawals: FundraiserWithdrawalRequests[],
	
	// ADDITIONAL STATS DATA FOR DASHBOARD VISUALISATION
	totalFundraiserCount: number // Count of all fundraisers, pending, open or closed
	totalWithdrawalAmount: number // Total amount withdrawn (APPROVED)
	totalContributedAmount: number // Total amount contributed by users
	totalUniqueContributors: number // No of unique contributors
	totalSuccessfulCampaigns: number // Count of campaigns where amount collected exceeded target,
	totalUserCount: number // Number of users signed up
	totalMilestoneCount: number // of milestones,
	reachedMilestoneCount: number // No of milestones reached,
	totalUpdateCount: number // Number of updates posted by founders
}

const SAMPLE_DASHBOARD_DATA: AdminDashboardProps = {
	fundraiserApprovalPage: 1,
	withdrawalApprovalPage: 1,
	totalPendingFundraiserCount: 4,
	totalPendingWithdrawalCount: 3,
	pendingFundraisers: [
		{
			"fundraiserId": 2,
			"fundraiserCreator": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"fundraiserTitle": "Communitty - An open source social media app",
			"fundraiserDescription": "sagittis nisl rhoncus mattis rhoncus urna neque viverra justo nec ultrices dui sapien eget mi proin sed libero enim sed faucibus turpis in eu mi bibendum neque egestas congue quisque egestas diam in arcu cursus euismod quis viverra nibh cras pulvinar mattis nunc sed blandit libero volutpat sed cras ornare arcu dui vivamus arcu felis bibendum ut tristique et egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque dignissim enim sit amet venenatis urna cursus eget nunc scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt augue interdum velit euismod in pellentesque massa placerat duis",
			"fundraiserTarget": 1,
			"fundraiserToken": "ETH",
			"fundraiserMinDonationAmount": 0.05,
			"fundraiserRaisedAmount": 0,
			"fundraiserContributorCount": 0,
			"fundraiserMilestoneCount": 0,
			"fundraiserCreatedOn": "2023-04-08 08:39:40.341301 +00:00",
			"fundraiserMediaObjectKeys": ["fundraisers/2/media/1", "fundraisers/2/media/2"],
			"fundraiserStatus": "IN_QUEUE",
			"fundraiserWithdrawnAmount": 0
		},
		{
			"fundraiserId": 3,
			"fundraiserCreator": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"fundraiserTitle": "Compute Blade: Your rack-mountable ARM cluster",
			"fundraiserDescription": "- Raspberry Pi CM4 support - NVMe SSD up to 22110 (2230, 2242, 2260, 2280 supported) - Gigabit Ethernet - Power over Ethernet IEEE 802.3at (PoE+) up to 30W (normal operation 2-8W) - Raspberry Pi CM4 by PoE 5.1V power supply, which has improved stability under overclocking. - USB-A for a flash drive for copying data during setup with UART or YubiKey keys during operation. - MicroSD card port - UART0 on the front (TX, RX, GND) - Additional UART0 with 5v in (or out) next to module port - Two digital RGB LEDs - Hardware switchable WiFi, BT, and EEPROM write-protection - Activity, Power, and SSD LEDs - HDMI port for connecting a monitor (up to 4k60) - USB-C port and PRIBOOT button to flash the bootloader, access to eMMC/SD card, or tests. - TPM 2.0 onboard - PWM fan connector for the custom backplane (Fan Units), supports UART communication. - Switchable USB input (USB-A or USB-C) - Programmable button on the front panel - IEEE 802.3at detection (on Raspberry Pi with GPIO pin and additional LED on the blade). - Toggleable front LEDs that can be turned off",
			"fundraiserTarget": 3,
			"fundraiserToken": "ETH",
			"fundraiserMinDonationAmount": 0.1,
			"fundraiserRaisedAmount": 0,
			"fundraiserContributorCount": 0,
			"fundraiserMilestoneCount": 0,
			"fundraiserCreatedOn": "2023-04-09 10:56:48.144048 +00:00",
			"fundraiserMediaObjectKeys": ["fundraisers/3/media/1"],
			"fundraiserStatus": "IN_QUEUE",
			"fundraiserWithdrawnAmount": 0
		},
		{
			"fundraiserId": 6,
			"fundraiserCreator": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"fundraiserTitle": "Spiral: Bernard's Journey",
			"fundraiserDescription": "Creating a video game is a challenging task; there’s nothing new here, even more so for a new studio. But we are well aware of that, and we’ve been at it for a while. For us, the question is not if the game is going to be released but when.\n\nAs we mentioned before, we’ve been working without external support so far, and it does make development slower, but it never dented our will to see it through to the end. \n\nWe’ve established our release date to the best of our knowledge with maybe a touch of optimism, and there lies the main risk. If something comes up that requires us to delay the game so it can be all we want it to be, then we will.  But we will do everything in our power to keep it on track; we want you to play Spiral as much as you want to try it (probably even more)!",
			"fundraiserTarget": 10,
			"fundraiserToken": "ETH",
			"fundraiserMinDonationAmount": 0.25,
			"fundraiserRaisedAmount": 0,
			"fundraiserContributorCount": 0,
			"fundraiserMilestoneCount": 0,
			"fundraiserCreatedOn": "2023-04-09 11:56:07.097310 +00:00",
			"fundraiserMediaObjectKeys": ["fundraisers/6/media/1"],
			"fundraiserStatus": "IN_QUEUE",
			"fundraiserWithdrawnAmount": 0
		},
		{
			"fundraiserId": 5,
			"fundraiserCreator": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"fundraiserTitle": "Petoi Robot Dog Bittle ",
			"fundraiserDescription": "Petoi Bittle is a tiny but powerful robot that can play tricks like real animals. We fine-tuned every bit to fit agile maneuverability into a palm-sized robot pet. You can bring Bittle to life by assembling its puzzle-like frame and downloading our demo codes on GitHub. You can also teach it new skills to win prizes in our community challenges. Bittle makes a perfect tool for learning, teaching, researching, or a surprising gift to impress your family and friends. Bittle is not a toy for small kids. We recommend parental guidance to appreciate its rich content and avoid damage or injury.",
			"fundraiserTarget": 2,
			"fundraiserToken": "ETH",
			"fundraiserMinDonationAmount": 0.2,
			"fundraiserRaisedAmount": 0,
			"fundraiserContributorCount": 0,
			"fundraiserMilestoneCount": 0,
			"fundraiserCreatedOn": "2023-04-09 11:49:26.512112 +00:00",
			"fundraiserMediaObjectKeys": ["fundraisers/5/media/1"],
			"fundraiserStatus": "IN_QUEUE",
			"fundraiserWithdrawnAmount": 0
		}
	],
	pendingWithdrawals: [
		{
			"requestId": 12,
			"walletAddress": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"targetFundraiser": 1,
			"withdrawalAmount": 0.5,
			"withdrawalToken": "ETH",
			"requestStatus": "OPEN"
		},
		{
			"requestId": 13,
			"walletAddress": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"targetFundraiser": 1,
			"withdrawalAmount": 0.2,
			"withdrawalToken": "ETH",
			"requestStatus": "OPEN"
		},
		{
			"requestId": 14,
			"walletAddress": "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			"targetFundraiser": 1,
			"withdrawalAmount": 0.4,
			"withdrawalToken": "ETH",
			"requestStatus": "OPEN"
		}
	],
	totalFundraiserCount: 7,
	totalWithdrawalAmount: 4,
	totalMilestoneCount: 1,
	totalSuccessfulCampaigns: 0,
	reachedMilestoneCount: 0,
	totalContributedAmount: 6.4,
	totalUniqueContributors: 3,
	totalUpdateCount: 0,
	totalUserCount: 9
}

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
	return {
		props: SAMPLE_DASHBOARD_DATA
	}
}

export default function AdminDashboard(props: AdminDashboardProps){
	console.table(props)
	
	// Add UI Code Here
	
	return (
		<></>
	)
}
