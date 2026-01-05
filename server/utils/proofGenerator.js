const crypto = require('crypto');

/**
 * Deterministic JSON stringify - sorts keys alphabetically
 * Ensures same object always produces same string
 */
function deterministicStringify(obj) {
    if (obj === null) return 'null';
    if (typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) {
        return '[' + obj.map(deterministicStringify).join(',') + ']';
    }

    const keys = Object.keys(obj).sort();
    const pairs = keys.map(key => {
        return JSON.stringify(key) + ':' + deterministicStringify(obj[key]);
    });

    return '{' + pairs.join(',') + '}';
}

/**
 * Generate a deterministic proof object
 * Fixed field order ensures same input always produces same hash
 * 
 * @param {Object} verificationData
 * @param {string} verificationData.documentHash - SHA256 hash of document
 * @param {string} verificationData.institutionName - Name of issuing institution
 * @param {string} verificationData.verifiedAt - ISO timestamp
 * @param {string} verificationData.blockchainTx - Transaction hash
 * @param {number} verificationData.blockNumber - Block number
 * @param {string} verificationData.verifierType - 'public' or 'authenticated'
 * @returns {Object} proofObject - Deterministic proof object
 */
function generateProofObject(verificationData) {
    const {
        documentHash,
        institutionName,
        verifiedAt,
        blockchainTx,
        blockNumber,
        verifierType
    } = verificationData;

    // Fixed order, no random values - ensures determinism
    return {
        document_hash: documentHash,
        institution_name: institutionName,
        verification_result: 'VALID',
        verified_at: verifiedAt,
        blockchain_tx: blockchainTx,
        block_number: blockNumber,
        verifier_type: verifierType,
        system_version: 'v1.0'
    };
}

/**
 * Compute SHA256 hash of deterministic JSON
 * Uses custom stringify to ensure consistent serialization
 * 
 * @param {Object} proofObject - Proof object to hash
 * @returns {string} - Hex-encoded SHA256 hash
 */
function computeProofHash(proofObject) {
    const deterministicJson = deterministicStringify(proofObject);
    return crypto.createHash('sha256').update(deterministicJson).digest('hex');
}

/**
 * Verify proof integrity by recomputing hash
 * 
 * @param {Object} proofObject - Stored proof object
 * @param {string} expectedHash - Expected proof hash
 * @returns {boolean} - True if proof is valid
 */
function verifyProofIntegrity(proofObject, expectedHash) {
    const recomputedHash = computeProofHash(proofObject);
    return recomputedHash === expectedHash;
}

module.exports = {
    generateProofObject,
    computeProofHash,
    verifyProofIntegrity
};
