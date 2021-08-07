import React from 'react';
import './style.css';

const CircularWaitAlert = (props:any) => {
	return (
		<div className="custom-modal">
			<div className="custom-modal-content col-md-6">
				<div className="custom-container">
					<p className="alert-msg">{ props.text }</p>			
					<div className="wrapper">		
						<progress className="pure-material-progress-circular"/>
					</div>
				</div>
			</div>		
		</div>
	);
}

export default CircularWaitAlert;