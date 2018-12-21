var qrcode = require('qrcode-terminal');

qrcode.generate('0x0D16730cc6bf84aAAe867CB6662e704D6e954a4C', function (str) { 
    console.log(str);
});