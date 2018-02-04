import XScreen from '/elements/x-screen/x-screen.js';
export default class ScreenKyc extends XScreen{
	html(){
		return `
			<h1>Verify your Data</h1>
			<h2>Due to regulatory requirements we need you to verify your identity. We know that sucks, but after this step your all set.</h2>
			<a href="#success" button>Next</a>`
	}
}

// Todo: [high priority] connect to kyc backend