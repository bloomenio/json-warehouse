pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Structs.sol";
import "./JsonContainer.sol";
import "../node_modules/solidity-rlp/contracts/RLPReader.sol";

contract JsonContainerFactory is Structs {

    event ContainerCreated(string indexed name, address add);

    using RLPReader for bytes;
    using RLPReader for uint;
    using RLPReader for RLPReader.RLPItem;

    Container[] private containers_;

    function createContainer(string _name) public {
        JsonContainer container = new JsonContainer();
        containers_.push(Container(address(container), _name));
        emit ContainerCreated(_name, address(container));
    }

    function getContainers() public view returns (Container[]) {
        return containers_;
    }

}