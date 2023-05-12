/*
 * Sample dashboard data
 * Use this data to create a mock dashboard UI
 * Page component *must* accept the following data as props
 * */
import {
	EuiAvatar,
	EuiButton,
	EuiCard,
	EuiFlexGroup,
	EuiFlexItem,
	EuiIcon,
	EuiPageBody,
	EuiPanel,
	EuiTab,
	EuiTabs,
	EuiText,
} from "@elastic/eui";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useState } from "react";
import Head from "next/head";
import {
	AdminDashboardData,
	AdminGetDashboardResponse,
	AdminGetFundraisersResponse,
	AdminGetWithdrawalResponse,
} from "@/types/apiResponses";
import { makeAPIRequest } from "@/utils/apiHandler";
import { AdminGetFundraisersParams, AdminGetWithdrawalsParams } from "@/types/apiRequests";
import { NON_ZERO_NON_NEGATIVE, STRING_TO_NUM_FN } from "@/utils/validatorUtils";

type AdminDashboardProps = {
	fundraiserPage: number; // Paginated
	withdrawalPage: number; // Paginated
	pendingFundraisers: AdminGetFundraisersResponse["pendingFundraisers"]; // Array of pending fundraiser data
	pendingWithdrawals: AdminGetWithdrawalResponse["pendingWithdrawals"];
	dashboardData: AdminDashboardData;
};

