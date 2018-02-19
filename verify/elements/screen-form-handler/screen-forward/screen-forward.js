import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenForward extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation</nimiq-logo>
            <h1>Data uploaded successfully</h1>
            <h2>Click the button below to start Identity Verification now.</h2>
            <p>We are also sending you an email with a link to re-enter Identity Verification later.</p>
            <a button href="#">Start Verification</a>
        `
    }

    onCreate() {
        this.$a = this.$('a');
    }

    setKycUrl(url) {
        this.$a.href = url;
    }
}