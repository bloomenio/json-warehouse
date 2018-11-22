pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Structs.sol";
import "./JsonContainer.sol";
import "../node_modules/solidity-rlp/contracts/RLPReader.sol";

contract JsonContainerFactory is Structs {

    using RLPReader for bytes;
    using RLPReader for uint;
    using RLPReader for RLPReader.RLPItem;

    Container[] private containers_;

    function createContainer(bytes memory _in, string _name) public {
        RLPReader.RLPItem memory item = _in.toRlpItem();
        RLPReader.RLPItem[] memory itemList = item.toList();

        PathValue[] memory data = new PathValue[](itemList.length);
        for (uint i = 0; i < itemList.length; i++) {
            PathValue memory pathValue = PathValue(string(itemList[i].toList()[0].toBytes()), string(itemList[i].toList()[1].toBytes()), string(itemList[i].toList()[2].toBytes()));
            data[i] = pathValue;
        }

        JsonContainer container = new JsonContainer();
        container.initialize(data);
        containers_.push(Container(address(container), _name));
    }

    function getContainers() public view returns (Container[]) {
        return containers_;
    }

}