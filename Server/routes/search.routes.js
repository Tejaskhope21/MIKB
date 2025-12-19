// backend/routes/searchRoutes.js
import express from 'express';
import {
    autocompleteSearch,
    fullSearch,
    getSearchSuggestions
} from '../controllers/searchController.js';

const router = express.Router();

// @route   GET /api/search/autocomplete
// @desc    Get search suggestions for autocomplete
// @access  Public
router.get('/autocomplete', autocompleteSearch);

// @route   GET /api/search
// @desc    Full search with pagination and filters
// @access  Public
router.get('/', fullSearch);

// @route   GET /api/search/suggestions
// @desc    Get trending searches and popular categories
// @access  Public
router.get('/suggestions', getSearchSuggestions);

export default router;