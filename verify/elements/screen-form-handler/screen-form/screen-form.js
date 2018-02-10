import XScreen from '/elements/x-screen/x-screen.js';
import XCountrySelect from './x-country-select/x-country-select.js';

export default class ScreenForm extends XScreen {
    html() {
        return `
            <h1>Enter your Details</h1>
            <h2>Due to anti money laundering laws we need you to fill out the following form</h2>
            <form>
                <fieldset>
                <legend>Please match exactly information of identifying document</legend>
                <div>
                <label>Nationality</label>
                <x-country-select name="nationality" required></x-country-select>
                </div> 
                <div>
                    <label for="gender">Title</label>
                    <select name="gender" required>
                        <option value="0">Mr.</option>
                        <option value="1">Mrs./Ms.</option>
                    </select>
                </div>
                <div>
                <label for="first_name">First name(s)</label>
                <input name="firstname" maxlength="100" placeholder="Satoshi" required />
                </div>
                <div>
                <label for="last_name">Last name(s)</label>
                <input name="lastname" maxlength="100" placeholder="Nakamoto" required />
                </div>
                <div>
                <label>Date of Birth</label>
                <input name="date_of_birth" placeholder="YYYY-MM-DD" pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))" required />
                </div> 
                </fieldset>
                <fieldset>
                    <legend>Please provide your current address of residence</legend>
                <div>
                <label>Country of Residence</label>
                <x-country-select name="country_of_residence" required></x-country-select>
                </div>
                
                <div>
                <label>Address</label>
                <input name="address" maxlength="100" required />
                </div>
                <div>
                <label>City</label>
                <input name="city" maxlength="100" required />
                </div>
                <div>
                <label>Postal Code</label>
                <input name="postal_code" maxlength="100" required />
                </div>
                </fieldset>
                <fieldset>
                <legend>Please provide your personal email address, to which the NIM activation link
                        will be sent after passing the KYC/AML checks</legend>
                <div>
                <label>E-Mail</label>
                <input name="email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                </fieldset>

                <button type="submit">Send</button>
            </form>
        `
    }

    children() {
        return [ [ XCountrySelect ] ];
    }

    types() {
        /** @type {XCountrySelect} */
        this.$countrySelect = null;
        /** @type {Element} */
        this.$form = null;
    }

    onCreate() {
        this.$form = this.$('form');
    }
}