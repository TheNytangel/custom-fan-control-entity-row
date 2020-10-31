import { LitElement, html, css } from 'lit-element';

const buttons = [];

class CustomFanRow extends LitElement {

	static get styles() {
		return css`
			:host {
				line-height: inherit;
			}
			.speed {
				min-width: 30px;
				max-width: 30px;
				height: 30px;
				margin-left: 2px;
				margin-right: 2px;
				background-color: #759aaa;
				border: 1px solid lightgrey; 
				border-radius: 4px;
				font-size: 10px !important;
				color: inherit;
				text-align: center;
				float: right !important;
				padding: 1px;
				cursor: pointer;
			}
		`;
	}

	render() {
		return html`
			<style is="custom-style" include="iron-flex iron-flex-alignment"></style>
			<hui-generic-entity-row .hass=${hass} config=${_config}>
				<div class="horizontal justified layout" @click=${this.stopPropagation}>
					${buttons}
				</div>
			</hui-generic-entity-row>
        `;
    }

	static get properties() {
		return {
			hass: {
				type: Object,
				observer: 'hassChanged'
			},
			_config: Object,
			_buttonInformation: Object
		}
	}

	setConfig(config) {
		if (!config.entity) {
			throw new Error("You need to define an entity");
		}

		this._config = {
			customTheme: false,
			sendStateWithSpeed: false,
			reverseButtons: false,
			buttonInactiveColor: 'var(--disabled-text-color)',
			buttonActiveColor: 'var(--primary-color)',
			/*isOffColor: '#f44c09',
			isOnLowColor: '#43A047',
			isOnMedColor: '#43A047',
			isOnHiColor: '#43A047',
			isOnMaxColor: '#43A047',
			customOffText: 'OFF',
			customLowText: 'LOW',
			customMedText: 'MED',
			customHiText: 'HIGH',
			customMaxText: 'MAX',*/
			...config
		};

		const stateObj = this.hass.states[this._config.entity];
		if (!stateObj) {
			throw new Error("Not found");
		}

		while (buttons.pop()) {}
		this._buttonInformation = {}
		for (const speed of stateObj.attributes.speed_list) {
			this.addButton(speed, stateObj.attributes.speed === speed)
		}
		if (this._config.reverseButtons) {
			buttons.reverse()
		}
	}

	addButton(name, active) {
		let displayName = name.toUpperCase();
		if (displayName.length > 4) {
			displayName = displayName.substring(0, 3);
		}
		const newButtonInformation = {...this._buttonInformation};
		newButtonInformation[name] = {
			"state": active,
			"color": active ? this._config.buttonActiveColor : this._config.buttonInactiveColor
		}
		this.setProperties({
			_buttonInformation: newButtonInformation
		});
		buttons.push(html`<button class="speed" toggles .style=${_buttonInformation[color]} name=${name} @click=${this.setSpeed} ?disabled=${_buttonInformation[name]}>${displayName}</button>`);
	}