const SAMPLE_DASHBOARD_DATA: AdminDashboardProps = {
	fundraiserPage: 1,
	withdrawalPage: 1,
	pendingFundraisers: [
		{
			fundraiserId: 2,
			fundraiserCreator: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			fundraiserTitle: "Communitty - An open source social media app",
			fundraiserDescription:
				"sagittis nisl rhoncus mattis rhoncus urna neque viverra justo nec ultrices dui sapien eget mi proin sed libero enim sed faucibus turpis in eu mi bibendum neque egestas congue quisque egestas diam in arcu cursus euismod quis viverra nibh cras pulvinar mattis nunc sed blandit libero volutpat sed cras ornare arcu dui vivamus arcu felis bibendum ut tristique et egestas quis ipsum suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque dignissim enim sit amet venenatis urna cursus eget nunc scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt augue interdum velit euismod in pellentesque massa placerat duis",
			fundraiserTarget: 1,
			fundraiserToken: "ETH",
			fundraiserMinDonationAmount: 0.05,
			fundraiserRaisedAmount: 0,
			fundraiserContributorCount: 0,
			fundraiserMilestoneCount: 0,
			fundraiserCreatedOn: "2023-04-08 08:39:40.341301 +00:00",
			fundraiserMedia: [
				{
					mediaContentType: "image/png",
					mediaURL: "",
				},
			],
			fundraiserStatus: "IN_QUEUE",
			fundraiserWithdrawnAmount: 0,
		},
		{
			fundraiserId: 3,
			fundraiserCreator: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			fundraiserTitle: "Compute Blade: Your rack-mountable ARM cluster",
			fundraiserDescription:
				"- Raspberry Pi CM4 support - NVMe SSD up to 22110 (2230, 2242, 2260, 2280 supported) - Gigabit Ethernet - Power over Ethernet IEEE 802.3at (PoE+) up to 30W (normal operation 2-8W) - Raspberry Pi CM4 by PoE 5.1V power supply, which has improved stability under overclocking. - USB-A for a flash drive for copying data during setup with UART or YubiKey keys during operation. - MicroSD card port - UART0 on the front (TX, RX, GND) - Additional UART0 with 5v in (or out) next to module port - Two digital RGB LEDs - Hardware switchable WiFi, BT, and EEPROM write-protection - Activity, Power, and SSD LEDs - HDMI port for connecting a monitor (up to 4k60) - USB-C port and PRIBOOT button to flash the bootloader, access to eMMC/SD card, or tests. - TPM 2.0 onboard - PWM fan connector for the custom backplane (Fan Units), supports UART communication. - Switchable USB input (USB-A or USB-C) - Programmable button on the front panel - IEEE 802.3at detection (on Raspberry Pi with GPIO pin and additional LED on the blade). - Toggleable front LEDs that can be turned off",
			fundraiserTarget: 3,
			fundraiserToken: "ETH",
			fundraiserMinDonationAmount: 0.1,
			fundraiserRaisedAmount: 0,
			fundraiserContributorCount: 0,
			fundraiserMilestoneCount: 0,
			fundraiserCreatedOn: "2023-04-09 10:56:48.144048 +00:00",
			fundraiserMedia: [
				{
					mediaContentType: "image/png",
					mediaURL: "",
				},
			],
			fundraiserStatus: "IN_QUEUE",
			fundraiserWithdrawnAmount: 0,
		},
		{
			fundraiserId: 6,
			fundraiserCreator: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			fundraiserTitle: "Spiral: Bernard's Journey",
			fundraiserDescription:
				"Creating a video game is a challenging task; there’s nothing new here, even more so for a new studio. But we are well aware of that, and we’ve been at it for a while. For us, the question is not if the game is going to be released but when.\n\nAs we mentioned before, we’ve been working without external support so far, and it does make development slower, but it never dented our will to see it through to the end. \n\nWe’ve established our release date to the best of our knowledge with maybe a touch of optimism, and there lies the main risk. If something comes up that requires us to delay the game so it can be all we want it to be, then we will.  But we will do everything in our power to keep it on track; we want you to play Spiral as much as you want to try it (probably even more)!",
			fundraiserTarget: 10,
			fundraiserToken: "ETH",
			fundraiserMinDonationAmount: 0.25,
			fundraiserRaisedAmount: 0,
			fundraiserContributorCount: 0,
			fundraiserMilestoneCount: 0,
			fundraiserCreatedOn: "2023-04-09 11:56:07.097310 +00:00",
			fundraiserMedia: [
				{
					mediaContentType: "image/png",
					mediaURL: "",
				},
			],
			fundraiserStatus: "IN_QUEUE",
			fundraiserWithdrawnAmount: 0,
		},
		{
			fundraiserId: 5,
			fundraiserCreator: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			fundraiserTitle: "Petoi Robot Dog Bittle ",
			fundraiserDescription:
				"Petoi Bittle is a tiny but powerful robot that can play tricks like real animals. We fine-tuned every bit to fit agile maneuverability into a palm-sized robot pet. You can bring Bittle to life by assembling its puzzle-like frame and downloading our demo codes on GitHub. You can also teach it new skills to win prizes in our community challenges. Bittle makes a perfect tool for learning, teaching, researching, or a surprising gift to impress your family and friends. Bittle is not a toy for small kids. We recommend parental guidance to appreciate its rich content and avoid damage or injury.",
			fundraiserTarget: 2,
			fundraiserToken: "ETH",
			fundraiserMinDonationAmount: 0.2,
			fundraiserRaisedAmount: 0,
			fundraiserContributorCount: 0,
			fundraiserMilestoneCount: 0,
			fundraiserCreatedOn: "2023-04-09 11:49:26.512112 +00:00",
			fundraiserMedia: [
				{
					mediaContentType: "image/png",
					mediaURL: "",
				},
			],
			fundraiserStatus: "IN_QUEUE",
			fundraiserWithdrawnAmount: 0,
		},
	],
	pendingWithdrawals: [
		{
			requestId: 12,
			walletAddress: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			targetFundraiser: {
				fundraiserId: 1,
				fundraiserTitle: "SAMPLE FUNDRAISER 1",
			},
			withdrawalAmount: 0.5,
			withdrawalToken: "ETH",
			withdrawalStatus: "OPEN",
		},
		{
			requestId: 13,
			walletAddress: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			targetFundraiser: {
				fundraiserId: 2,
				fundraiserTitle: "SAMPLE FUNDRAISER 2",
			},
			withdrawalAmount: 0.2,
			withdrawalToken: "ETH",
			withdrawalStatus: "OPEN",
		},
		{
			requestId: 14,
			walletAddress: "0x33ead98324df1c2d3d6aee4533ad36a5fa2e9502",
			targetFundraiser: {
				fundraiserId: 3,
				fundraiserTitle: "SAMPLE FUNDRAISER 3",
			},
			withdrawalAmount: 0.4,
			withdrawalToken: "ETH",
			withdrawalStatus: "OPEN",
		},
	],
	dashboardData: {
		totalPendingFundraiserCount: 4,
		totalPendingWithdrawalCount: 3,
		totalFundraiserCount: 7,
		totalWithdrawalAmount: 4,
		totalMilestoneCount: 1,
		totalSuccessfulCampaigns: 0,
		reachedMilestoneCount: 0,
		totalDonatedAmount: 6.4,
		totalUniqueDonors: 3,
		totalUpdateCount: 0,
		totalUserCount: 9,
	},
};

