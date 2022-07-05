/**
 * 本番用のデプロイスクリプトファイル
 */
const main = async () => {
    // コントラクトを読み込む
    const domainContractFactory = await hre.ethers.getContractFactory("Domains");
    // コントラクトをデプロイする。
    const domainContract = await domainContractFactory.deploy("mash");
    await domainContract.deployed();
  
    console.log("Contract deployed to:", domainContract.address);
  
    // オリジナルドメインを登録・発行する。
    let txn = await domainContract.register("haruki", {
      value: hre.ethers.utils.parseEther("0.1"),
    });
    await txn.wait();
    console.log("Minted domain haruki.mash");
    // レコードを追加
    txn = await domainContract.setRecord("haruki", "https://www.resume.id/haru28675");
    await txn.wait();
    console.log("Set record for haruki.mash");
    // ドメイン名からアドレスを取得する。
    const address = await domainContract.getAddress("haruki");
    console.log("Owner of domain haruki:", address);    
    // コントラクトの残高を取得する。
    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
 };
  
const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
};
  
runMain();