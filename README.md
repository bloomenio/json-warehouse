# Json Warehouse
Json Warehouse is a blockchain based data storage and management system. It uses solidity smart contracts to save data in Ethereum's blockchain in JsonPath format.
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
## Usage
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
## Going deeper
### JsonPath format
Json Warehouse depends on a library named [JSON PATH VALUE](https://github.com/worldline-spain/json-path-value). This library deserializes JSON data into **JsonPath** format.

Each value of a JSON object can be written as a path-value pair, so the path describes de way to reach the value.

As we can see in the following example (extracted from the JSON PATH VALUE readme):
```auto
{
	"a": "a",
	"b" : {
		"c" : 1
	}	
}
```
the value _1_ of the attribute _c_ of the attribute _b_ can be expressed as _b.c = 1_, so the path is _b.c_ and the value is _1_. Furthermore, the type of the value is a number. Thus, putting this together, we can represent the JSON object this way:

| PATH   |     VALUE      |  TYPE |
|----------|:-------------:|------:| 
| a |  "a"| string |
| b.c |    1|   number | 

JSON PATH VALUE also can gather each tuple of these to put it together back two a JSON object; and compares two JSON to get the differences between them in JsonPath format (for more information, please refer to [JSON PATH VALUE github repository](https://github.com/worldline-spain/json-path-value)).

### Json Containers
As we explained above, Json Warehouse uses smart contracts deployed on the blockchain to store JSON data in JsonPath format. Each smart contract stores one JSON object, so we call this JsonContainer. The smart contract that creates Json Containers is called JsonContainerFactory.

The advantage of storing JSON data this way is to be able to change a single attribute without overwriting the whole object. For example, having this song metadata (in [JSON-LD](https://json-ld.org/) format):

```auto
{
    "@type": "MusicComposition",
    "@id": "http://musicbrainz.org/work/fd1aa4f2-ba26-3a05-b72d-4392c35a073c",
    "name": "A Day in the Life",
    "composer": [
        {
            "@type": "Person",
            "name": "John lennon",
            "@id": "http://musicbrainz.org/artist/4d5447d7-c61c-4120-ba1b-d7f471d385b9"
        },
        {
            "@type": "Person",
            "name": "Paul McCartney",
            "@id": "http://musicbrainz.org/artist/ba550d0e-adac-4864-b88b-407cab5e76af"
        }
    ],
    ...
}
```
if we want to change the name of the first composer from _John lennon_ to _John Lennon_ (in order to fix surname), we don't need to load the entire JSON file to the container; instead, JSON PATH VALUE will check the differences between the stored JSON and the new one, as shown in the following table:

| PATH   |     VALUE      |  TYPE |  DIFF|
|----------|:-------------:|------:| ----:|
| composer[0].name |  "John Lennon"| string | Modified|

so we only change that path-value tuple saving a lot of resources.
### Example of usage
Once we have Json Warehouse ready, if we type **_jwh_**, the program shows us the menu:

![m1](img/menu_1.jpg)

Let's select _Create a new container_. The program asks us to specify a name for the container and to select a JSON file to store within it.

![cc1](img/create_container_1.jpg)

Some JSON examples are included. If you want to add some custom data, just add the _.json_ file to the _json_ folder. In this example, we select _modern_family.json_.

![cc2](img/create_container_2.jpg)

Now we want to check the already stored data. Just select _Get data from a container_ at the menu and chose the desired existing container.

![gd1](img/get_data_1.jpg)

At this point, we want to change some data: the video format now is HD and let's add an additional subtitle language. So the changes, in JsonPath format, are:

| PATH   |     VALUE      |  TYPE |  DIFF|
|----------|:-------------:|------:| ----:|
| videoFormat |  "HD"| string | Modified|
| subtitleLanguage | "es" | string | Deleted |
| subtitleLanguage[0] | "es" | string | Added |
| subtitleLanguage[1] | "en" | string | Added |

So let's update the container selecting _Update container data_:

![uc1](img/update_container_1.jpg)

![uc2](img/update_container_2.jpg)

We can see that the container data has been correctly fixed.