export const getServerSideProps: GetServerSideProps<
	AdminDashboardProps
	// @ts-ignore
> = async (ctx: GetServerSidePropsContext<AdminGetFundraisersParams & AdminGetWithdrawalsParams>) => {
	const withdrawalPage = (ctx.query.withdrawalPage as string) || "1";
	const fundraiserPage = (ctx.query.fundraiserPage as string) || "1";

	const validWithdrawalPage = await STRING_TO_NUM_FN(NON_ZERO_NON_NEGATIVE)(withdrawalPage);
	const validFundraiserPage = await STRING_TO_NUM_FN(NON_ZERO_NON_NEGATIVE)(fundraiserPage);

	if (!validWithdrawalPage || !validFundraiserPage) {
		console.log(withdrawalPage, fundraiserPage);
		return {
			redirect: {
				destination: "/404",
			},
		};
	}

	const parsedFundraiserPage = Number.parseInt(fundraiserPage);
	const parsedWithdrawalPage = Number.parseInt(withdrawalPage);

	const requestStatuses: boolean[] = [];
	const requestErrors: any[] = [];

	const dashboardResponse = await makeAPIRequest<AdminGetDashboardResponse>({
		endpointPath: `/api/admin/dashboard`,
		requestMethod: "GET",
		// @ts-ignore
		ssrContext: ctx,
	});

	const {
		isSuccess: isDashboardSuccess,
		isError: isDashboardError,
		error: dashboardError,
		data: dashboardResponseData,
		code: dashboardResponseCode,
	} = dashboardResponse;

	requestStatuses.push(isDashboardSuccess);
	requestErrors.push(dashboardError);

	const withdrawalResponse = await makeAPIRequest<AdminGetWithdrawalResponse, {}, AdminGetWithdrawalsParams>({
		endpointPath: `/api/admin/withdrawals`,
		requestMethod: "GET",
		queryParams: {
			withdrawalPage: withdrawalPage,
		},
		// @ts-ignore
		ssrContext: ctx,
	});

	const {
		isSuccess: isWithdrawalSuccess,
		isError: isWithdrawalError,
		code: withdrawalResponseCode,
		error: withdrawalError,
		data: withdrawalResponseData,
	} = withdrawalResponse;

	requestStatuses.push(isWithdrawalSuccess);
	requestErrors.push(withdrawalError);

	const fundraiserResponse = await makeAPIRequest<AdminGetFundraisersResponse, {}, AdminGetFundraisersParams>({
		endpointPath: `/api/admin/fundraisers`,
		requestMethod: "GET",
		queryParams: {
			fundraiserPage: fundraiserPage,
		},
		// @ts-ignore
		ssrContext: ctx,
	});

	const {
		isSuccess: isFundraiserSuccess,
		isError: isFundraiserError,
		code: fundraiserResponseCode,
		error: fundraiserError,
		data: fundraiserResponseData,
	} = fundraiserResponse;

	requestStatuses.push(isFundraiserSuccess);
	requestErrors.push(fundraiserError);

	const adminRequestStatusAcc = requestStatuses.reduce((prev, curr) => {
		return prev && curr;
	}, true);

	if (!adminRequestStatusAcc) {
		requestErrors.forEach((err) => {
			err && console.error(err);
		});
		return {
			redirect: {
				destination: "/500",
			},
		};
	}

	const requestDataAcc = [dashboardResponseData!, fundraiserResponseData!, withdrawalResponseData!];

	const dataRequestsSuccess = requestDataAcc.map((responseData) => {
		const { requestStatus } = responseData;
		return requestStatus === "SUCCESS";
	});

	if (!dataRequestsSuccess) {
		return {
			redirect: "/500",
		};
	}

	const { pendingFundraisers } = fundraiserResponseData!;
	const { pendingWithdrawals } = withdrawalResponseData!;
	const { dashboardData } = dashboardResponseData!;

	return {
		props: {
			dashboardData,
			pendingWithdrawals,
			pendingFundraisers,
			fundraiserPage: parsedFundraiserPage,
			withdrawalPage: parsedWithdrawalPage,
		},
	};
};

