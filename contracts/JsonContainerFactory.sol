pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Structs.sol";
import "./JsonContainer.sol";
import "../node_modules/solidity-rlp/contracts/RLPReader.sol";


contract JsonContainerFactory is Structs {

  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;



  Container[] private containers_;


  address private _owner;

  constructor() public {
    _owner = tx.origin;
  }

  modifier onlyOwner() {
    require(isOwner());
    _;
  }

  function isOwner() public view returns(bool) {
    return tx.origin == _owner;
  }

  function createContainer(bytes memory _in, string _name) onlyOwner public {
    RLPReader.RLPItem memory item = _in.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();

    uint listLength = itemList.length;
    PathValue[] memory data = new PathValue[](listLength);
    for (uint i = 0; i < listLength; i++) {
      PathValue memory pathValue = PathValue(
        string(itemList[i].toList()[0].toBytes()),
        string(itemList[i].toList()[1].toBytes()),
        string(itemList[i].toList()[2].toBytes())
      );
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