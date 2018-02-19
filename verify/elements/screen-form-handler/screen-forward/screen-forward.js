import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenForward extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation</nimiq-logo>
            <h1>Data uploaded successfully</h1>
            <h2>Click the button below to start the KYC process.</h2>
            <p>We also sent you an email that contains a link to start the KYC process later.</p>
            <a button href="#">Start the KYC process</a>
        `
    }

    onCreate() {
        this.$a = this.$('a');
    }

    setKycUrl(url) {
        this.$a.href = url;
    }
}