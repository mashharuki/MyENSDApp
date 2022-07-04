/**
 * テスト用のコード
 */
const main = async () => {
    // アカウントの情報を読み込む
    const [owner, randomPerson] = await hre.ethers.getSigners();
    // コントラクトの読み込み
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    // デプロイ
    const domainContract = await domainContractFactory.deploy();
    await domainContract.deployed();
    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);
    
    // registerメソッドを実行
    const txn = await domainContract.register("doom");
    await txn.wait();
    // ドメイン名からアドレスを取得する。
    const domainOwner = await domainContract.getAddress("doom");
    console.log("Owner of domain:", domainOwner);
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