export default function AdminDashboard(props: AdminDashboardProps) {
	//console.table(props);

	const { dashboardData, fundraiserPage, withdrawalPage, pendingWithdrawals, pendingFundraisers } = props;
	console.log(props);
	const [selectedTabId, setSelectedTabId] = useState("tab1");

	const onTabClick = (tabId: string) => {
		setSelectedTabId(tabId);
	};
	// Add UI Code Here

	return (
		<>
			<Head>
				<title>Admin</title>
				<meta name="description" content="Admin Page" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<EuiPageBody style={{ marginTop: "20px", padding: "20px" }}>
				<EuiFlexGroup>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#5299E0" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalFundraiserCount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Fundraisers Count</p>}
							icon={<EuiIcon type="tableDensityExpanded" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#c77171" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalWithdrawalAmount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Withdrawals Amount</p>}
							icon={<EuiIcon type="indexEdit" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#D5A439" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalDonatedAmount} ETH</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Donated Amount</p>}
							icon={<EuiIcon type="flag" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#857CDC" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalUserCount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Users Count</p>}
							icon={<EuiIcon type="users" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#5299E0" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalSuccessfulCampaigns}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Successful Campaigns</p>}
							icon={<EuiIcon type="checkInCircleFilled" size="xxl" />}
						/>
					</EuiFlexItem>
				</EuiFlexGroup>
				<br />
				<EuiFlexGroup>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#6b8e23" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalPendingFundraiserCount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Pending Fundraisers Count</p>}
							icon={<EuiIcon type="clock" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#4b0082" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalPendingWithdrawalCount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Pending Withdrawal Count</p>}
							icon={<EuiIcon type="percent" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#008080" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.reachedMilestoneCount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Reached Milestones Count</p>}
							icon={<EuiIcon type="flag" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#556b2f" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalUniqueDonors}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Unique Donors</p>}
							icon={<EuiIcon type="user" size="xxl" />}
						/>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiCard
							style={{ backgroundColor: "#a52a2a" }}
							title={<h1 style={{ fontWeight: "bold" }}>{dashboardData.totalUpdateCount}</h1>}
							description={<p style={{ fontSize: "20px" }}>Total Update Count</p>}
							icon={<EuiIcon type="pencil" size="xxl" />}
						/>
					</EuiFlexItem>
				</EuiFlexGroup>

				<EuiTabs style={{ marginTop: "20px", width: "auto", justifyContent: "center" }} expand={true}>
					<EuiTab onClick={() => onTabClick("tab1")} isSelected={selectedTabId === "tab1"}>
						Fundraisers
					</EuiTab>
					<EuiTab onClick={() => onTabClick("tab2")} isSelected={selectedTabId === "tab2"}>
						Donators
					</EuiTab>
				</EuiTabs>

				{selectedTabId === "tab1" && (
					<EuiPanel style={{ width: "80%", marginLeft: "auto", marginRight: "auto" }}>
						<EuiFlexGroup style={{ paddingBottom: "20px" }}>
							<EuiFlexItem>
								<img
									src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAjlfRoYiqHZ-jyvu-ZAfUTn0yY3CClEybXg&usqp=CAU"
									alt="Banner Image"
									width={260}
									height={-1}
									style={{
										borderRadius: 12,
										maxHeight: 150,
									}}
								/>
							</EuiFlexItem>
							<EuiFlexItem>
								<EuiFlexGroup direction={"column"}>
									<EuiFlexItem>
										<EuiText color={"white"} style={{ marginTop: "20px" }}>
											<h3>The Fujoshi Guide to Web Development</h3>
										</EuiText>
									</EuiFlexItem>
									<EuiFlexItem>
										<EuiText color={"white"}>
											<EuiFlexGroup>
												<EuiFlexItem grow={0}>
													<EuiAvatar
														name={"Fujoshi"}
														color={"plain"}
														type={"space"}
														imageUrl={`https://raw.github.com/hashdog/node-identicon-github/master/examples/images/github.png`}
													/>
												</EuiFlexItem>
												<EuiFlexItem grow={0}>
													0xddd74f832b99a5998f5670417b3cc8e87223cc58
												</EuiFlexItem>
											</EuiFlexGroup>
										</EuiText>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiFlexItem>
							<EuiFlexItem style={{ paddingLeft: "20px" }}>
								<EuiFlexGroup style={{ marginTop: "50px" }}>
									<EuiFlexItem>
										<EuiButton
											fill
											style={{ backgroundColor: "green" }}
											iconType="check"
											iconSide="left"
										>
											Approve
										</EuiButton>
									</EuiFlexItem>
									<EuiFlexItem>
										<EuiButton fill color="danger" iconType="cross" iconSide="left">
											Reject
										</EuiButton>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiFlexItem>
						</EuiFlexGroup>
					</EuiPanel>
				)}
				{selectedTabId === "tab2" && (
					<EuiPanel style={{ width: "80%", marginLeft: "auto", marginRight: "auto" }}>
						<EuiFlexGroup style={{ paddingBottom: "20px" }}>
							<EuiFlexItem>
								<img
									src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkVLSIS9IjgnfhNGIlMFSFxvdXdfpinC9HcQ&usqp=CAU"
									alt="Banner Image"
									width={260}
									height={-1}
									style={{
										borderRadius: 12,
										maxHeight: 150,
									}}
								/>
							</EuiFlexItem>
							<EuiFlexItem>
								<EuiFlexGroup direction={"column"}>
									<EuiFlexItem>
										<EuiText color={"white"} style={{ marginTop: "20px" }}>
											<h3>The Fujoshi Guide to Web Development</h3>
										</EuiText>
									</EuiFlexItem>
									<EuiFlexItem>
										<EuiText color={"white"}>
											<EuiFlexGroup>
												<EuiFlexItem grow={0}>
													<EuiAvatar
														name={"Fujoshi"}
														color={"plain"}
														type={"space"}
														imageUrl={`https://raw.github.com/hashdog/node-identicon-github/master/examples/images/github.png`}
													/>
												</EuiFlexItem>
												<EuiFlexItem grow={0}>
													0xddd74f832b99a5998f5670417b3cc8e87223cc58
												</EuiFlexItem>
											</EuiFlexGroup>
										</EuiText>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiFlexItem>
							<EuiFlexItem style={{ paddingLeft: "20px" }}>
								<EuiFlexGroup style={{ marginTop: "50px" }}>
									<EuiFlexItem>
										<EuiButton
											fill
											style={{ backgroundColor: "green" }}
											iconType="check"
											iconSide="left"
										>
											Approve
										</EuiButton>
									</EuiFlexItem>
									<EuiFlexItem>
										<EuiButton fill color="danger" iconType="cross" iconSide="left">
											Reject
										</EuiButton>
									</EuiFlexItem>
								</EuiFlexGroup>
							</EuiFlexItem>
						</EuiFlexGroup>
					</EuiPanel>
				)}
			</EuiPageBody>
		</>
	);
}
