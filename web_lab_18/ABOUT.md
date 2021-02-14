***ABOUT TEDDY TOKEN***

Teddy Token's purpose is to show, in a simplified way how blockchains and cryptocoins work. There are many differences between Teddy tokens and and real cryptocoins. But the essentials are shown.

Blockchains are a sequential record of transactions, which may be simple transfers of cryptocoins, as in the case of Bitcoin and Teddy, or contracts in the form of computer algorithms, as in the case of Ethereum. 

Each block of transactions, as well as each individual transaction in a block, are identified by a hash value that prevents the transactions and the blockchain from being tampered with. The hashes also allow individual transactions and blocks to be located in the blockchain.

***Hashes***, which are values created by hash algorithms operating on information such as public keys, ***are at the heart of blockchains***. They ensure that any future change in information, such as how many coins you have sent me, becomes obvious by a large change in the hash of the information, thus preventing tampering with the blockchain. 

See Reactor Lab's Web Lab 17 for a demonstration of hashing.

***Cryptocoins are created out of thin air***. Satoshi Nakamoto created the initial 50 bitcoins out of thin air. Catoshi Purramoto created the initial 250 Teddy tokens out of thin air. The number of bitcoins and Teddy tokens increases only as a result of the computational work done in mining, which is described in step 4 below.

For what do people trade cryptocoins? Things of value, which they give in order to receive cryptocoins in payment. The first purchase with bitcoins was that of a pizza. People also will sell their coins in exchange for government currency, e.g., U.S. dollars. Government currency is termed "Fiat" currency.

There is no fixed price for cryptocoins. The coins are auctioned such that ***their value in government currency, fluctuates with the perceived value of the coins***. 

In the Teddy Token simulation, the ***wallets field*** shows a partial snapshot of the wallet of each of the users. Shown are the names of the users, their addresses, and their Teddy token balance. 

Real individual users can only view their own wallet, which also contains their private and public encryption keys. Their address is the hash value of their public key. 

There are 5 steps for adding transactions to the blockchain:

1. ***Create a transaction:*** Select To, From and enter an amount. Transactions show the addresses, not the names of the people to whom the address belongs. This makes transactions anonymous.

2. **Verify the transaction:** This step checks to make sure two different addresses have been entered and a nonzero amount that is less than or equal to the current balance of the From address has been entered. After verification, the transaction is added to a pool of pending transactions on the peer network. 

3. ***Build block:*** This step checks to make sure you have entered at least two verified transactions, then creates a provisional block. Here you are required to enter at least two transactions in order to proceed to making a block. Real blockchains have blocks with thousands of transactions in order to reduce the cost per transaction. Miners on the peer network collect pending transactions and form provisional blocks. 

4. ***Mine block:*** This step performs computations in order to verify the block. There are many methods for blocks to be verified. The method used by Bitcoin and Teddy Token is "proof of work." This requires the miner to find a number which they add to the block header such that the hash of the block header starts with the target number of zeros. This number is called the nonce: a number used once. The target here is a small value so that the mining here is fast. Real blockchains require a target value of many zeros such that mining requires significant computer power.

5. ***Add block to chain:*** This step adds the new block to the top of the blockchain and also updates the balances of all users in the blockchain header. 

On opening the Teddy Token blockchain, only the "***Genesis Block***" is present. This is block number 0, in which Catoshi Purramoto created (out of thin air) tokens and distributed them to users. In Bitcoin's genesis block, Satoshi Nakamoto created (out of thin air) 50 bitcoins, which he sent to Hal Finey. 

In Bitcoin and Teddy Token, the total number of coins increases with time because of the block reward coins (created out of thin air) given to the successful miner of a block. 

In Bitcoin, the block reward amount decreases with time such that the total number of bitcoins will reach a maximum. There is no limit in Teddy Token, that is, other than your patience adding blocks! 

Real blockchains also can charge a transaction fee to the sender. Transactions are free in Teddy Token. 

Bitcoin started with only 50 coins and will max out at 21 million coins. How does the number of bitcoins grow? Only by the mining reward. For the first several months after the start of Bitcoin, the only blocks mined contained only mining rewards. This built up the supply of bitcoins (out of thin air) such that a suffient number existed for people to start trading bitcoins. 



