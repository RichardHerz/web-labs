Back to Web Labs at ReactorLab.net 

***Cryptographic Blockchain - Teddy Token*** 

***GO TO THE SIMULATION*** >> [Teddy Token](https://reactorlab.net/web_labs/web_lab_18L/) (opens in a new tab)

***ABOUT TEDDY TOKEN***

Teddy Token's purpose is to show, in a simplified way, how blockchains and cryptocoins work. See below for the 5 steps to add transactions to the blockchain.

There are many differences between Teddy tokens and real cryptocoins. But the essentials are shown. See below for a partial list of differences.

Blockchains are a sequential record of transactions, which may be simple transfers of cryptocoins, as in the case of Bitcoin and Teddy, or contracts in the form of computer algorithms, as in the case of Ethereum. 

Each block of transactions, as well as each individual transaction in a block, are identified by a hash value that prevents the transactions and the blockchain from being tampered with. The hashes also allow individual transactions and blocks to be located in the blockchain.

***Hashes are key to blockchains***. They are values created by cryptographic hash algorithms operating on information such as public keys. They ensure that any future change in information, such as how many coins you have sent me, becomes obvious by a large change in the hash of the information, thus preventing tampering with the blockchain. 

See Web Lab 17 for a demonstration of hashing. Lab 16 has a demonstration of public-key encryption.

Cryptocoins have several additional advantages in addition to that of security. They can be exchanged anonymously through the hash addresses, which cannot be reverse engineered to discover the owner. They can be exchanged by any user at small cost compared to bank transfers. Their value is that perceived by all users and not directly dependent on government policies. 

***Cryptocoins are created out of thin air*** initially. Satoshi Nakamoto created the initial 50 bitcoins out of thin air. Catoshi Purramoto created the initial 50 Teddy tokens out of thin air. The number of bitcoins and Teddy tokens increases only as a result of the computational work done in mining, which is described in step 4 below. Although the initial coins were "free," further coins require the expenditure of energy, which, in the case of Bitcoin, has become a noticable percentage of the world's energy budget.

For what do people trade cryptocoins? Things of value, which they give in order to receive cryptocoins in payment. The first purchase with bitcoins is said to be that of a pizza. People also will sell their coins in exchange for government currency, e.g., U.S. dollars. Government currency is termed "Fiat" currency in the cryptocoin world. Fiat currency is not backed by a real asset such as gold, and depends on user confidence for value. Hmmm, that description also applies to cryptocurrency... 

There is no fixed price for cryptocoins. The coins are auctioned such that ***their value in government currency, fluctuates with the perceived value of the coins***. The real cost of electricity to mine sets a base price.

In the Teddy Token simulation, the ***wallets field*** shows a partial snapshot of the wallet of each of the users. Shown are the names of the users, their addresses, and their Teddy token balance. 

Real individual users can only view their own wallet, which also contains their private and public encryption keys. Their address is the hash value of their public key. 

In a real blockchain, the computers of users and miners are distributed throughout the world in a peer-to-peer (P2P) network over the Internet. 

On opening the Teddy Token blockchain, only the "***Genesis Block***" is present in the blockchain field on the far left or far bottom of the page, depending on your screen size and orientation. 
             
The Genesis Block is block number 0, in which Catoshi Purramoto created tokens out of thin air and distributed them equally to 5 users. In Bitcoin's genesis block, Satoshi Nakamoto created out of thin air 50 bitcoins, which he sent to Hal Finey. 

#### There are 5 steps for adding transactions to the blockchain:

1. ***Create a transaction:*** Select To, From and enter an amount. Transactions show the addresses, not the names of the people to whom the address belongs. This makes transactions anonymous.

2. **Verify the transaction:** This step checks to make sure two different addresses have been entered and a nonzero amount that is less than or equal to the current balance of the From address has been entered. After verification, the transaction is added to a pool of pending transactions on the peer network. 

3. ***Build block:*** This step checks to make sure you have entered at least two verified transactions, then creates a provisional block. Here you are required to enter at least two transactions in order to proceed to making a block. Real blockchains have blocks with thousands of transactions in order to reduce the cost per transaction. Miners on the peer network collect pending transactions and form provisional blocks. 

4. ***Mine block:*** This step performs computations in order to verify the block. There are many methods for blocks to be verified. The method used by Bitcoin and Teddy Token is "proof of work." This requires the miner to find a number which they add to the block header such that the hash of the block header starts with the target number of zeros. This number is called the nonce: a number used once. The target here is a small value so that the mining here is fast. Real blockchains require a target value of many zeros such that mining requires significant computer power.

5. ***Add block to chain:*** This step adds the new block to the top of the blockchain and also updates the balances of all users in the blockchain header. 

In Bitcoin and Teddy Token, the total number of coins increases with time due to the block reward coins given to the successful miner of a block. These block rewards have a real cost to the miner in the cost of the energy to run their computers to find a nonce.

In Bitcoin, the block reward amount decreases with time such that the total number of bitcoins will reach a maximum. There is no limit in Teddy Token, that is, other than your patience adding blocks!  

Bitcoin started with only 50 coins and will max out at 21 million coins. How does the number of bitcoins grow? Only by the mining reward. For the first several months after the start of Bitcoin, the only blocks mined contained only mining rewards. This built up the supply of bitcoins such that a suffient number existed for people to start trading bitcoins. Mining has a real cost of the energy expended in computation, which, in Bitcoin's case, is substantial.

#### Some differences between Teddy Token and real blockchains 

1. Teddy Token is self-contained. Real users and miners are distributed around the world and connected in P2P networks over the Internet.

2. You can see everyone's real names and balances in Teddy Token. Real users cannot see information about other users other than anonymous hash addresses and balances.

3. Teddy Token blocks require a minimum of only 2 transactions, in addition to the miner reward. Real blocks may involve thousands of transactions. 

4. Teddy Token uses the "proof-of-work" concensus method for verifying and accepting blocks, as does Bitcoin. There are many other concensus methods in the blockchain world. 

5. Transactions are free to process in Teddy Token. Real blockchains can charge a transaction fee to the sender. 

6. The target value is Teddy Token is small to make mining - and the simulation - fast for your convenience. The larger the target value - the number of zeros required at the start of the final block header hash - the more computation it takes to find the nonce. The Bitcoin target is increased periodically to keep the mining time at approximately 10 minutes.

7. The total number of Teddy tokens is limited only by your persistence, since the block mining reward is constant. The total number of bitcoins is limited to 21 million by the eventual reduction to zero of the block reward.

### GO TO TEDDY TOKEN >> [reactorlab.net](https://reactorlab.net/web_labs/web_lab_18L/)

