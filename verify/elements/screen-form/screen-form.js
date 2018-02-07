import XScreen from '/elements/x-screen/x-screen.js';
import XCountrySelect from '../x-country-select/x-country-select.js';

export default class ScreenForm extends XScreen {
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


// Todo: Collect following data from user and send it to kyc api:
/* firstName    String    100
lastName    String    100
dob    String Date of birth in the format YYYY-MM-DD
address String 100
city String 100
zip String 100
country    String    3    Possible countries:
• ISO 3166-1 alpha-3 country code
• XKX (Kosovo)
mail address */