import React, {Children} from "react";
import {EuiFlexGroup, EuiFlexItem} from "@elastic/eui";

interface EuiCenterProps {
	children?: React.ReactNode
	height?: string,
	width?: string
	growOptions?: boolean[]
	defaultGrowValue?: boolean
}

function EuiCenter({children, height, width, growOptions, defaultGrowValue}: EuiCenterProps): JSX.Element {
	const resolvedHeight = height || 'inherit';
	const resolvedWidth = width || 'inherit';
	const resolvedDefaultGrowValue = Boolean(defaultGrowValue)
	const resolvedGrowOptArray: boolean[] = new Array<boolean>(
		Children.count(children)
	).fill(resolvedDefaultGrowValue)
	if (growOptions){
		if (growOptions.length < resolvedGrowOptArray.length){
			growOptions.forEach((growOpt, optIndex) => {
				resolvedGrowOptArray[optIndex] = growOpt;
			})
		}
	}
	return (
		<EuiFlexGroup
			justifyContent={"center"}
			alignItems={"center"}
			style={{
				height: resolvedHeight,
				width: resolvedWidth
			}}
		>
			{Children.map(children, (passedChild, childIndex) => {
				return (
					<EuiFlexItem grow={
						resolvedGrowOptArray[childIndex]
					}>
						{passedChild}
					</EuiFlexItem>
				)
			})}
		</EuiFlexGroup>
	)
}

export default EuiCenter;