// Method 1
//_____________________________________________________________________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________________________________________________________________


var req = new XMLHttpRequest();  
req.responseType = "blob";
req.open("GET", "https://cdn-api.co-vin.in/api/v2/registration/certificate/public/download?beneficiary_reference_id=34667850477469", true);
req.setRequestHeader('Content-Type', 'application/json');
req.onreadystatechange = function () {
    if (req.readyState === 4 && req.status === 200) {
        if (typeof window.chrome !== 'undefined') {
            // Chrome version
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(req.response);
            link.download = outputFileName;
            link.click();
        } else if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE version
            var blob = new Blob([req.response], { type: 'application/pdf' });
            window.navigator.msSaveBlob(blob, outputFileName);
        } else {
            // Firefox version
            var file = new File([req.response], outputFileName, { type: 'application/force-download' });
            window.open(URL.createObjectURL(file));
        }
        callback();
    }
};
req.send(JSON.stringify([JSON_OBJECT]));


let fnGetFileNameFromContentDispostionHeader = function (header) {
    let contentDispostion = header.split(';');
    const fileNameToken = `filename*=UTF-8''`;

    let fileName = 'downloaded.pdf';
    for (let thisValue of contentDispostion) {
        if (thisValue.trim().indexOf(fileNameToken) === 0) {
            fileName = decodeURIComponent(thisValue.trim().replace(fileNameToken, ''));
            break;
        }
    }

    return fileName;
};


// Method 2
//_____________________________________________________________________________________________________________________________________________________________________
//_____________________________________________________________________________________________________________________________________________________________________




let fnGetFileNameFromContentDispostionHeader = function (header) {
    let contentDispostion = header.split(';');
    const fileNameToken = `filename*=UTF-8''`;

    let fileName = 'downloaded.pdf';
    for (let thisValue of contentDispostion) {
        if (thisValue.trim().indexOf(fileNameToken) === 0) {
            fileName = decodeURIComponent(thisValue.trim().replace(fileNameToken, ''));
            break;
        }
    }

    return fileName;
};

let postInfo = {
    id: 0,
    name: 'foo'
};

let headers = new Headers();
headers.append('Content-Type', 'application/json');

fetch(`api/GetPdf`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(postInfo)
})
    .then(async res => ({
        filename: fnGetFileNameFromContentDispostionHeader(res.headers.get('content-disposition')),
        blob: await res.blob()
    }))
    .then(resObj => {
        // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
        const newBlob = new Blob([resObj.blob], { type: 'application/pdf' });

        // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
        } else {
            // For other browsers: create a link pointing to the ObjectURL containing the blob.
            const objUrl = window.URL.createObjectURL(newBlob);

            let link = document.createElement('a');
            link.href = objUrl;
            link.download = resObj.filename;
            link.click();

            // For Firefox it is necessary to delay revoking the ObjectURL.
            setTimeout(() => { window.URL.revokeObjectURL(objUrl); }, 250);
        }
    })
    .catch((error) => {
        console.log('DOWNLOAD ERROR', error);
    });