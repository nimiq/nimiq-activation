import XScreen from '/elements/x-screen/x-screen-fit.js';

export default class ScreenConfirm extends XScreen {

    html() {
        return `
            <h1>Review your Details</h1>
            <div>
                <fieldset>
                    <legend>Information of identifying document</legend>
                    <div>
                        <label>Nationality</label>
                        <strong name="nationality"></strong>
                    </div>
                    <div>
                        <label>Salutation</label>
                        <strong name="gender"></strong>
                    </div>
                    <div>
                        <label>First name(s)</label>
                        <strong name="first_name"></strong>
                    </div>
                    <div>
                        <label>Last name(s)</label>
                        <strong name="last_name"></strong>
                    </div>
                    <div>
                        <label>Date of Birth</label>
                        <strong name="date_of_birth"></strong>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Your current address of residence</legend>
                    <div>
                        <label>Country of Residence</label>
                        <strong name="country_of_residence"></strong>
                    </div>

                    <div>
                        <label>Address</label>
                        <strong name="address"></strong>
                    </div>
                    <div>
                        <label>City</label>
                        <strong name="city"></strong>
                    </div>
                    <div>
                        <label>Postal Code</label>
                        <strong name="postal_code"></strong>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Your personal email address, to which the NIM activation link
                            will be sent after passing the KYC/AML checks</legend>
                    <div>
                        <label>E-Mail</label>
                        <strong name="email"></strong>
                    </div>
                </fieldset>
            </div>
            <button disabled="disabled">Confirm</button>
            <a secondary href="#form-handler">Back</a>
        `
    }

