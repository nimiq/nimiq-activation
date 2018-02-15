import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XCountrySelect from './x-country-select/x-country-select.js';
import XDateofbirthSelect from './x-dateofbirth-select/x-dateofbirth-select.js';

export default class ScreenForm extends XScreenFit {
    html() {
        return `
            <h1>Enter your Details</h1>
            <form>
                <fieldset>
                <legend>Please match exactly information of identifying document</legend>
                <div>
                <label>Nationality</label>
                <x-country-select name="nationality" required></x-country-select>
                </div>
                <div>
                    <label for="gender">Salutation</label>
                    <select name="gender" required>
                        <option value="0">Mr.</option>
                        <option value="1">Mrs./Ms.</option>
                    </select>
                </div>
                <div>
                <label for="first_name">First name(s)</label>
                <input name="first_name" maxlength="100" placeholder="Satoshi" required />
                </div>
                <div>
                <label for="last_name">Last name(s)</label>
                <input name="last_name" maxlength="100" placeholder="Nakamoto" required />
                </div>
                <div>
                <label>Date of Birth</label>
                <x-dateofbirth-select name="date_of_birth" required></x-dateofbirth-select>
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
                <input name="address" maxlength="200" required />
                </div>
                <div>
                <label>City</label>
                <input name="city" maxlength="64" required />
                </div>
                <div>
                <label>Postal Code</label>
                <input name="postal_code" maxlength="15" required />
                </div>
                </fieldset>
                <fieldset>
                <legend>Please provide your personal email address, to which the NIM activation link
                        will be sent after passing the KYC/AML checks</legend>
                <div>
                <label>E-Mail</label>
                <input name="email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                <div>
                <label>E-Mail confirmation</label>
                <input name="confirm_email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                </fieldset>

                <button type="submit">Submit</button>
            </form>
        `
    }

    children() {
        return [ [ XCountrySelect ], XDateofbirthSelect ];
    }

    types() {
        /** @type {XCountrySelect[]} */
        this.$countrySelects = null;
        /** @type {XDateofbirthSelect} */
        this.$dateofbirthSelect = null;
        /** @type {Element} */
        this.$form = null;
    }

    onCreate() {
        this.$form = this.$('form');

        // email validation
        const $email = this.$('[name="email"]');
        const $confirm_email = this.$('[name="confirm_email"]');

        const validateEmail = () => {
            if($email.value != $confirm_email.value) {
                $confirm_email.setCustomValidity("Emails don't match");
            } else {
                $confirm_email.setCustomValidity('');
            }
        };

        $email.addEventListener('change', validateEmail);
        $email.addEventListener('keyup', validateEmail);
        $confirm_email.addEventListener('change', validateEmail);
        $confirm_email.addEventListener('keyup', validateEmail);

        // disallow paste in email fields
        $email.addEventListener('paste', e => e.preventDefault());
        $confirm_email.addEventListener('paste', e => e.preventDefault());
    }


}

// Todo: Show somehow possibility to scroll on Apple?