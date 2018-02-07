import XScreen from '/elements/x-screen/x-screen.js';
import XCountrySelect from '../x-country-select/x-country-select.js';

export default class ScreenWelcome extends XScreen {
    html() {
        return `
            <form>
                <x-country-select></x-country-select>
            </form>
            <a button href="#terms">View Terms</a>
        `
    }

    children() { return [XCountrySelect]; }
}