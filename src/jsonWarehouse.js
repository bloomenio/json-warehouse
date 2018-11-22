#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const utils = require('./contractUtilsJSON');
const jsonPathLibrary = require('json-path-value');
const jsonPath = new jsonPathLibrary.JsonPath();
const prettyJson = require('prettyjson');

const jsonPrintOptions = {
    noColor: false
};

async function newContainer() {
    var files = fs.readdirSync('./src/json/');
    var questions = [
        { type: 'input', name: 'name', message: 'Give a name' },
        { type: 'list', name: 'folder', message: 'Select a data type', choices: files }
    ];
    console.log('Create a new JSON container.');
    var answer = await inquirer.prompt(questions);
    files = fs.readdirSync('./src/json/' + answer.folder);
    questions = [
        { type: 'list', name: 'file', message: 'Select a file', choices: files }
    ];
    var answerFile = await inquirer.prompt(questions);
    var json = JSON.parse(fs.readFileSync('./src/json/' + answer.folder + '/' + answerFile.file, 'utf8'));
    await utils().createContainer(json, answer.name);
    console.log(answer.name + ' container crated.');
}

async function getData() {
    var containers = await utils().getContainers();
    var containersMetadata = [];
    var i;
    for (i = 0; i < containers.length; i++) {
        containersMetadata.push({ name: containers[i].name, value: containers[i].add });
    }
    if (containersMetadata.length == 0) {
        console.log("There are no containers.");
        return;
    }
    var questions = [
        { type: 'list', name: 'container', message: 'Choose a container', choices: containersMetadata }
    ];
    console.log('Get data from a container');
    var answer = await inquirer.prompt(questions);
    console.log(prettyJson.render(jsonPath.unMarshall(await utils().get(answer.container)), jsonPrintOptions));
}

async function update() {
    var containers = await utils().getContainers();
    var containersMetadata = [];
    var i;
    for (i = 0; i < containers.length; i++) {
        containersMetadata.push({ name: containers[i].name, value: containers[i].add });
    }
    if (containersMetadata.length == 0) {
        console.log("There are no containers.");
        return;
    }
    var files = fs.readdirSync('./src/json/');
    var questions = [
        { type: 'list', name: 'container', message: 'Choose a container', choices: containersMetadata },
        { type: 'list', name: 'folder', message: 'Select a data type', choices: files }
    ];
    console.log('Update data of a JSON container');
    var answer = await inquirer.prompt(questions);
    files = fs.readdirSync('./src/json/' + answer.folder);
    questions = [
        { type: 'list', name: 'file', message: 'Select a file', choices: files }
    ];
    var answerFile = await inquirer.prompt(questions);
    var json = JSON.parse(fs.readFileSync('./src/json/' + answer.folder + '/' + answerFile.file, 'utf8'));
    await utils().updateContainer(json, answer.container);
    console.log('Result:\n' + prettyJson.render(jsonPath.unMarshall(await utils().get(answer.container)), jsonPrintOptions));
    console.log('Container updated.');
}

program
    .command('new-container')
    .alias('nc')
    .description('Create a new JSON container.')

    .action(newContainer);

program
    .command('get-data')
    .alias('gd')
    .description('Get data from a JSON container.')

    .action(getData);

program
    .command('update')
    .alias('u')
    .description('Update data of a JSON container')

    .action(update);

figlet.text('JSON Warehouse', {
    font: 'slant'
}, async function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
    program.parse(process.argv);
    if (program.args.length == 0) {
        var menuOptions = [
            { name: "Create a new container", value: newContainer },
            { name: "Get data from a container", value: getData },
            { name: "Update container data", value: update }
        ];
        var questions = [
            { type: "list", name: "menu", message: "What do you want to do?", choices: menuOptions }
        ];
        var answer = await inquirer.prompt(questions);
        answer.menu();
    }
});