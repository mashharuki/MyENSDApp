import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import contractAbi from "./contracts/contracts/Domains.sol/Domains.json";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

// トップレベルドメイン
const tld = ".mash";
// コントラクトアドレス
const CONTRACT_ADDRESS = "0x62cd2cbc855746c16fd16b4e5b34110e1549fc2e";

// Constants
const TWITTER_HANDLE = 'HARUKI05758694';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

/**
 * Appコンポーネント
 */
const App = () => {
	// ステート変数
	const [currentAccount, setCurrentAccount] = useState("");
	const [domain, setDomain] = useState("");
  	const [record, setRecord] = useState("");
	const [network, setNetwork] = useState("");

	// メタマスクのオブジェクトを取得する。
	const { ethereum } = window;
	// アカウントが変更されたタイミングで再読み込み
	ethereum.on('accountsChanged', () => window.location.reload());
	// チェーンが変更されたタイミングでも再読み込み
	ethereum.on('chainChanged', () => window.location.reload());

	/**
	 * ウォレットの接続状態をチェックするメソッド
	 */
	const checkIfWalletIsConnected = async() => {
	
		if (!ethereum) {
		  	console.log("Make sure you have MetaMask!");
		  	return;
		} else {
		  	console.log("We have the ethereum object", ethereum);
		}
		// ユーザーのウォレットをリクエストします。
		const accounts = await ethereum.request({ method: "eth_accounts" });
		// 設定
		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
		  } else {
			console.log("No authorized account found");
		}

		// ユーザーのネットワークのチェーンIDをチェックします。
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		// ステート変数を更新する。
		setNetwork(networks[chainId]);
	};

	/**
	 * renderNotConnectedContainerコンポーネント
	 */
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<img
				src="https://media.giphy.com/media/FWAcpJsFT9mvrv0e7a/giphy.gif"
				alt="Anya"
			/>
			<button className="cta-button connect-wallet-button" onClick={connectWallet}>
				Connect Wallet
			</button>
		</div>
	);

	/**
	 * 「Connect Wallet」ボタンを押した時の処理
	 */
	 const connectWallet = async () => {
		try {
		  	const { ethereum } = window;
	
		  	if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}
	
			// アカウントへのアクセスを要求するメソッドを要求する。
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
	
			console.log("Connected", accounts[0]);
			// ステート変数の値を更新する。
			setCurrentAccount(accounts[0]);
		} catch (error) {
		  	console.log(error);
		}

	};

	/**
	 * 入力フォーム用のコンポーネント
	 */
	const renderInputForm = () => {

		// テストネットの Polygon Mumbai 上にいない場合の処理
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<h2>Please connect to the Polygon Mumbai Testnet</h2>
					<button 
						className='cta-button mint-button' 
						onClick={switchNetwork}
					>
						Click here to switch
					</button>
				</div>
			);
		}

		return (
		  <div className="form-container">
			<div className="first-row">
			  	<input
					type="text"
					value={domain}
					placeholder="domain"
					onChange={(e) => setDomain(e.target.value)}
			  	/>
			  	<p className="tld"> {tld} </p>
			</div>
	
			<input
			  	type="text"
			  	value={record}
			  	placeholder="Please enter a record data"
			  	onChange={(e) => setRecord(e.target.value)}
			/>
	
			<div className="button-container">
				{/* Mint ボタン */}
				<button
					className="cta-button mint-button"
					disabled={null}
					onClick={mintDomain}
				>
					Mint
				</button>
				{/* Set data ボタン */}
				<button
					className="cta-button mint-button"
					disabled={null}
					onClick={null}
				>
					Set data
				</button>
			</div>
		  </div>
		);
	};

	/**
	 * 「Mint」ボタンを押した時の処理
	 */
	const mintDomain = async () => {
		// ドメインがnullのときrunしません。
		if (!domain) {
			return;
		}
		// ドメインが3文字に満たない、短すぎる場合にアラートを出します。
		if (domain.length < 3) {
			alert("Domain must be at least 3 characters long");
			return;
		}
		// ドメインの価値を計算する。
		const price = domain.length === 3 ? "0.05" : domain.length === 4 ? "0.03" : "0.01";
  		console.log("Minting domain", domain, "with price", price);
		
		try {
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				// コントラクトをインスタンス化する。
				const contract = new ethers.Contract(
				  	CONTRACT_ADDRESS,
				  	contractAbi.abi,
				  	signer
				);
		  
				console.log("Going to pop wallet now to pay gas...");
				
				// registメソッドの呼び出し
				let tx = await contract.register(domain, {
				  	value: ethers.utils.parseEther(price),
				});
				// ミントされるまでトランザクションを待ちます。
				const receipt = await tx.wait();
		  
				// トランザクションが問題なく実行されたか確認します。
				if (receipt.status === 1) {
					console.log(
						"Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash
					);
			
					// setRecordメソッドの呼び出し
					tx = await contract.setRecord(domain, record);
					await tx.wait();
			
					console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);
		  
					setRecord("");
					setDomain("");
				} else {
				  	alert("Transaction failed! Please try again");
				}
			  }
		}  catch (error) {
			console.log(error);
		}
	};

	/**
	 * ネットワークのスイッチを切り替えるボタン
	 */
	 const switchNetwork = async () => {
		if (window.ethereum) {
		  try {
			// Mumbai testnet に切り替えさせるメソッドを呼び出す。
			await window.ethereum.request({
			  method: 'wallet_switchEthereumChain',
			  params: [{ chainId: '0x13881' }], 
			});
		  } catch (error) {
			// このエラーコードは当該チェーンがメタマスクに追加されていない場合です。
			// その場合、ユーザーに追加するよう促します。
			if (error.code === 4902) {
			  try {
				// ネットワーク追加のメソッドを呼び出す。
				await window.ethereum.request({
				  method: 'wallet_addEthereumChain',
				  params: [
					{
					  chainId: '0x13881',
					  chainName: 'Polygon Mumbai Testnet',
					  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
					  nativeCurrency: {
						  name: "Mumbai Matic",
						  symbol: "MATIC",
						  decimals: 18
					  },
					  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
					},
				  ],
				});
			  } catch (error) {
				console.log(error);
			  }
			}
			console.log(error);
		  }
		} else {
		  // window.ethereum が見つからない場合メタマスクのインストールを促します。
		  alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		}
	}

	// 副作用フック
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

  	return (
		<div className="App">
			<div className="container">
				{/* Display a logo and wallet connection status*/}
				<div className="right">
					<img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
					{ currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
				</div>
				<div className="header-container">
					<header>
						<div className="center">
							<p className="title">🍬 My ENS DApp 🍬</p>
							<p className="subtitle">Your immortal API on the blockchain!</p>
						</div>
					</header>
				</div>
				{!currentAccount && renderNotConnectedContainer()}
				{currentAccount && renderInputForm()}
       			<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
