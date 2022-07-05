/**
 * テスト用のコード
 */
const main = async () => {
    // アカウントの情報を読み込む
    const [owner, randomPerson] = await hre.ethers.getSigners();
    // コントラクトの読み込み
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    // デプロイ
    const domainContract = await domainContractFactory.deploy("mash");
    await domainContract.deployed();
    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);

    // registerメソッドを実行
    let txn = await domainContract.register("haruki", {
        value: hre.ethers.utils.parseEther("1234"),
    });
    await txn.wait();

    // ドメイン名からアドレスを取得する。
    const domainOwner = await domainContract.getAddress("haruki");
    console.log("Owner of domain:", domainOwner);

    // 残高を取得する。
    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    try {
        // ownerアドレスで取得する。
        txn = await domainContract.connect(superCoder).withdraw();
        await txn.wait();
    } catch(error){
        console.log("Could not rob contract");
    }
    
    // 引き出し前のウォレットの残高を確認します。あとで比較します。
    let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
    
    // オーナーで取得する。
    txn = await domainContract.connect(owner).withdraw();
    await txn.wait();

    // contract と owner の残高を確認します。
    const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
    ownerBalance = await hre.ethers.provider.getBalance(owner.address);

    console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
    console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
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