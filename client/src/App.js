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
const CONTRACT_ADDRESS = "0x677fA3F54bab17C4654A534683F1CEab94278632";

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
	const [editing, setEditing] = useState(false);
  	const [loading, setLoading] = useState(false);
	const [mints, setMints] = useState([]);
	const [isOwner, setIsOwner] = useState(false);

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
	
			{editing ? ( 
				<div className="button-container">
					<button
						className="cta-button mint-button"
						disabled={loading}
						onClick={updateDomain}
					>
						Set data
					</button>
					<button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
						Cancel
					</button>
				</div>
			) : (
				<button
					className="cta-button mint-button"
					disabled={loading}
					onClick={mintDomain}
				>
					Mint
				</button>
			)}
			<div className="button-container">
				<button
					className="cta-button withdraw-button"
					disabled={loading}
					onClick={withdrawAction}
				>
					Wtihdraw
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
				  	value: ethers.utils.parseEther(price)
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
		  
					// fetchMints関数実行後2秒待ちます。
					setTimeout(() => {
						// fetchMintsメソッドの呼び出し
						fetchMints();
					}, 2000);

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

	/**
	 * ドメインボタンを実行するためのメソッド
	 */
	const updateDomain = async () => {
		if (!record || !domain) { return }
		setLoading(true);
		console.log("Updating domain", domain, "with record", record);

		  try {
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
				// setRecordメソッドを呼び出す。	
				let tx = await contract.setRecord(domain, record);
				await tx.wait();
				console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);
		
				fetchMints();
				setRecord('');
				setDomain('');
			}
		  } catch(error) {
			console.log(error);
		  }
		setLoading(false);
	}

	/**
	 * ユーザーが発行したドメイン情報を取得するメソッド
	 */
	 const fetchMints = async () => {
		try {
		  if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			// コントラクトをインスタンス化する。
			const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
			// すべてのドメインを取得する。
			const names = await contract.getAllNames();
	  
			// ドメインに紐づく情報を取得する。
			const mintRecords = await Promise.all(names.map(async (name) => {
				// ドメインに紐づくデータを取得する。
				const mintRecord = await contract.records(name);
				// ドメインに紐づくアドレスを返却する。
				const owner = await contract.domains(name);
				// 返却する。
				return {
					id: names.indexOf(name),
					name: name,
					record: mintRecord,
					owner: owner,
				};
			}));
	  
		  console.log("MINTS FETCHED ", mintRecords);
		  // データを格納する。
		  setMints(mintRecords);
		  }
		} catch(error){
		  console.log(error);
		}
	}

	/**
	 * renderMintsコンポーネント
	 */
	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
		  	return (
				<div className="mint-container">
					<p className="subtitle"> Recently minted domains!</p>
						<div className="mint-list">
							{ mints.map((mint, index) => {
								return (
									<div className="mint-item" key={index}>
										<div className='mint-row'>
											<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
											<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
											</a>
											{/* mint.owner が currentAccount なら edit ボタンを追加します。 */}
											{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
											<button className="edit-button" onClick={() => editRecord(mint.name)}>
												<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
											</button>
											:
											null
											}
										</div>
										<p> {mint.record} </p>
									</div>)
							})}
						</div>
		  		</div>
			);
		}
	};
	  
	// editモードを管理するメソッド
	const editRecord = (name) => {
		console.log("Editing record for", name);
		setEditing(true);
		setDomain(name);
	}

	/**
	 * 「Withdraw」ボタンを押した時の処理
	 */
	const withdrawAction = async() => {
		try {
			if (ethereum) {
			  	const provider = new ethers.providers.Web3Provider(ethereum);
			  	const signer = provider.getSigner();
			  	// コントラクトをインスタンス化する。
			  	const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
				// withdrawメソッドを実行する。
				let tx = await contract.withdraw();
				await tx.wait();
				alert('success!!')
			}
		} catch (err) {
			console.log("error", err);
			alert('fail...');
		}
	}

	// 副作用フック
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	// 副作用フック2
	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
		  fetchMints();
		}
	}, [currentAccount, network]);

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
				{mints && renderMints()}
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
