const SmartyStreetsSDK = require("smartystreets-javascript-sdk");
const SmartyStreetsCore = SmartyStreetsSDK.core;
const Lookup = SmartyStreetsSDK.usStreet.Lookup;

 let authId = 'YOUR_AUTH_ID_HERE'; // YOUR Auth id here
 let authToken = 'YOUR_AUTH_TOKEN_HERE'; // YOUR Auth token here

let clientBuilder = new SmartyStreetsCore.ClientBuilder(new SmartyStreetsCore.StaticCredentials(authId, authToken));
let client = clientBuilder.buildUsStreetApiClient();

//returns 1 if address is valid and -1 if not
async function addressValidation_controller(body) {
    try {
        const result = await validateAddress(body);
        console.log(result); // Output will be 1 if the address is valid
        return result;
    } catch (error) {
        console.error(error);
        return -1;
    }
}

async function validateAddress(body) {

    let lookup = new Lookup();
    lookup.street = body.shipping_address.line1;
    lookup.city = body.shipping_address.city;
    lookup.state = body.shipping_address.state;
    lookup.maxCandidates = 10;

    try {
        let response = await client.send(lookup);
        return handleSuccess(response);
    } catch (error) {
        return handleError(error);
    }
}

async function handleSuccess(response) {
    let lookup = response.lookups[0];
    lookup.result.map(candidate => console.log(`${candidate.deliveryLine1}, ${candidate.lastLine}`));
    if (lookup.result.length > 0) {
        return 1;
    } else {
        return -1;
    }
}

async function handleError(response) {
    console.log(response);
    return -1;
}

module.exports = { addressValidation_controller };
