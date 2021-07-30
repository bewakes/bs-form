import * as React from 'react';
import { ProgressBarProps } from '../types';
import "./style.css";

export const ProgressBar = (props: ProgressBarProps) => {
	return (
		<div className="container">		
			<div className="loading">
				<span className="text">{props.text}</span>
				<div className="percent">
					<div className="progress"></div>
				</div>
			</div>
		</div>

	);
}