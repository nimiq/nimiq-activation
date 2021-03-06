import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenCountryCheckFallback from '../screen-country-check-fallback/screen-country-check-fallback.js';
import ScreenTerms from '../screen-terms/screen-terms.js';
import ScreenFormHandler from '../screen-form-handler/screen-form-handler.js';
import ScreenSuccess from '/elements/legacy/screen-success/screen-success.js';
import ScreenError from '/elements/legacy/screen-error/screen-error.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-country-check-fallback></screen-country-check-fallback>
            <screen-terms></screen-terms>
            <screen-form-handler></screen-form-handler>
            <screen-success>Thank you! Soon you will receive an email with further information.</screen-success>
            <screen-error></screen-error>
        `
    }

    /** Just for typing. Can't do this in constructor because children are set in super(). */
    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenTerms} */
        this.$screenTerms = null;
        /** @type {ScreenForm} */
        this.$screenFormHandler = null;
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenCountryCheckFallback,
            ScreenTerms,
            ScreenFormHandler,
            ScreenSuccess,
            ScreenError
        ]
    }

    onCreate() {
        // Go to start at page (re-)load
        location.href = "#";
        this._checkUserCountry();
    }

    _checkUserCountry() {
        // check that user is not from the US or Puerto Rico
        const xmlhttp = new XMLHttpRequest();
        const url = 'https://geoip.nimiq-network.com:8443/v1/locate';
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                const response = JSON.parse(xmlhttp.responseText);
                let country;
                try {
                    country = response.country;
                } catch(e) {
                    country = null;
                }
                if (!country) {
                    this._showCountryCheckFallback();
                    return;
                }
                country = country.toUpperCase();
                if (country==='US' || country==='PR') {
                    // US or puerto rico
                    this.showError('It appears as if you are accessing our site from the US or a US territory. Please be aware that NIM Activation from NET is not available to citizens, green card holders or residents of the US and citizens or residents of Puerto Rico.');
                }
            }
        };
        xmlhttp.onerror = xmlhttp.ontimeout = () => {
            this._showCountryCheckFallback();
        };
        xmlhttp.open('GET', url, true);
        xmlhttp.timeout = 5000;
        xmlhttp.send();
    }

    _showCountryCheckFallback() {
        window.location = '#country-check-fallback'
    }
}

Verify.launch();
