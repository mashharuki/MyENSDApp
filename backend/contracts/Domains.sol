//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4;

import "hardhat/console.sol";

/**
 * Domainsコントラクト
 */
contract Domains {

  // ドメインとアドレスを紐づけるmap
  mapping(string => address) public domains;
  // ENSとURL等のデータを紐づけるmap
  mapping(string => string) public records;

  /**
   * コンストラクター
   */
  constructor() {
      console.log("THIS IS MY DOMAIN CONTRACT. NICE.");
  }

  /**
   * ドメインを登録するためのメソッド
   * @param name ドメイン名
   */
  function register(string calldata name) public {
    // そのドメインがまだ登録されていないか確認します。
    require(domains[name] == address(0));
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