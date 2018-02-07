import XScreen from '/elements/x-screen/x-screen.js';
import XCountrySelect from '../x-country-select/x-country-select.js';

export default class ScreenForm extends XScreen {
    html() {
        return `
            <form>
                <div>
                    <label>E-Mail Address</label>
                    <input name="email" maxlength="100" required />
                </div>
                <div>
                    <label for="first_name">First name</label>
                    <input name="first_name" maxlength="100" required />
                </div>
                <div>
                    <label for="last_name">Last name</label>
                    <input name="last_name" maxlength="100" required />
                </div>
                <div>
                    <label>Birthday</label>
                    <input name="birthday" placeholder="YYYY-MM-DD" pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))" required />
                </div>
                <div>
                    <label>Address (Street, Flat)</label>
                    <input name="street" maxlength="100" required />
                </div>
                <div>
                    <label>City</label>
                    <input name="city" maxlength="100" required />
                </div>
                <div>
                    <label>Zip Code</label>
                    <input name="zip" maxlength="100" required />
                </div>
                <div>
                    <label>Country</label>
                    <x-country-select></x-country-select>
               </div>
               <button type="submit">Send</button>
            </form>
        `
    }

    children() {
        return [XCountrySelect];
    }
}


// Todo: Send it to kyc api
