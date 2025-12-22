const Web3 = require('web3').default || require('web3'); // Common js import issue with Web3 v4
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load Contract ABI
// Assuming the artifact is at ../blockchain/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json
// Since we are in /server/utils, we go ../../blockchain/...
const ARTIFACT_PATH = path.join(__dirname, '../../blockchain/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json');

let web3;
let contract;
let account;

const initBlockchain = async () => {
    if (contract) return { web3, contract, account };

    try {
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:7545';
        web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

        // Load Account
        // In Ganache (local), we might not explicitly need a private key if we use the unlocked accounts, 
        // but for writing transactions via backend, we usually sign locally using a private key.
        // If no private key in env, assuming Ganache first account for dev? 
        // Better: require private key in .env for "Uploader" role simulation on backend?
        // Wait, the backend acts as the gateway. Who pays for gas? The Institution or the Platform?
        // Usually the platform (Admin backend wallet) or a relayer.
        // Let's assume a SERVER_WALLET_PRIVATE_KEY in .env

        const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
        // If testing locally with Ganache, we can grab an account from output.
        // For now, let's look for accounts.

        let accountToUse;
        if (privateKey) {
            accountToUse = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(accountToUse);
        } else {
            // Fallback for Ganache dev only
            const accounts = await web3.eth.getAccounts();
            accountToUse = { address: accounts[0] }; // Use first account
        }

        if (!fs.existsSync(ARTIFACT_PATH)) {
            console.error('Blockchain Artifacts not found. Run "npx hardhat compile" in blockchain dir.');
            return null;
        }

        const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'));
        const contractAddress = process.env.CONTRACT_ADDRESS;

        if (!contractAddress) {
            console.error('CONTRACT_ADDRESS not set in .env');
            return null;
        }

        contract = new web3.eth.Contract(artifact.abi, contractAddress);
        account = accountToUse;

        console.log('Blockchain connected. Wallet:', account.address);
        return { web3, contract, account };
    } catch (e) {
        console.error('Blockchain init error:', e);
        return null;
    }
};

exports.anchorHash = async (docHash) => {
    const { contract, account, web3 } = await initBlockchain();
    if (!contract) throw new Error('Blockchain not initialized');

    try {
        // Estimate Gas
        const gas = await contract.methods.anchorDocument(docHash).estimateGas({ from: account.address });

        // Send Tx
        const tx = await contract.methods.anchorDocument(docHash).send({
            from: account.address,
            gas: Math.floor(Number(gas) * 1.2) // Convert BigInt to Number before calculation
        });

        return {
            txHash: tx.transactionHash,
            blockNumber: Number(tx.blockNumber) // Convert BigInt to Number
        };
    } catch (error) {
        console.error('Anchor Error:', error);
        throw error;
    }
};

exports.verifyHash = async (docHash) => {
    const { contract } = await initBlockchain();
    if (!contract) throw new Error('Blockchain not initialized');

    try {
        const result = await contract.methods.verifyDocument(docHash).call();
        // Returns: [bool, address issuer, uint256 timestamp, uint8 status, string reason]
        // Mapping in Solidity: enum is returned as uint8
        return {
            exists: result[0],
            issuer: result[1],
            timestamp: Number(result[2]), // Convert BigInt to Number
            status: result[3].toString(), // 0=Active, 1=Revoked
            revocationReason: result[4]
        };
    } catch (error) {
        // If not found, it might revert or return false depending on logic.
        // Our contract reverts with "Document not found" if using verifyDocument wrapper?
        // No, docExists check reverts.
        return { exists: false };
    }
};
