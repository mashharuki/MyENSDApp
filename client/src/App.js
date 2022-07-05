import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'HARUKI05758694';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

/**
 * Appコンポーネント
 */
const App = () => {
	// ステート変数
	const [currentAccount, setCurrentAccount] = useState("");

	// メタマスクのオブジェクトを取得する。
	const { ethereum } = window;
	// アカウントが変更されたタイミングで再読み込み
	ethereum.on('accountsChanged', () => window.location.reload());

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

	// 副作用フック
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

  	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<header>
						<div className="center">
							<p className="title">🍬 My ENS DApp 🍬</p>
							<p className="subtitle">Your immortal API on the blockchain!</p>
						</div>
					</header>
				</div>
				{!currentAccount && renderNotConnectedContainer()}
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
