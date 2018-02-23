import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenWelcome extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Validation Tool</nimiq-logo>
            <h1>Welcome to Account Access Validation</h1>
            <p>Here you can validate your Account Access File or your Recovery Phrase:</p>
            <x-grow></x-grow>
            <x-grow></x-grow>
            <a button href="#backup-file-import">Validate Access File</a>
            <a button href="#backup-phrase-import">Validate Recovery Phrase</a>
        `
    }
}