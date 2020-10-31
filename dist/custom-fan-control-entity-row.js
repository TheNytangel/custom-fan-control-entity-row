((LitElement) => {
	const html = LitElement.prototype.html;
	const css = LitElement.prototype.css;

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
			<hui-generic-entity-row .hass=${this._hass} config=${this._config}>
				<div class="horizontal justified layout" @click=${this.stopPropagation}>
					${buttons}
				</div>
			</hui-generic-entity-row>
        `;
		}

		static get properties() {
			return {
				_hass: {
					type: Object,
					observer: 'hassChanged'
				},
				_config: Object,
				_buttonInformation: Object
			}
		}

		setConfig(config) {
			if (!this._hass || !config) {
				return;
			}
			if (!config.entity) {
				throw new Error("You need to define an entity");
			}

			this._config = {
				customTheme: false,
				sendStateWithSpeed: false,
				reverseButtons: false,
				buttonInactiveColor: 'var(--disabled-text-color)',
				buttonActiveColor: 'var(--primary-color)',
				...config
			};

			const stateObj = this._hass.states[this._config.entity];
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
			buttons.push(html`<button class="speed" toggles .style=${this._buttonInformation[color]} name=${name} @click=${this.setSpeed} ?disabled=${this._buttonInformation[name]}>${displayName}</button>`);
		}

		hassChanged(hass) {
			if (!hass || !this._config) {
				return;
			}
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
		}

		stopPropagation(e) {
			e.stopPropagation();
		}

		setSpeed(e) {
			const speed = e.currentTarget.getAttribute('name');
			if( speed === 'off' ){
				this._hass.callService('fan', 'turn_off', {entity_id: this._config.entity});
				this._hass.callService('fan', 'set_speed', {entity_id: this._config.entity, speed: speed});
			} else {
				if(this._config.sendStateWithSpeed){
					this._hass.callService('fan', 'turn_on', {entity_id: this._config.entity});
				}
				this._hass.callService('fan', 'set_speed', {entity_id: this._config.entity, speed: speed});
			}
		}

		set hass(hass) {
			this._hass = hass;
		}
	}

	customElements.define('custom-fan-control-entity-row', CustomFanRow);

})(window.LitElement || Object.getPrototypeOf(customElements.get('hui-generic-entity-row')));