    onCreate() {
        this.$button = this.$('button');

        this.$nationality = this.$('strong[name="nationality"]');
        this.$gender = this.$('strong[name="gender"]');
        this.$first_name = this.$('strong[name="first_name"]');
        this.$last_name = this.$('strong[name="last_name"]');
        this.$date_of_birth = this.$('strong[name="date_of_birth"]');
        this.$country_of_residence = this.$('strong[name="country_of_residence"]');
        this.$address = this.$('strong[name="address"]');
        this.$city = this.$('strong[name="city"]');
        this.$postal_code = this.$('strong[name="postal_code"]');
        this.$email = this.$('strong[name="email"]');

        this.monthsDict = {
            '01': 'January',
            '02': 'February',
            '03': 'March',
            '04': 'April',
            '05': 'May',
            '06': 'June',
            '07': 'July',
            '08': 'August',
            '09': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December'
        };

        this.countriesDict = {
            "AFG": "Afghanistan",
            "ALA": "&#197;land Islands",
            "ALB": "Albania",
            "DZA": "Algeria",
            "ASM": "American Samoa",
            "AND": "Andorra",
            "AGO": "Angola",
            "AIA": "Anguilla",
            "ATA": "Antarctica",
            "ATG": "Antigua and Barbuda",
            "ARG": "Argentina",
            "ARM": "Armenia",
            "ABW": "Aruba",
            "AUS": "Australia",
            "AUT": "Austria",
            "AZE": "Azerbaijan",
            "BHS": "Bahamas",
            "BHR": "Bahrain",
            "BGD": "Bangladesh",
            "BRB": "Barbados",
            "BLR": "Belarus",
            "BEL": "Belgium",
            "BLZ": "Belize",
            "BEN": "Benin",
            "BMU": "Bermuda",
            "BTN": "Bhutan",
            "BOL": "Bolivia, Plurinational State of",
            "BIH": "Bosnia and Herzegovina",
            "BWA": "Botswana",
            "BVT": "Bouvet Island",
            "BRA": "Brazil",
            "IOT": "British Indian Ocean Territory",
            "BRN": "Brunei Darussalam",
            "BGR": "Bulgaria",
            "BFA": "Burkina Faso",
            "BDI": "Burundi",
            "KHM": "Cambodia",
            "CMR": "Cameroon",
            "CAN": "Canada",
            "CPV": "Cape Verde",
            "CYM": "Cayman Islands",
            "CAF": "Central African Republic",
            "TCD": "Chad",
            "CHL": "Chile",
            "CHN": "China",
            "CXR": "Christmas Island",
            "CCK": "Cocos (Keeling) Islands",
            "COL": "Colombia",
            "COM": "Comoros",
            "COG": "Congo",
            "COD": "Congo, the Democratic Republic of the",
            "COK": "Cook Islands",
            "CRI": "Costa Rica",
            "CIV": "C&#244;te d'Ivoire",
            "HRV": "Croatia",
            "CUB": "Cuba",
            "CYP": "Cyprus",
            "CZE": "Czech Republic",
            "DNK": "Denmark",
            "DJI": "Djibouti",
            "DMA": "Dominica",
            "DOM": "Dominican Republic",
            "ECU": "Ecuador",
            "EGY": "Egypt",
            "SLV": "El Salvador",
            "GNQ": "Equatorial Guinea",
            "ERI": "Eritrea",
            "EST": "Estonia",
            "ETH": "Ethiopia",
            "FLK": "Falkland Islands (Malvinas)",
            "FRO": "Faroe Islands",
            "FJI": "Fiji",
            "FIN": "Finland",
            "FRA": "France",
            "GUF": "French Guiana",
            "PYF": "French Polynesia",
            "ATF": "French Southern Territories",
            "GAB": "Gabon",
            "GMB": "Gambia",
            "GEO": "Georgia",
            "DEU": "Germany",
            "GHA": "Ghana",
            "GIB": "Gibraltar",
            "GRC": "Greece",
            "GRL": "Greenland",
            "GRD": "Grenada",
            "GLP": "Guadeloupe",
            "GUM": "Guam",
            "GTM": "Guatemala",
            "GGY": "Guernsey",
            "GIN": "Guinea",
            "GNB": "Guinea-Bissau",
            "GUY": "Guyana",
            "HTI": "Haiti",
            "HMD": "Heard Island and McDonald Islands",
            "VAT": "Holy See (Vatican City State)",
            "HND": "Honduras",
            "HKG": "Hong Kong",
            "HUN": "Hungary",
            "ISL": "Iceland",
            "IND": "India",
            "IDN": "Indonesia",
            "IRN": "Iran, Islamic Republic of",
            "IRQ": "Iraq",
            "IRL": "Ireland",
            "IMN": "Isle of Man",
            "ISR": "Israel",
            "ITA": "Italy",
            "JAM": "Jamaica",
            "JPN": "Japan",
            "JEY": "Jersey",
            "JOR": "Jordan",
            "KAZ": "Kazakhstan",
            "KEN": "Kenya",
            "KIR": "Kiribati",
            "PRK": "Korea, Democratic People's Republic of",
            "KOR": "Korea, Republic of",
            "KWT": "Kuwait",
            "KGZ": "Kyrgyzstan",
            "LAO": "Lao People's Democratic Republic",
            "LVA": "Latvia",
            "LBN": "Lebanon",
            "LSO": "Lesotho",
            "LBR": "Liberia",
            "LBY": "Libyan Arab Jamahiriya",
            "LIE": "Liechtenstein",
            "LTU": "Lithuania",
            "LUX": "Luxembourg",
            "MAC": "Macao",
            "MKD": "Macedonia, the former Yugoslav Republic of",
            "MDG": "Madagascar",
            "MWI": "Malawi",
            "MYS": "Malaysia",
            "MDV": "Maldives",
            "MLI": "Mali",
            "MLT": "Malta",
            "MHL": "Marshall Islands",
            "MTQ": "Martinique",
            "MRT": "Mauritania",
            "MUS": "Mauritius",
            "MYT": "Mayotte",
            "MEX": "Mexico",
            "FSM": "Micronesia, Federated States of",
            "MDA": "Moldova, Republic of",
            "MCO": "Monaco",
            "MNG": "Mongolia",
            "MNE": "Montenegro",
            "MSR": "Montserrat",
            "MAR": "Morocco",
            "MOZ": "Mozambique",
            "MMR": "Myanmar",
            "NAM": "Namibia",
            "NRU": "Nauru",
            "NPL": "Nepal",
            "NLD": "Netherlands",
            "ANT": "Netherlands Antilles",
            "NCL": "New Caledonia",
            "NZL": "New Zealand",
            "NIC": "Nicaragua",
            "NER": "Niger",
            "NGA": "Nigeria",
            "NIU": "Niue",
            "NFK": "Norfolk Island",
            "MNP": "Northern Mariana Islands",
            "NOR": "Norway",
            "OMN": "Oman",
            "PAK": "Pakistan",
            "PLW": "Palau",
            "PSE": "Palestinian Territory, Occupied",
            "PAN": "Panama",
            "PNG": "Papua New Guinea",
            "PRY": "Paraguay",
            "PER": "Peru",
            "PHL": "Philippines",
            "PCN": "Pitcairn",
            "POL": "Poland",
            "PRT": "Portugal",
            "PRI": "Puerto Rico",
            "QAT": "Qatar",
            "REU": "R&#233;union",
            "ROU": "Romania",
            "RUS": "Russian Federation",
            "RWA": "Rwanda",
            "BLM": "Saint Barth&#233;lemy",
            "SHN": "Saint Helena, Ascension and Tristan da Cunha",
            "KNA": "Saint Kitts and Nevis",
            "LCA": "Saint Lucia",
            "MAF": "Saint Martin (French part)",
            "SPM": "Saint Pierre and Miquelon",
            "VCT": "Saint Vincent and the Grenadines",
            "WSM": "Samoa",
            "SMR": "San Marino",
            "STP": "Sao Tome and Principe",
            "SAU": "Saudi Arabia",
            "SEN": "Senegal",
            "SRB": "Serbia",
            "SYC": "Seychelles",
            "SLE": "Sierra Leone",
            "SGP": "Singapore",
            "SVK": "Slovakia",
            "SVN": "Slovenia",
            "SLB": "Solomon Islands",
            "SOM": "Somalia",
            "ZAF": "South Africa",
            "SGS": "South Georgia and the South Sandwich Islands",
            "ESP": "Spain",
            "LKA": "Sri Lanka",
            "SDN": "Sudan",
            "SUR": "Suriname",
            "SJM": "Svalbard and Jan Mayen",
            "SWZ": "Swaziland",
            "SWE": "Sweden",
            "CHE": "Switzerland",
            "SYR": "Syrian Arab Republic",
            "TWN": "Taiwan, Province of China",
            "TJK": "Tajikistan",
            "TZA": "Tanzania, United Republic of",
            "THA": "Thailand",
            "TLS": "Timor-Leste",
            "TGO": "Togo",
            "TKL": "Tokelau",
            "TON": "Tonga",
            "TTO": "Trinidad and Tobago",
            "TUN": "Tunisia",
            "TUR": "Turkey",
            "TKM": "Turkmenistan",
            "TCA": "Turks and Caicos Islands",
            "TUV": "Tuvalu",
            "UGA": "Uganda",
            "UKR": "Ukraine",
            "ARE": "United Arab Emirates",
            "GBR": "United Kingdom",
            "USA": "United States",
            "UMI": "United States Minor Outlying Islands",
            "URY": "Uruguay",
            "UZB": "Uzbekistan",
            "VUT": "Vanuatu",
            "VEN": "Venezuela, Bolivarian Republic of",
            "VNM": "Viet Nam",
            "VGB": "Virgin Islands, British",
            "VIR": "Virgin Islands, U.S.",
            "WLF": "Wallis and Futuna",
            "ESH": "Western Sahara",
            "YEM": "Yemen",
            "ZMB": "Zambia",
            "ZWE": "Zimbabwe"
        };
    }

    set(data) {
        const dob = data.date_of_birth.split('-');
        dob[1] = this.monthsDict[dob[1]];
        const human_dob = dob.join(' ');

        this.$nationality.textContent = this._parseHtmlEntities(this.countriesDict[data.nationality]);
        this.$gender.textContent = data.gender === 0 ? 'Mr.' : 'Mrs.';
        this.$first_name.textContent = data.first_name;
        this.$last_name.textContent = data.last_name;
        this.$date_of_birth.textContent = human_dob;
        this.$country_of_residence.textContent = this._parseHtmlEntities(this.countriesDict[data.country_of_residence]);
        this.$address.textContent = data.address;
        this.$city.textContent = data.city;
        this.$postal_code.textContent = data.postal_code;
        this.$email.textContent = data.email;

        // The confirm button is disabled on page-load, to prevent submitting empty
        // data when reloading the page at the #form-handler/confirm URL.
        this.$button.removeAttribute('disabled');
    }

    _parseHtmlEntities(str) {
        return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
            var num = parseInt(numStr, 10); // read num as normal number
            return String.fromCharCode(num);
        });
    }

}