import XScreenFit from '/elements/x-screen/x-screen-fit.js';

export default class ScreenPrivacyTerms extends XScreenFit {
    html() {
        return `
		    <h1>KYC Process, Data Collection and Retention</h1>
		    <h2>Please read the following terms carefully</h2>
		    <section>
                <p>As part of the NIM Activation, Nimiq Network Ltd. (“Nimiq”) conducts a KYC Process to help ensure regulatory compliance and adapt Genesis Block NIM to international standards. Since data protection is of a particularly high priority for us, we would like to inform you of the exact nature, scope, and purpose of the personal data we collect, use and process.</p>

                <p>All personal data gathered by Nimiq during the KYC Process (“Personal Information”) will only be used to identify and verify your identity. As part of the KYC Process, Nimiq will collaborate with <strong>Intrum Justitia AG</strong>, Eschenstrasse 12, CH-8603 Schwerzenbach, Switzerland; <strong>Jumio Corporation</strong>, 268 Lambert Avenue, Palo Alto, CA 94306, US; and <strong>IVXS Technology USA Ltd</strong>, 85 Broad St, NY 10004, US (“ComplyAdvantage”) (collectively “Service Providers”). All three Service Providers have provided sufficient guarantees to meet all applicable regulatory requirements and will only process your Personal Information on servers situated within the </strong>European Union</strong>.[…]</p>

                <p>Nimiq will transfer your Personal Information to either Intrum Justitia or Jumio. They will be responsible for the identification and verification of your identity and will ask you to provide a photograph or video feed of your passport and face (“Verification Information”). After their verification process, Intrum Justitia or Jumio will provide to Nimiq a copy of the Verification Information and will retain the Personal Information and the Verification Information for a period of 180 days (Intrum Justitia) or 12 months (Jumio), respectively.</p>

                <p>If the verification process is successful, Nimiq will then send your full name and birth date to ComplyAdvantage to perform a Sanctions & Watchlist Check. ComplyAdvantage will be responsible for conducting the sanction list-, embargo- and PEP-check and Nimiq will use that information to ensure that you are not prohibited from participating in the NIM Activation. ComplyAdvantage will not retain any of the Personal Information obtained by Nimiq.</p>

                <p>After passing the Sanctions & Watchlist Check, you will receive from Nimiq an acceptance email containing detailed instructions on how to activate your NIM. The Personal Information and Verification Information will then be encrypted by Nimiq and stored on ISO 27001 certified servers in Germany or Switzerland for a period of up to 10 years. This allows Nimiq to demonstrate to regulators that the KYC Process was implemented. Nimiq will delete all non-encrypted data within 48 hours after sending the acceptance email.</p>

                <p>If you want to learn more about your rights with regard to your Personal Information, please take a look at our Privacy Policy which can be accessed on <a href="https://www.nimiq.com/privacy">www.nimiq.com/privacy</a> and consult with your personal advisors.</p>

                <strong>I hereby consent to the use of my personal information as described above:</strong>

		    	<div class="same-size-buttons">
				    <a id="disagree" button class="small fixed-size secondary" href="https://www.nimiq.com">I Disagree</a>
				    <a id="agree" button class="small fixed-size" href="#form-handler">I Agree</a>
				</div>
		    </section>
		`
    }
}