	hassChanged(hass) {
		const config = this._config;
		const stateObj = hass.states[config.entity];

		const newButtonInformation = {...this._buttonInformation};
		Object.keys(newButtonInformation).forEach(function(key) {
			newButtonInformation[key]["state"] = false;
			newButtonInformation[key]["color"] = this._config.buttonInactiveColor;
		})
		newButtonInformation[stateObj.attributes.speed] = {
			"state": true,
			"color": this._config.buttonActiveColor
		}
		this.setProperties({
			_buttonInformation: newButtonInformation
		});

		/*const custTheme = config.customTheme;
		const sendStateWithSpeed = config.sendStateWithSpeed;
		const revButtons = config.reverseButtons;
		const custOnLowClr = config.isOnLowColor;
		const custOnMedClr = config.isOnMedColor;
		const custOnHiClr = config.isOnHiColor;
		const custOnMaxClr = config.isOnMaxColor;
		const custOffSpdClr = config.buttonInactiveColor;
		const custOffClr = config.isOffColor;
		const custOffTxt = config.customOffText;
		const custLowTxt = config.customLowText;
		const custMedTxt = config.customMedText;
		const custHiTxt = config.customHiText;
		const custMaxTxt = config.customMaxText;

		let speed;
			if (stateObj && stateObj.attributes) {
				speed = stateObj.attributes.speed || 'off';
			}
		
		let low;
		let med;
		let high;
		let max;
		let offstate;
		
		if (stateObj && stateObj.attributes) {
			if (stateObj.state === 'on' && stateObj.attributes.speed === 'low') {
				low = 'on';
			} else if (stateObj.state === 'on' && stateObj.attributes.speed === 'medium') {
				med = 'on';
			} else if (stateObj.state === 'on' && stateObj.attributes.speed === 'high') {
				high = 'on';
			} else if (stateObj.state === 'on' && stateObj.attributes.speed === 'max') {
				max = 'on';
			} else {
				offstate = 'on';
			}
		}
		
		let lowcolor;
		let medcolor;
		let hicolor;
		let maxcolor;
		let offcolor;
				
		if (custTheme) {
			if (low === 'on') {
				lowcolor = 'background-color:' + custOnLowClr;
			} else {
				lowcolor = 'background-color:' + custOffSpdClr;
			}

			if (med === 'on') {
				medcolor = 'background-color:'  + custOnMedClr;
			} else {
				medcolor = 'background-color:' + custOffSpdClr;
			}
			
			if (high === 'on') {
				hicolor = 'background-color:'  + custOnHiClr;
			} else {
				hicolor = 'background-color:' + custOffSpdClr;
			}

			if (max === 'on') {
				maxcolor = 'background-color:'  + custOnMaxClr;
			} else {
				maxcolor = 'background-color:' + custOffSpdClr;
			}

			if (offstate === 'on') {
				offcolor = 'background-color:'  + custOffClr;
			} else {
				offcolor = 'background-color:' + custOffSpdClr;
			}

		} else {

			if (low === 'on') {
				lowcolor = 'background-color: var(--primary-color)';
			} else {
				lowcolor = 'background-color: var(--disabled-text-color)';
			}
		
			if (med === 'on') {
				medcolor = 'background-color: var(--primary-color)';
			} else {
				medcolor = 'background-color: var(--disabled-text-color)';
			}
		
			if (high === 'on') {
				hicolor = 'background-color: var(--primary-color)';
			} else {
				hicolor = 'background-color: var(--disabled-text-color)';
			}

			if (high === 'on') {
				maxcolor = 'background-color: var(--primary-color)';
			} else {
				maxcolor = 'background-color: var(--disabled-text-color)';
			}

			if (offstate === 'on') {
				offcolor = 'background-color: var(--primary-color)';
			} else {
				offcolor = 'background-color: var(--disabled-text-color)';
			}
		}
	
		let offtext = custOffTxt;
		let lowtext = custLowTxt;
		let medtext = custMedTxt;
		let hitext = custHiTxt;
		let maxtext = custMaxTxt;

		let maxname = 'max';
		let hiname = 'high';
		let medname = 'medium';
		let lowname = 'low';
		let offname = 'off';
		
			
		if (revButtons) {
			this.setProperties({
				_stateObj: stateObj,
				_leftState: offstate === 'on',
				_midLeftState: low === 'on',
				_midState: med === 'on',
				_midRightState: high === 'on',
				_rightState: max === 'on',
				_leftColor: offcolor,
				_midLeftColor: lowcolor,
				_midColor: medcolor,
				_midRightColor: hicolor,
				_rightColor: maxcolor,
				_leftText: offtext,
				_midLeftText: lowtext,
				_midText: medtext,
				_midRightText: hitext,
				_rightText: maxtext,
				_leftName: offname,
				_midLeftName: lowname,
				_midName: medname,
				_midRightName: hiname,
				_rightName: maxname,
			});
		} else {
			this.setProperties({
				_stateObj: stateObj,
				_leftState: max === 'on',
				_midLeftState: high === 'on',
				_midState: med === 'on',
				_midRightState: low === 'on',
				_rightState: offstate === 'on',
				_leftColor: maxcolor,
				_midLeftColor: hicolor,
				_midColor: medcolor,
				_midRightColor: lowcolor,
				_rightColor: offcolor,
				_leftText: maxtext,
				_midLeftText: hitext,
				_midText: medtext,
				_midRightText: lowtext,
				_rightText: offtext,
				_leftName: maxname,
				_midLeftName: hiname,
				_midName: medname,
				_midRightName: lowname,
				_rightName: offname,
			});
		}*/
    }

	stopPropagation(e) {
		e.stopPropagation();
	}

	setSpeed(e) {
		const speed = e.currentTarget.getAttribute('name');
		if( speed === 'off' ){
			this.hass.callService('fan', 'turn_off', {entity_id: this._config.entity});
			this.hass.callService('fan', 'set_speed', {entity_id: this._config.entity, speed: speed});
		} else {
			if(this._config.sendStateWithSpeed){
				this.hass.callService('fan', 'turn_on', {entity_id: this._config.entity});
			}
			this.hass.callService('fan', 'set_speed', {entity_id: this._config.entity, speed: speed});
		}
	}
}
	
customElements.define('custom-fan-control-entity-row', CustomFanRow);
