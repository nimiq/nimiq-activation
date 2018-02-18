import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XAppState from '/elements/x-screen/x-app-state.js';

export default class ScreenActivationTerms extends XScreenFit {
    html() {
        return `
		    <h1>NIM Activation Terms, NET Replacement, and Explanatory Note</h1>
		    <section>
                <p>The following Terms shall govern the activation of NIM and the replacement of NET tokens ("Replacement", collectively called "Activation"). Upon Activation, for every NET 100 NIM shall be allocated. The allocation is made automatically via the Genesis Block of the Nimiq Blockchain ("Nimiq Blockchain").</p>

                <p>NIM are transferable cryptographic blockchain-based digital information tokens that allow the usage of and the interaction with the decentralized Nimiq Mainnet and Ecosystem (the "Nimiq Network"). Nimiq Network Ltd. develops and supports new technologies and applications, especially in the fields of open and decentralized software architectures.</p>

                <p>By conducting the Activation, the holder of NET tokens ("NET Holder") expressly agrees to all of the terms and conditions set forth in this document ("Terms") as well as the <a href="https://nimiq.com/terms" target="_blank">NET Token Creation and Crowdsale Terms</a> ("Crowdsale Terms"). These Terms constitute a supplement to the existing Crowdsale Terms.</p>

                <h3>I. Principles and Risks</h3>
                <ol>
                    <li>This document does not constitute a prospectus of any sort, is not a solicitation for investment and does not pertain in any way to an offering of securities in any jurisdiction. It is a description of the functionality of a software-based token replacement and activation.</li>
                    <li>Dependent on your jurisdiction, the Activation, sale, purchase, exchange, or holding of NIM may have tax and other reporting requirements that must be complied with. Consult your own tax and legal advisors with respect to these matters.</li>
                    <li>The NET Holder is also aware of the risk that even if all or parts of the Nimiq Network are successfully developed and released in full or in parts, due to a lack of public interest, the Nimiq Network could be fully or partially abandoned, remain commercially unsuccessful, or shut down for lack of interest or other reasons. The NET Holder therefore understands and accepts that the Activation, Replacement, use and ownership of NIM, carries significant financial, regulatory and/or reputational risks (including the complete loss of value (if any) of NIM and attributed features).</li>
                    <li>By replacing NET and/or by activating, using and holding NIM, no form of partnership, joint venture or any similar relationship between the NET Holders, Nimiq Network Ltd. and/or other individuals or entities involved with the Nimiq Network is created.</li>
                    <li>NIM cannot be used for any purposes other than as provided herein. NIM activation should not be used for any investment, speculative or other financial purposes. NIM confer no other rights in any form, including but not limited to any ownership, distribution (including, but not limited to, profit), redemption, liquidation, property (including all forms of intellectual property), or other financial or legal rights. NIM confer no rights in the company and do not represent participation in the company. NIM are designed as a functional utility and not as a currency or security and have no underlying asset, counterparty rights or other backing.</li>
                    <li>The NET Holder and the holder of NIM ("NIM Holder") acknowledges, understands, and agrees that ownership of NIM does not grant the NIM Holder the right to receive profits, income, or other payments or returns arising from the acquisition, holding, management or disposal of, the exercise of, the redemption of, or the expiry of, any right, interest, title or benefit in Nimiq Network Ltd. or any other Nimiq Network Ltd. property, whole or in part. NIM are not official or legally binding investments of any kind. The Nimiq Network is not yet fully developed and is subject to completion, further changes, updates, and adjustments Such changes may result in unexpected and unforeseen effects on its projected appeal to users, possibly due to the failure to meet users' preconceived expectations, and hence, impact its success. NIM Holders will experience the negative effects of any slowdown in usage of the Nimiq Network, due to psychology, market conditions, economic conditions, and several other factors.</li>
                    <li>NET Holder understands and accepts that the blockchain technology allows new forms of interaction and that it is possible that certain jurisdictions will apply existing regulations on, or introduce new regulations addressing, blockchain technology based applications, which may be contrary to the current setup of the Nimiq Network and which may, inter alia, result in substantial modifications of the Nimiq Network, the Nimiq Blockchain and/or the NIM, including its termination and the loss of NIM.</li>
                    <li>In case of unforeseen circumstances, the objectives stated in this document may be changed. All parties involved in the Activation and Replacement do so at their own risk.</li>
                    <li>NIM and any related digital information are exposed to risks of hacking, theft and user error. Every NET or NIM Holder understands and accepts, that he/she is fully responsible for keeping safe any of his/her NIM and protecting any information necessary to access these NIM (passwords, private keys etc.). Nimiq Network Ltd. is not involved with the storage and management of any NIM by their holders and therefore has neither the possibility, nor the obligation to undertake any actions with regard to the protection of these NIM. Furthermore, NET and NIM Holders understand and accept, that Nimiq Network Ltd. is unable to retrieve any lost or stolen NET or NIM and such will be lost for the respective holder. The same applies if a NET or NIM Holder makes a transfer to a wrong or invalid address.</li>
                    <li>No Cancellation and No Refund of NET. All Activation orders are deemed firm and final. The NET Holder acknowledges to be fully aware that he/she will not be entitled to claim any full or partial reimbursement under any circumstances whatsoever.</li>
                    <li>No guarantee on trading. In any event, NIM activation should not be done in order to invest, achieve profit, or speculate. The use of NIM should only be to facilitate transactions via a decentralized network. Any secondary market activity with regard to NIM is outside of the control of Nimiq Network Ltd. Trading of NIM would merely depend on the consensus of value between the relevant market participants.</li>
                    <li>Note on forward-looking statements. All claims and statements made herein, Nimiq Network Ltd. website, press releases made by Nimiq Network Ltd., also any oral statements made by Nimiq Network Ltd. team members of agents acting on behalf of Nimiq Network Ltd. that are not an accomplished fact may represent so called forward-looking statements. Some of these forward-looking statements may be considered such by containing the following terms: "will", "anticipate", "plan", "aim", "timing", "target", "expect"," estimate", "envision", "intend", "project", "may", "believe", "if", or any other such terms. Further, the terms listed above are not necessary to identify a forward-looking statement. All statements that include, but are not limited to any financial projections, time lines, goals, estimates, plans or possible trends, risks, as well as future prospects of the project should be considered as forward-looking statements as well. These forward-looking statements are not yet accomplished facts and Nimiq Network Ltd. does not take responsibility and cannot guarantee that the future results will correspond with above mentioned forward-looking statements. These forward-looking statements are also provided asis and Nimiq Network Ltd. takes no responsibility for updating these forward-looking statements, should any information relevant to the pertaining forward-looking statements become available in the future. No information contained herein should be considered as a promise, representation of commitment or undertaking as to the future performance of NIM, NET, or any other component of the Nimiq ecosystem.</li>
                </ol>

                <h3>II. Duration of and procedure of NIM Activation</h3>
                <p>The Activation procedure begins with the publication of the Activation tool ("Activation Tool") and shall be available for a duration of up to 6 months following the date of the Mainnet Launch ("Activation Period"). <strong>Upon expiration of the Activation Period, no further replacements of NET will be possible and the Smart Contract governing NET will be locked resulting in all remaining NET being "burned" (becoming immovable).</strong></p>

                <p>The procedure of NIM Activation will be as follows:</p>
                <ol>
                    <li>SIGN INTO THE ACTIVATION TOOL (<a href="https://activation.nimiq.com" target="_blank">https://activation.nimiq.com</a>)</li>
                    <li>READ AND AGREE TO ACTIVATION TERMS (<a href="https://nimiq.com/activation/terms" target="_blank">https://nimiq.com/activation/terms</a>)</li>
                    <li>READ AND AGREE TO DATA COLLECTION AND RETENTION TERMS (<a href="https://nimiq.com/activation/privacy" target="_blank">https://nimiq.com/activation/privacy</a>)</li>
                    <li>FILL IN NECESSARY INFORMATION FOR THE KYC</li>
                    <li>GO THROUGH THE KYC PROCESS (as described in section III below)</li>
                    <li>COMPLETE THE ACTIVATION WHERBY NET ARE "BURNED" AND NIM ACTIVATED (as described in section 4 below and only if the KYC Process has been passed successfully)</li>
                </ol>

                <h3>III. KYC (“Know-Your-Customer”) Procedure</h3>
                <ol>
                    <li>As per Section V. (page 5) of the Crowdsale Terms, Nimiq Network Ltd. reserved the right to conduct know-your-customer procedures ("KYC Procedure") for reasons of regulatory compliance. Such a KYC Procedure will now be conducted in the course of the Activation and Replacement.</li>
                    <li>Once NET Holder accesses the online Activation Tool at www.nimiq.com/activate he/she will have to read and accept these Activation Terms, read and agree to data collection and retention terms, provide information concerning nationality, name, date of birth and residence address and will automatically be redirected to the Servers of Jumio Corporation in the United Kingdom or Intrum AG in Switzerland (applicable provider individually chosen at the discretion of Nimiq Network Ltd.), which then verifies the identity of the respective NET Holder based on the requested documentation.</li>
                    <li>The verified identity of the NET Holder will then be forwarded to servers of ComplyAd-vantage (a service of IVXS Technology USA Inc.) situated in Ireland and Germany, in order to conduct a sanctionlist- / embargo- and PEP-check. Depending on the result of this check, the NET Holder can proceed with the Activation procedure by creating the relevant NIM address. In the event of a verified negative result in the sanction list- / embargo- and PEP-check, the Activation procedure will be cancelled.</li>
                    <li><strong>All citizens, residents and Greencard holders of the USA, as well as citizens and residents of other sanctioned countries, identified during the KYC procedure, may be blocked</strong> and are not able to participate in the Activation. Also, other countries have limitations with regard to the ownership and/or transfer of cryptographic tokens. Each holder of NIM and NET is solely responsible to ensure that he/she is in compliance with all laws applicable to him/her with respect to this Activation.</li>
                </ol>

                <h3>IV. Activation Procedure</h3>
                <p>After NET Holder has passed the KYC Procedure and has been admitted, he/she will receive a unique link to the e-mail address provided that allows him/her to access the personal dashboard ("Dashboard"). Within the Dashboard the NET Holder can generate a new "account" on the Nimiq blockchain, the private key and get instructions on how to send his NET to a unique Ethereum address where the NET are 'burned' (become immovable, "Burn Address"). Finally, the NET (must be one whole NET or more in order to Activate) arriving at the Burn Address shall be matched with equivalent NIM (1 NET equals 100 NIM) in the corresponding new "account" on the Nimiq Blockchain.</p>

                <h3>V. Privacy Policy and Data Processors</h3>
                <p>NET Holder understands and accepts that the KYC and Activation Procedure are subject to the terms of the <a href="https://nimiq.com/activation/privacy" target="_blank">Privacy Policy</a>.</p>

                <h3>VI. Miscellaneous</h3>
                <ol>
                    <li>The NET Holder agrees that if any portion of these Terms is found illegal or unenforceable, in whole or in part, such provision shall, as to such jurisdiction, be ineffective solely to the extent of such determination of invalidity or unenforceability without affecting the validity or enforceability thereof in any other manner or jurisdiction and without affecting the remaining provisions of the Terms, which shall continue to be in full force and effect.</li>
                    <li>Applicable are the laws of Tortola, BVI. Any dispute arising out of or in connection with the NET Replacement and Activation of NIM shall be exclusively and finally settled according to the dispute resolution provisions as outlined within the Crowdsale Terms.</li>
                    <li>In the event that there are any questions with respect to these terms and condition, please email us to activation[at]nimiq[dot]com and in any event, consult your legal and financial advisors.</li>
                </ol>

                <div class="same-size-buttons">
				    <a id="disagree" button class="small fixed-size secondary" href="https://www.nimiq.com">I Disagree</a>
				    <a id="agree" button class="small fixed-size" href="#terms/privacy-terms">I Agree</a>
				</div>
		    </section>
		`
    }

    onCreate() {
        this.$('#disagree').addEventListener('click', e => this._onDisagree());
        this.$('#agree').addEventListener('click', e => this._onAgree());
    }

    _onDisagree() {
        XAppState.getAppState().termsAccepted = false;
    }

    _onAgree() {
        XAppState.getAppState().termsAccepted = true;
    }
}
