const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentController');
const proofController = require('../controllers/proofController');
const certificateController = require('../controllers/certificateController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { proofVerificationLimiter, certificateDownloadLimiter } = require('../middlewares/rateLimiter');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Ensure uploads dir exists (usually done in main or manually)
const fs = require('fs');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Document routes (existing)
router.post('/upload', protect, authorize('uploader'), upload.single('document'), controller.uploadDocument);
router.post('/verify', upload.single('document'), controller.verifyDocument);
router.get('/stats', protect, authorize('uploader'), controller.getUploaderStats);
router.post('/:id/revoke', protect, authorize('uploader'), controller.revokeDocument);

// NEW: Public proof verification (rate-limited, no auth required)
router.get('/verify-proof/:proofHash', proofVerificationLimiter, proofController.verifyProof);

// NEW: Proof statistics (admin only)
router.get('/proofs/stats', protect, authorize('admin'), proofController.getProofStats);

// NEW: Certificate download routes (public, rate-limited)
router.get('/certificates/download/:proofHash', certificateDownloadLimiter, certificateController.downloadPDF);
router.get('/certificates/json/:proofHash', certificateDownloadLimiter, certificateController.getJSON);
router.get('/certificates/preview/:proofHash', certificateController.getCertificatePreview);

module.exports = router;
