const buttonValue = document.querySelectorAll("button")
const screenValue = document.querySelector("#Input");
let isNumber;
let BenefId;
function refreshCalculator() {
    isNumber = true;
    screenValue.value = ''
}

refreshCalculator();
buttonValue.forEach(element => {
    element.addEventListener('click', e => {

        let buttonText = e.target.innerText;

        if (buttonText === "Proceed" && screenValue.value.toString().length ==14 ) {
            BenefId = screenValue.value;
            screenValue.value = ''
            document.getElementById("label").innerHTML = "Mobile Number"
            document.getElementById("button").innerHTML = `<button class="grid-item sign" onclick="getOTP(screenValue.value)" >Get OTP</button>`
        }
        else alert('Enter correct Beneficiary Id')
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
    try{
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
            .then(function(data){txn = data.txnId})
        return txn
        }
        catch(err){
            alert('Too many requests!');
        }
}

async function GetToken(str){
    await fetch("https://cdn-api.co-vin.in/api/v2/auth/public/confirmOTP",{
            method: 'POST',
            body: JSON.stringify(
                {
                    "otp": str,
                    "txnId": txnid
                }
            ),
            headers: {
                "Content-Type": "application/json; charset = UTF-8"
            }
        })
        .then(function(response){return response.json()})
        .then(function(data){tkn = data.token})
    return tkn
}

async function getOTP(str){
    try{
        if(screenValue.value.toString().length==10){

            screenValue.value = ''
            document.getElementById("label").innerHTML = "Enter OTP"
            document.getElementById("button").innerHTML = `<button class="grid-item AbsBtn" style="background-color: red; color: white;" onclick="ValidateOTP(screenValue.value)">Verify & Download</button>`
            
            txnid = await GetId(str)

        }else(alert('Mobile Number must contain 10 digits'))
    }
    catch(err){alert(err.message)}
}


async function ValidateOTP(str){
    if (screenValue.value.toString().length==6){

        screenValue.value = ''
        otp = await hash(str)
        token = await GetToken(otp)
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

    }else(alert('Enter correct OTP'))
}

