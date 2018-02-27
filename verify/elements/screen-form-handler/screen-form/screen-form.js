import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XCountrySelect from './x-country-select/x-country-select.js';
import XDateofbirthSelect from './x-dateofbirth-select/x-dateofbirth-select.js';
import intrumCountries from './intrum-countries.js';

export default class ScreenForm extends XScreenFit {
    html() {
        return `
            <h1>Enter your Details</h1>
            <form>
                <fieldset>
                <legend>
                    Please match exactly the information on your non-expired, identifying document:
                    (Passports and some national IDs, no driver's licences)
                </legend>
                <div>
                <label>Nationality</label>
                <x-country-select name="nationality" required></x-country-select>
                </div>
                <div style="font-style: oblique;">
                    <label>
                        Identity verification hours:
                    </label>
                    <span id="office-times">
                        &lt;please select a country&gt;
                    </span>
                </div>
                </div>
                <div>
                    <label for="gender">Salutation</label>
                    <select name="gender" required>
                        <option value=""></option>
                        <option value="0">Mr.</option>
                        <option value="1">Mrs./Ms.</option>
                    </select>
                </div>
                <div>
                <label for="first_name">All first names</label>
                <input name="first_name" maxlength="100" placeholder="Satoshi" required />
                </div>
                <div>
                <label for="last_name">All last names</label>
                <input name="last_name" maxlength="100" placeholder="Nakamoto" required />
                </div>
                <div>
                <label>Date of Birth</label>
                <x-dateofbirth-select name="date_of_birth" required></x-dateofbirth-select>
                </div>
                </fieldset>
                <fieldset>
                    <legend>Please provide your current address of residence:</legend>
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
                <legend>Please provide your personal email address<br>to which important NIM Activation links
                        will be sent:</legend>
                <em>Please do not use HOTMAIL or OUTLOOK accounts.</em>
                <div>
                <label>E-Mail</label>
                <input name="email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                <div>
                <label>E-Mail confirmation</label>
                <input name="confirm_email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                </fieldset>

                <button type="submit">Confirm</button>
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

        // age check
        const $birthdayField = this.$dateofbirthSelect;
        const $year = this.$('#year');

        const validateBirthday = () => {
            const birthday = moment($birthdayField.$input.value);
            const now = moment();
            if (now.diff(birthday, 'years') < 18) {
                $year.setCustomValidity("You must be at least 18 years old!");
            } else {
                $year.setCustomValidity('');
            }
        };

        $birthdayField.addEventListener('change', validateBirthday);

        // email validation
        const $email = this.$('[name="email"]');
        const $confirm_email = this.$('[name="confirm_email"]');

        const validateEmail = () => {
            if($email.value.indexOf('@hotmail.') > 0 || $email.value.indexOf('@outlook.') > 0) {
                $confirm_email.setCustomValidity("Please do not use HOTMAIL or OUTLOOK accounts");
            }
            else if($email.value != $confirm_email.value) {
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

        // Show office times for certain countries
        const $nationality = this.$('[name="nationality"]');
        $nationality.addEventListener('change', e => this._updateOfficeTimes(e.target.value));
    }

    _updateOfficeTimes(nationality) {
        const $officeTimes = this.$('#office-times');
        if(nationality === "") {
            $officeTimes.textContent = '<please select a country>';
            return;
        }
        if (intrumCountries.includes(nationality)) {
            // Check for DST in Switzerland
            if (moment().diff(moment('2018-03-24')) < 0) {
                $officeTimes.textContent = 'Mo-Sa 7am to 10pm UTC+1';
            }
            else {
                $officeTimes.textContent = 'Mo-Sa 7am to 10pm UTC+2';
            }
        } else {
            $officeTimes.textContent = '24/7';
        }
    }
}
