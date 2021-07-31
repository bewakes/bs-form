import * as React from 'react';
import { WaitAlertProps } from '../types';
import { Row, Col } from 'reactstrap';
import "./style.css";

export const WaitAlert = (props: WaitAlertProps) => {
	return (
		<Row className="custom-modal">
			<Col md="6" className="custom-modal-content">			
				<div className="custom-container">		
					<div className="loading">
						<span className="text">{props.text}</span>
						<div className="percent">
							<div className="progress"></div>
						</div>
					</div>
				</div>
			</Col>		
		</Row>
	);
}