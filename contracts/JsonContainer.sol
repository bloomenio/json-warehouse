pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Strings.sol";
import "./lib/Structs.sol";
import "../node_modules/solidity-rlp/contracts/RLPReader.sol";

contract JsonContainer is Structs {

  using Strings for *;
  using RLPReader for bytes;
  using RLPReader for uint;
  using RLPReader for RLPReader.RLPItem;

  mapping (bytes32 => uint[]) private hashIndexMap_;

  PathValue[] private data_;

  function getData() public view returns (PathValue[]) {
    return data_;
  }

  function initialize(PathValue[] _data) public {
    for (uint i = 0;i < _data.length; i++) {
      PathValue memory pathValue = _data[i];
      _addPath(pathValue.path, pathValue.value, pathValue.valueType);
    }
  }

  function update(bytes memory _in) public {
    RLPReader.RLPItem memory item = _in.toRlpItem();
    RLPReader.RLPItem[] memory itemList = item.toList();
    for (uint i = 0; i < itemList.length; i++) {
      uint difference = itemList[i].toList()[3].toUint();
      if (difference == 0) { //addition
        _addPath(string(itemList[i].toList()[0].toBytes()), string(itemList[i].toList()[1].toBytes()), string(itemList[i].toList()[2].toBytes()));
      } else if (difference == 1) { //deletion
        _deletePath(string(itemList[i].toList()[0].toBytes()));
      } else { //modification
        _modifyPath(string(itemList[i].toList()[0].toBytes()), string(itemList[i].toList()[1].toBytes()), string(itemList[i].toList()[2].toBytes()));
      }
    }
  }

  function _addPath(string _path, string _value, string _valueType) internal {
    bytes32 pathHash = keccak256(bytes(_path));
    uint[] memory indexArray = hashIndexMap_[pathHash];
    if (indexArray.length > 0) {
      for (uint i = 0; i < indexArray.length; i++) {
        string memory storedPath = data_[indexArray[i]].path;
        require(!storedPath.toSlice().equals(_path.toSlice()));
      }
    }
    PathValue memory pathValue = PathValue(_path, _value, _valueType);
    for (i = 0; i < data_.length; i++) {
      if (data_[i].path.toSlice().empty()) {
        data_[i] = pathValue;
        hashIndexMap_[pathHash].push(i);
        return;
      }
    }
    data_.push(pathValue);
    hashIndexMap_[pathHash].push(data_.length - 1); 
  }

  function _deletePath(string _path) internal {
    bytes32 pathHash = keccak256(bytes(_path));
    uint[] memory indexArray = hashIndexMap_[pathHash];
    require(indexArray.length > 0);
    for (uint i = 0; i < indexArray.length; i++) {
      string memory storedPath = data_[indexArray[i]].path;
      if (storedPath.toSlice().equals(_path.toSlice())) {
        delete data_[indexArray[i]];
        delete hashIndexMap_[pathHash];
      }
    }
  }

  function _modifyPath(string _path, string _value, string _valueType) internal {
    bytes32 pathHash = keccak256(bytes(_path));
    uint[] memory indexArray = hashIndexMap_[pathHash];
    require(indexArray.length > 0);
    for (uint i = 0; i < indexArray.length; i++) {
      string memory storedPath = data_[indexArray[i]].path;
      if (storedPath.toSlice().equals(_path.toSlice())) {
        data_[indexArray[i]] = PathValue(_path, _value, _valueType);
        return;
      }
    }
  }

}