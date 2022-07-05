require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const {
  PRIVATE_KEY, 
  POLYGON_URL
} = process.env;


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  paths: {                         
    artifacts: './../client/src/contracts',  
  },
  networks: {
    /*
    goerli: {
      url: API_URL_KEY,
      accounts: [PRIVATE_KEY],
    },
    rinkeby: {
      url: API_RINKEBY_KEY,
      accounts: [PRIVATE_KEY],
    },
    */
    munbai: {
      url: POLYGON_URL,
      accounts: [PRIVATE_KEY],
    },
    shibuya: {
      url:"https://shibuya.public.blastapi.io",
      chainId:81,
      accounts:[process.env.PRIVATE_KEY],
    }
  },
};
