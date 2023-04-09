import {FundraiserMedia, GetFundraiserResponse} from "@/utils/types/apiResponses";
import {EuiAvatar, EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiText} from "@elastic/eui";

import PlaceholderImage from "@/assets/placeholder-image.png"
import Image from "next/image";
import {LINK_TEXT_COLOR_OVERRIDE, useValueScale} from "@/utils/common";
import Link from "next/link";

type FundraiserCardProps = GetFundraiserResponse["fundraiserData"]

function FundraiserCard(props: FundraiserCardProps){
	const {
		fundraiserId, fundraiserTitle,
		fundraiserDescription, fundraiserCreator,
		fundraiserTarget, fundraiserToken,
		fundraiserMinDonationAmount, fundraiserContributorCount,
		fundraiserRaisedAmount, fundraiserCreatedOn,
		fundraiserMedia, fundraiserMilestoneCount
	} = props
	
	const progressStatusColors = ["danger", "orange", "yellow", "green", "success"]
	
	const fundraiserCompletionPercentage = (fundraiserRaisedAmount * 100) / fundraiserTarget
	
	const selectedColor = useValueScale({
		minScale: 0,
		maxScale: 4,
		minValue: 0,
		maxValue: 100,
		currValue: fundraiserCompletionPercentage,
		scaledValues: progressStatusColors
	})
	
	const fundraiserPercentageInt = Number.parseInt(
		fundraiserCompletionPercentage.toString()
	)
	
	let selectedFundraiserImage: FundraiserMedia | null = null;
	for (const media of fundraiserMedia) {
		const {mediaContentType} = media
		if (mediaContentType.startsWith("image")){
			selectedFundraiserImage = media
			break
		}
	}
	
	return (
		<EuiFlexGroup
			direction={"row"}
			alignItems={"center"}
			justifyContent={"spaceAround"}
			gutterSize={"xl"}
		>
			<EuiFlexItem
				grow={0}
			>
				<Image
					src={
						selectedFundraiserImage ? selectedFundraiserImage.mediaURL : PlaceholderImage
					}
					alt={`${fundraiserTitle} Banner Image`}
					width={240}
					height={-1}
					style={{
						borderRadius: 12
					}}
				/>
			</EuiFlexItem>
			<EuiFlexItem>
				<EuiFlexGroup
					direction={"column"}
				>
					<EuiFlexItem>
						<Link
							href={`/fundraisers/${fundraiserId}`}
						>
							<EuiText
								color={LINK_TEXT_COLOR_OVERRIDE}
							>
								<h3>{fundraiserTitle}</h3>
							</EuiText>
						</Link>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiText
							color={LINK_TEXT_COLOR_OVERRIDE}
						>
							<EuiFlexGroup>
								<EuiFlexItem
									grow={0}
								>
									<EuiAvatar
										name={fundraiserCreator}
										color={"plain"}
										type={"space"}
										imageUrl={
											`//gravatar.com/avatar/${fundraiserCreator.slice(2)}?d=retro&f=y`
										}
									/>
								</EuiFlexItem>
								<EuiFlexItem
									grow={0}
								>
									{fundraiserCreator}
								</EuiFlexItem>
							</EuiFlexGroup>
						</EuiText>
					</EuiFlexItem>
				</EuiFlexGroup>
			</EuiFlexItem>
			<EuiFlexItem
				grow={0}
			>
				<EuiFlexGroup
					style={{
						borderRadius: "10px",
						border: `1px solid ${LINK_TEXT_COLOR_OVERRIDE}`,
						padding: `10px`
					}}
				>
					<EuiFlexItem>
						<EuiFlexGroup
							direction={"column"}
							gutterSize={"s"}
						>
							<EuiFlexItem>
								<EuiText
									textAlign={"center"}
									color={selectedColor}
								>
									<h3>
										{fundraiserPercentageInt}%
									</h3>
								</EuiText>
							</EuiFlexItem>
							<EuiFlexItem>
								<EuiText>
									<h5>Complete</h5>
								</EuiText>
							</EuiFlexItem>
						</EuiFlexGroup>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiFlexGroup
							direction={"column"}
							gutterSize={"s"}
						>
							<EuiFlexItem>
								<EuiText
									textAlign={"center"}
								>
									<h3>
										{fundraiserContributorCount}
									</h3>
								</EuiText>
							</EuiFlexItem>
							<EuiFlexItem>
								<EuiText>
									<h5>Contributors</h5>
								</EuiText>
							</EuiFlexItem>
						</EuiFlexGroup>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiFlexGroup
							direction={"column"}
							gutterSize={"s"}
						>
							<EuiFlexItem>
								<EuiText
									textAlign={"center"}
								>
									<h3>
										{fundraiserMilestoneCount}
									</h3>
								</EuiText>
							</EuiFlexItem>
							<EuiFlexItem>
								<EuiText>
									<h5>Milestones</h5>
								</EuiText>
							</EuiFlexItem>
						</EuiFlexGroup>
					</EuiFlexItem>
				</EuiFlexGroup>
			</EuiFlexItem>
		</EuiFlexGroup>
	)
}

export {
	FundraiserCard
}