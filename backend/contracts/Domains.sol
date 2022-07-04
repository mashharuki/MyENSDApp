//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "hardhat/console.sol";
import { StringUtils } from "./lib/StringUtils.sol";

/**
 * Domainsコントラクト
 */
contract Domains {

  // トップレベルドメイン(TLD)
  string public tld;

  // ドメインとアドレスを紐づけるmap
  mapping(string => address) public domains;
  // ENSとURL等のデータを紐づけるmap
  mapping(string => string) public records;

  /**
   * コンストラクター
   * @param _tld トップレベルドメイン
   */
  constructor(string memory _tld) payable {
    tld = _tld;
    console.log("%s name service deployed", _tld);
  }

  /**
   * ドメインの長さによって価格を算出するメソッド
   * @param name ドメイン名
   */
  function price(string calldata name) public pure returns(uint) {
    // ドメインの長さを算出する。
    uint len = StringUtils.strlen(name);
    // 長さによって値が変更する。
    require(len > 0);
    if (len == 3) { // 3文字のドメインの場合 
      return 0.005 * 10**18; // 5 MATIC = 5 000 000 000 000 000 000 (18ケタ).
    } else if (len == 4) { //4文字のドメインの場合
      return 0.003 * 10**18; // 0.003MATIC
    } else { // 4文字以上
      return 0.001 * 10**18; // 0.001MATIC
    }
  }

  /**
   * ドメインを登録するためのメソッド
   * @param name ドメイン名
   */
  function register(string calldata name) public payable {
    // そのドメインがまだ登録されていないか確認します。
    require(domains[name] == address(0));
    // ドメイン名のミントに必要な金額を算出する。
    uint _price = price(name);
    // 十分な残高を保有しているかどうかチェックする。
    require(msg.value >= _price, "Not enough Matic paid");

    // 登録する。
    domains[name] = msg.sender;
    console.log("%s has registered a domain!", msg.sender);
  }

  /**
   * ドメイン名をキーとしてアドレスを取得するメソッド
   * @param name ドメイン名
   */
  function getAddress(string calldata name) public view returns (address) {
      return domains[name];
  }

  /**
   * レコードを登録する
   * @param name ドメイン名
   * @param record ENSと紐づけるデータ
   */
  function setRecord(string calldata name, string calldata record) public {
      // トランザクションの送信者であることを確認しています。
      require(domains[name] == msg.sender);
      // 登録する。
      records[name] = record;
  }

  /**
   * ENSを元にデータを返すメソッド
   * @param name ドメイン名
   */
  function getRecord(string calldata name) public view returns(string memory) {
      return records[name];
  }
}