# Json Warehouse
Json Warehouse is a blockchain based data storage and management system. It uses solidity smart contracts to save data in Ethereum's blockchain in json-path format.
## Getting started
### Requirements
#### Node.js
Download it [here](https://nodejs.org/en/)
### Steps
1. Clone
    ```console 
    > git clone https://github.com/bloomenio/json-warehouse.git
    ```
2. Install dependencies
    ```console 
    > cd json-warehouse
    > npm install
    ```
3. Link
    ```console
    > npm link
    ```
4. Set up blockchain
    
    Configure your own *.env* file by adding the HD wallets mneemonic to the following *.env.example* snippet:
    ```
    DEVELOPMENT_MNEMONIC="custom mnemonic phrase"
    DEVELOPMENT_HOST="127.0.0.1"
    DEVELOPMENT_PORT=8545
    DEVELOPMENT_NETWORKID=123456
    ```
    Open a new terminal window and run ganache-cli
    ```console
    > npm start ganache
    ```
    Switch to the previous terminal window and deploy de smart contract
    ```console
    > npm start development
    ```
### Usage
Now you can start storing data.
```console
> jsonwarehouse --help
       _______ ____  _   __   _       __                __
      / / ___// __ \/ | / /  | |     / /___ _________  / /_  ____  __  __________
 __  / /\__ \/ / / /  |/ /   | | /| / / __ `/ ___/ _ \/ __ \/ __ \/ / / / ___/ _ \
/ /_/ /___/ / /_/ / /|  /    | |/ |/ / /_/ / /  /  __/ / / / /_/ / /_/ (__  )  __/
\____//____/\____/_/ |_/     |__/|__/\__,_/_/   \___/_/ /_/\____/\__,_/____/\___/

Usage: jsonWarehouse [options] [command]

Options:
  -v --version      output the version number
  -h, --help        output usage information

Commands:
  new-container|nc  Create a new JSON container.
  get-data|gd       Get data from a JSON container.
  update|u          Update data of a JSON container
  Empty command triggers the menu.

Examples:
  $ jwh
  $ jsonwarehouse nc
  $ jwh get-data
  $ jwh --version
```