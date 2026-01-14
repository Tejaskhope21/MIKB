import express from 'express';
import {
    contractorAutocomplete,
    fullContractorSearch,
    getContractorSuggestions
} from '../controllers/contractorSearch.controller.js';

const router = express.Router();

// Autocomplete
router.get('/autocomplete', contractorAutocomplete);

// Full search
router.get('/', fullContractorSearch);
// routes/contractor.routes.js
router.get('/contractor-suggestions', getContractorSuggestions);

export default router;
