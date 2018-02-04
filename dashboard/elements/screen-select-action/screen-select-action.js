import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenSelectAction extends XScreen {
    html() {
        return `
            <a>Accounts</a><a icon-add></a>
        `
    }
}

// Todo: Accounts => screen-dashboard, add: test token and redirect to activate app