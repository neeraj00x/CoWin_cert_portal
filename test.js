const buttonValue = document.querySelectorAll("button")
const screenValue = document.querySelector("#Input");
const dispValue = document.querySelector("#Result");
let isNumber;

function refreshCalculator() {
    isNumber = true;
    screenValue.value = ''
    dispValue.value = ''
}

refreshCalculator();
buttonValue.forEach(element => {
    element.addEventListener('click', e => {

        let buttonText = e.target.innerText;

        if (buttonText === "C") {
            refreshCalculator();
        }
        else if (buttonText === '.' && isNumber && !screenValue.value.includes('.') ) {
            if (screenValue.value == ''){
                screenValue.value += '0.';
            }
            else {
                screenValue.value += buttonText;
            }
        }

        else if (buttonText === "⌫") {
            screenValue.value = screenValue.value.slice(0,-1);
        }

        else if (buttonText === "+/-" && screenValue.value != '') {
            Show(screenValue.value);
            screenValue.value = ''
        }

        else if (buttonText >= '0' && buttonText <= 9 && isNumber) {
            if (screenValue.value === '0') {
                screenValue.value = buttonText;
            }
            else {
                screenValue.value += buttonText;
            }
        }
        else if (buttonText === "OTP") {
            ValidateOTP(screenValue.value);
            isNumber = false;
        }
    })
});

let txnid=''

async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
}

async function GetId(str){
    await fetch("https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP",{
                method: 'POST',
                body: JSON.stringify({
                    "mobile": str
                }),
                headers: {
                    "Content-Type": "application/json; charset = UTF-8"
                }
            })
            .then(function(response){return response.json()})
            .then(function(data){console.log(data); txn = data.txnId})
    return txn
}

async function GetToken(str){
    let Token = await fetch("https://cdn-api.co-vin.in/api/v2/auth/public/confirmOTP",{
                        method: 'POST',
                        body: JSON.stringify(
                            {
                                "otp": otp,
                                "txnId": txnid
                            }
                        ),
                        headers: {
                            "Content-Type": "application/json; charset = UTF-8"
                        }
                    })
                    .then(function(response){return response.json()})
                    .then(function(data){tkn = data.token
                    console.log(data,'abc')
                    })
    return tkn
}

async function Show(str){
    txnid = await GetId(str),
    await console.log(txnid);
}

async function ValidateOTP(str){
    otp = await hash(str)
    token = await GetToken(str)
    fetch("https://cdn-api.co-vin.in/api/v2/registration/certificate/public/download?beneficiary_reference_id=34667850477469",{
        headers: {
                Authentication: token,
                "Content-Type": "application/json; charset = UTF-8"
            }
    })
    .then(function(response){return response.json()})
    .then(function(data){console.log(data)})
    await console.log(token)
}