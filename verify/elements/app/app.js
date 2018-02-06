import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
        `
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
        }
    }
}

Verify.launch();

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