const db = require('../config/db');
const { verifyProofIntegrity, computeProofHash } = require('../utils/proofGenerator');

/**
 * Public endpoint to verify proof hash
 * GET /api/documents/verify-proof/:proofHash
 * No authentication required - publicly accessible
 */
exports.verifyProof = async (req, res) => {
    try {
        const { proofHash } = req.params;

        // Validate proof hash format (should be 64-char hex)
        if (!/^[a-f0-9]{64}$/i.test(proofHash)) {
            return res.status(400).json({
                valid: false,
                message: 'Invalid proof hash format'
            });
        }

        // Fetch stored proof from database
        const [proofs] = await db.query(
            `SELECT 
                vp.proof_object, 
                vp.created_at,
                vp.blockchain_tx_hash,
                vp.blockchain_block_number,
                v.result as verification_result
            FROM verification_proofs vp
            JOIN verifications v ON vp.verification_id = v.id
            WHERE vp.proof_hash = ?`,
            [proofHash]
        );

        if (proofs.length === 0) {
            return res.status(404).json({
                valid: false,
                message: 'Proof not found. This certificate may not exist or hash is incorrect.'
            });
        }

        const storedProof = proofs[0];
        const proofObject = typeof storedProof.proof_object === 'string'
            ? JSON.parse(storedProof.proof_object)
            : storedProof.proof_object;

        // Recompute hash to verify integrity (tamper detection)
        const recomputedHash = computeProofHash(proofObject);
        const isValid = recomputedHash === proofHash;

        if (!isValid) {
            return res.status(400).json({
                valid: false,
                message: 'Proof integrity check failed - certificate data has been tampered with',
                security_alert: true
            });
        }

        // Return verification metadata (without exposing full document content)
        res.json({
            valid: true,
            message: 'Certificate is authentic and has not been tampered with',
            proof: {
                institution_name: proofObject.institution_name,
                verification_result: proofObject.verification_result,
                verified_at: proofObject.verified_at,
                blockchain_tx: proofObject.blockchain_tx,
                block_number: proofObject.block_number,
                verifier_type: proofObject.verifier_type,
                system_version: proofObject.system_version
            },
            proof_hash: proofHash,
            certificate_issued_at: storedProof.created_at,
            blockchain_anchor: storedProof.blockchain_tx_hash ? {
                tx_hash: storedProof.blockchain_tx_hash,
                block_number: storedProof.blockchain_block_number
            } : null
        });

    } catch (error) {
        console.error('Proof verification error:', error);
        res.status(500).json({
            valid: false,
            message: 'Verification service temporarily unavailable'
        });
    }
};

/**
 * Get proof statistics for admin dashboard
 * GET /api/proofs/stats
 */
exports.getProofStats = async (req, res) => {
    try {
        // Total proofs issued
        const [totalResult] = await db.query(
            'SELECT COUNT(*) as total FROM verification_proofs'
        );

        // Proofs by institution
        const [byInstitution] = await db.query(
            `SELECT 
                JSON_EXTRACT(proof_object, '$.institution_name') as institution,
                COUNT(*) as count
            FROM verification_proofs
            GROUP BY JSON_EXTRACT(proof_object, '$.institution_name')
            ORDER BY count DESC
            LIMIT 10`
        );

        // Proofs by day (last 7 days)
        const [byDay] = await db.query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM verification_proofs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC`
        );

        res.json({
            total: totalResult[0].total,
            by_institution: byInstitution,
            by_day: byDay
        });

    } catch (error) {
        console.error('Proof stats error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};
