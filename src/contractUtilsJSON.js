require('dotenv').config();

const bip39 = require('bip39');
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = bip39.generateMnemonic();
const fs = require('fs');
const jsonPathLibrary = require('json-path-value');
const jsonPath = new jsonPathLibrary.JsonPath();
const jsonContainerFactoryJSON = JSON.parse(fs.readFileSync('./build/contracts/JsonContainerFactory.json', 'utf8'));
const jsonContainerAbi = JSON.parse(fs.readFileSync('./build/contracts/JsonContainer.json', 'utf8')).abi;
const GAS = 100000000;
const Web3 = require('web3');
const RLP = require('rlp');
const hdprovider = new HDWalletProvider(mnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);
const web3 = new Web3(hdprovider);
const transactionObject = {
    from: hdprovider.getAddress(0),
    gas: GAS,
    gasPrice: 0
};
const jsonContainerFactoryInstance = new web3.eth.Contract(jsonContainerFactoryJSON.abi, jsonContainerFactoryJSON.networks[process.env.DEVELOPMENT_NETWORKID].address);

async function _getContainers() {
    let data = await jsonContainerFactoryInstance.methods.getContainers().call(transactionObject);
    return data;
}

async function _createContainer(json, name) {
    let jsonPathPairs = jsonPath.marshall(json, "", []);
    let pathValues = [];
    for (i = 0; i < jsonPathPairs.length; i++) {
        let pathValue = [];
        pathValue.push(jsonPathPairs[i].getPath());
        pathValue.push(jsonPathPairs[i].getValue());
        pathValue.push(jsonPathPairs[i].getType());
        pathValues.push(pathValue);
    }
    let encodedData = RLP.encode(pathValues);
    await jsonContainerFactoryInstance.methods.createContainer(encodedData, name).send(transactionObject);
}

async function _get(address) {
    let jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    let result = await jsonContainerInstance.methods.getData().call(transactionObject);
    let storedJsonPathPairs = [];
    let i;
    for (i = 0; i < result.length; i++) {
        let jsonPathValue = result[i];
        let type = jsonPathValue[2];
        let value;
        if (jsonPath.TYPE_ARRAY == type) {
            value = JSON.parse(jsonPathValue[1]);
        } else {
            value = jsonPathValue[1];
        }
        storedJsonPathPairs.push(new jsonPathLibrary.JsonPathPair(jsonPathValue[0], value, type, -1));
    }
    return storedJsonPathPairs;
}

async function _updateContainer(json, address) {
    let jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);
    let unmarshalledStorage = jsonPath.unMarshall(await _get(address));
    let differences = jsonPath.compareJsonPath(unmarshalledStorage, json);
    let i;
    let changes = [];
    for (i = 0; i < differences.length; i++) {
        let pathValueDiff = [];
        let difference = differences[i];
        pathValueDiff.push(difference.path);
        if (difference.type == jsonPath.TYPE_STRING) {
            pathValueDiff.push(difference.value);
        } else {
            pathValueDiff.push(JSON.stringify(difference.value));
        }
        pathValueDiff.push(difference.type);
        pathValueDiff.push(difference.diff);
        changes.push(pathValueDiff);
    }
    let encodedDataUpdate = RLP.encode(changes);
    await jsonContainerInstance.methods.update(encodedDataUpdate).send(transactionObject);
}

module.exports = (function () {
    hdprovider.engine.stop();
    return {
        getContainers: _getContainers,
        get: _get,
        createContainer: _createContainer,
        updateContainer: _updateContainer
    }
});
