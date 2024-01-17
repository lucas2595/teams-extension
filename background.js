globalThis.requests = {}

async function getBody(requestDetails) {
	// First we intercept the original recording request and inject the
	// language parameter. We can't send the injected request here because
	// we can't overwrite the headers here. Here's the only place we can
	// read the POST body, so we save it in a global variable to be used
	// later.

	if (!requestDetails.url.includes("?lucas") && // do not go through injected requests (to avoid looping)
		requestDetails.url.includes("oncommand") &&
		requestDetails.method == "POST") {

		// Decode the body
		let postedString = decodeURIComponent(
			String.fromCharCode.apply(
				null,
				new Uint8Array(requestDetails.requestBody.raw[0].bytes)
			));
		let postBody = JSON.parse(postedString)

		// Check if it's really a start recording request and nothing else
		if (
			postBody.action == "start" &&
			postBody.actionParameters &&
			postBody.actionParameters.recordingFeatures &&
			postBody.actionParameters.recordingStorageSettings
		) {

			// Inject the language
			postBody.actionParameters.spokenLanguage = "pt-br"

			// Save the body in a global var
			globalThis.requests[requestDetails.url] = postBody
		}
	}
}

async function getHeadersAndSend(requestDetails) {
	// Then we intercept the original recording request here again to read
	// the headers and send a new request combining them with the body from
	// the global variable.

	if (
		!requestDetails.url.includes("?lucas") && // do not go through injected requests (to avoid looping)
		requestDetails.url.includes("oncommand") &&
		requestDetails.method == "POST" &&
		globalThis.requests[requestDetails.url]) { // only if there's something in the global var

		// Map the headers to an object structure and prepare them to be used in a fetch request
		let pHeaders = requestDetails.requestHeaders.reduce((acc, val) => {
			acc[val.name] = val.value
			return acc
		}, {})
		let postHeaders = new Headers(pHeaders) 

		// Create the request using the body from the global var.
		let requestOptions = {
			method: "POST",
			headers: postHeaders,
			body: JSON.stringify(globalThis.requests[requestDetails.url]) // body from before
		}

		// Send the recording request with the language parameter a param to avoid looping
		await fetch(requestDetails.url + "?lucas", requestOptions) 

		// Cancel the original recording request
		return {cancel: true}


		// Another option is to send a second request without blocking the first one (not tested)
		/*let requestOptions = { 
			headers: postHeaders,
			body: JSON.stringify({
				"timestamp": globalThis.requests[requestDetails.url].timestamp,
				"participantMri": globalThis.requests[requestDetails.url].participantMri,
				"participantLegId": globalThis.requests[requestDetails.url].participantLegId,
				"action": "setLanguage",
				"mode": "transcription",
				"processingModes": [
					"closedCaptions"
				],
				"actionParameters": {
					"spokenLanguage": "pt-br",
					"type": "setLanguage"
				}
			})
		}
		fetch(requestDetails.url + "?lucas", requestOptions)
		return
		*/
	}
}


// To use these, we need to use manifest v2.
chrome.webRequest.onBeforeRequest.addListener(getBody, {
	urls: ["<all_urls>"],
}, ['requestBody', "blocking"]);

chrome.webRequest.onBeforeSendHeaders.addListener(getHeadersAndSend, {
	urls: ["<all_urls>"],
}, ['requestHeaders', "blocking"]);

