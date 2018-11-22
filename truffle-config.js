require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");

var Web3 = require('web3');




module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      provider: () =>{ 
        return new HDWalletProvider(process.env.DEVELOPMENT_MNEMONIC, "http://"+process.env.DEVELOPMENT_HOST+":"+ process.env.DEVELOPMENT_PORT);     
      },
      gasPrice: 0,
      network_id: '*',
    },
    alastria: {
      provider: () =>{
        var hdprovider =new HDWalletProvider(process.env.ALASTRIA_MNEMONIC, process.env.ALASTRIA_URL); 
        Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
        const _user = process.env.ALASTRIA_USER;
        const _password = process.env.ALASTRIA_PASSWORD;
        const _auth = 'Basic ' + Buffer.from(_user + ':' + _password).toString('base64');
        const _headers = [{name: 'Authorization', value: _auth}];
        const _provider = new Web3.providers.HttpProvider(process.env.ALASTRIA_URL, {timeout: 0, headers: _headers });

        hdprovider.engine.stop()
        hdprovider.engine._providers[2].provider=_provider
        hdprovider.engine.start()
        return    hdprovider; 
      },
      gasPrice: 0,
      network_id: '*',
    }
  }
};
