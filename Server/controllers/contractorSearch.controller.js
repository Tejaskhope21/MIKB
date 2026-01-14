import Contractor from '../models/Contractor.model.js';

export const contractorAutocomplete = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Number(req.query.limit) || 8;

    if (!q) {
      return res.json({
        success: true,
        contractors: [],
        total: 0,
      });
    }

    const contractors = await Contractor.find(
      {
        isActive: true,
        companyName: { $regex: `^${q}`, $options: 'i' }, // PREFIX MATCH
      },
      {
        companyName: 1,
        contractorType: 1,
        'address.city': 1,
        experience: 1,
        isVerified: 1,
        'ratings.average': 1,
      }
    )
      .limit(limit)
      .lean();

    res.json({
      success: true,
      contractors,
      total: contractors.length,
    });
  } catch (error) {
    console.error('Contractor autocomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch autocomplete results',
    });
  }
};
export const fullContractorSearch = async (req, res) => {
  try {
    const {
      q = '',
      city,
      contractorType,
      specialty,
      minExperience,
      minRating,
      verified,
      sortBy = 'relevance',
      page = 1,
      limit = 12,
    } = req.query;

    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // 🔍 SEARCH (PARTIAL + CASE INSENSITIVE)
    if (q.trim()) {
      filter.$or = [
        { companyName: { $regex: q, $options: 'i' } },
        { contractorType: { $regex: q, $options: 'i' } },
        { specialties: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } },
        { 'address.state': { $regex: q, $options: 'i' } },
      ];
    }

    // 🎯 FILTERS
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (contractorType) filter.contractorType = contractorType;
    if (specialty) filter.specialties = specialty;
    if (minExperience) filter.experience = { $gte: Number(minExperience) };
    if (minRating) filter['ratings.average'] = { $gte: Number(minRating) };
    if (verified === 'true') filter.isVerified = true;

    // 🔃 SORTING
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      case 'experience':
        sort = { experience: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 }; // relevance fallback
    }

    const [contractors, total] = await Promise.all([
      Contractor.find(filter)
        .select(`
          name companyName contractorType
          experience specialties
          address.city address.state
          ratings.average ratings.count
          isVerified profileViews
        `)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Contractor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      contractors,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Contractor search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search contractors',
    });
  }
};
export const getContractorSuggestions = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.json([]);
    }

    const results = await Contractor.find(
      {
        isActive: true,
        companyName: { $regex: q, $options: 'i' }, // PARTIAL MATCH
      },
      { companyName: 1 }
    )
      .limit(8)
      .lean();

    const suggestions = [
      ...new Set(results.map(item => item.companyName)),
    ];

    res.json(suggestions);
  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json([]);
  }
};
