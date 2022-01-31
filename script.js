const buttonValue = document.querySelectorAll("button")
const screenValue = document.querySelector("#Input");
const dispValue = document.querySelector("#Result");
let isNumber;
let BenefId;
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

        else if (buttonText === "Send Ben Id") {
            BenefId = screenValue.value;
            screenValue.value = ''
            document.getElementById("head").innerHTML = "Enter Mobile Number"
            document.getElementById("inst").innerHTML = `Now enter Mobile Number and <br><b>HIT</b> <br> <i>'Get OTP'</i> <br>Button to get OTP...`
        }

        else if (buttonText === "Get OTP") {
            Show(screenValue.value);
            screenValue.value = ''
            document.getElementById("head").innerHTML = "Enter OTP"
            document.getElementById("inst").innerHTML = `Got an OTP?<br>Enter your OTP fom <b>CoWin</b> and <br><b>HIT</b> <br> <i>'Get Cert'</i> <br>Button to download your vaccination certificate!`
        }

        else if (buttonText >= '0' && buttonText <= 9 && isNumber) {
            if (screenValue.value === '0') {
                screenValue.value = buttonText;
            }
            else {
                screenValue.value += buttonText;
            }
        }
        else if (buttonText === "GET Cert") {
            ValidateOTP(screenValue.value);
            isNumber = false;
            document.getElementById("head").innerHTML = "Done!"
            document.getElementById("inst").innerHTML = "<i><b>Thank You for using this portal</b></i>"
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
    let url = `https://cdn-api.co-vin.in/api/v2/registration/certificate/public/download?beneficiary_reference_id=${BenefId}`
    fetch(url,{
        headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json; charset = UTF-8",
                "accept" : "application/pdf"
            }
    })   
    .then(async res => ({
        filename: 'certificate',
        blob: await res.blob()
    }))
    .then(resObj => {
        
        const newBlob = new Blob([resObj.blob], { type: 'application/pdf' });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
        } else {
            const objUrl = window.URL.createObjectURL(newBlob);
            let link = document.createElement('a');
            link.href = objUrl;
            link.download = resObj.filename;
            link.click();
            setTimeout(() => { window.URL.revokeObjectURL(objUrl); }, 250);
        }
    })
    .catch((error) => {
        console.log('DOWNLOAD ERROR', error);
    });
    await console.log(token)
}

