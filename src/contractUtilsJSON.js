require('dotenv').config();

const bip39 = require('bip39');
const HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic = bip39.generateMnemonic();
const fs = require('fs');
const jsonPathLibrary = require('json-path-value');
const to = require('await-to-js').to;

const jsonPath = new jsonPathLibrary.JsonPath();
const jsonContainerFactoryJSON = JSON.parse(fs.readFileSync('./build/contracts/JsonContainerFactory.json', 'utf8'));
const jsonContainerAbi = JSON.parse(fs.readFileSync('./build/contracts/JsonContainer.json', 'utf8')).abi;
const Web3 = require('web3');
const RLP = require('rlp');
const hdprovider = new HDWalletProvider(mnemonic, "http://" + process.env.DEVELOPMENT_HOST + ":" + process.env.DEVELOPMENT_PORT);
const web3 = new Web3(hdprovider);
const gasLimit = process.env.DEVELOPMENT_GAS_LIMIT;
const GAS = gasLimit;
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
    console.log('Container creation.');
    await jsonContainerFactoryInstance.methods.createContainer(name).send(transactionObject)
        .then((tx) => {
            console.log('Transaction sent.');
            return checkTransaction(tx.transactionHash);
        });
    let events = await jsonContainerFactoryInstance.getPastEvents('ContainerCreated');
    let address = events[events.length - 1].returnValues.add;
    let jsonContainerInstance = new web3.eth.Contract(jsonContainerAbi, address);

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
    let error, estimatedGas;
    [error, estimatedGas] = await to(jsonContainerInstance.methods.initialize(encodedData).estimateGas());
    if (estimatedGas >= gasLimit || error) {
        console.log('Bulk init NOT posible: out of gas');
        let i;
        for (i = 0; i < pathValues.length; i++) {
            let pathValue = pathValues[i];
            encodedData = RLP.encode([pathValue]);
            console.log('adding -> path: ' + pathValue[0] + ', value: ' + pathValue[1]);
            await jsonContainerInstance.methods.initialize(encodedData).send(transactionObject)
                .then((tx) => {
                    console.log('Transaction sent.');
                    return checkTransaction(tx.transactionHash);
                });
        }
    } else if (error) {
        console.log(error);
    } else {
        console.log('Bulk init posible.');
        await jsonContainerInstance.methods.initialize(encodedData).send(transactionObject)
            .then((tx) => {
                console.log('Transaction sent.');
                return checkTransaction(tx.transactionHash);
            });
    }
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
    if (differences.length == 0) {
        console.log('No changes detected.');
        return;
    }
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
    let error, estimatedGas;
    [error, estimatedGas] = await to(jsonContainerInstance.methods.update(encodedDataUpdate).estimateGas());
    if (estimatedGas >= gasLimit || error) {
        console.log('Bulk update NOT posible: out of gas');
        let i;
        for (i = 0; i < changes.length; i++) {
            let difference = changes[i];
            let encodedDataUpdate = RLP.encode([difference]);
            let diff = getDiff(difference[3]);
            console.log(diff + ': ' + difference[0]);
            await jsonContainerInstance.methods.update(encodedDataUpdate).send(transactionObject)
                .then((tx) => {
                    console.log('Transaction sent.');
                    return checkTransaction(tx.transactionHash);
                });
        }
    } else if (error) {
        console.log(error);
    } else {
        console.log('Bulk update posible.');
        await jsonContainerInstance.methods.update(encodedDataUpdate).send(transactionObject)
            .then((tx) => {
                console.log('Transaction sent.');
                return checkTransaction(tx.transactionHash);
            });
    }
}

function getDiff(differenceNumber) {
    if (differenceNumber == 0) {
        return 'Adding';
    } else if (differenceNumber == 1) {
        return 'Deleting';
    } else {
        return 'Modifying';
    }
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

function checkTransaction(tx) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            web3.eth.getTransactionReceipt(tx,
                function (err, status) {
                    if (err) {
                        console.log('KO');
                        reject(err);
                    } else if (!status) {
                        console.log('Checking transaction ...');
                        checkTransaction(tx);
                    }
                    else if (GAS == status.gasUsed) {
                        //transaction error
                        console.log('Out of gas.');
                        reject();
                    } else {
                        console.log('Transaction mined.');
                        resolve();
                    }
                }
            );
        }, 1000);
    });
}