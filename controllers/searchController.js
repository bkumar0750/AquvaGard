// controllers/searchController.js
const supabase = require('../config/database');

// Search all tables by sampleID
exports.searchBySampleID = async (req, res) => {
    try {
        const { sampleID } = req.params;

        const results = await Promise.allSettled([
            supabase.from('physical_data').select('*').eq('sample_id', sampleID),
            supabase.from('chemical_data').select('*').eq('sample_id', sampleID),
            supabase.from('biological_data').select('*').eq('sample_id', sampleID),
            supabase.from('air_quality_data').select('*').eq('sample_id', sampleID),
            supabase.from('environmental_data').select('*').eq('sample_id', sampleID)
        ]);

        const physical = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const chemical = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const biological = results[2].status === 'fulfilled' ? results[2].value.data : [];
        const air = results[3].status === 'fulfilled' ? results[3].value.data : [];
        const environmental = results[4].status === 'fulfilled' ? results[4].value.data : [];

        const hasData = [physical, chemical, biological, air, environmental]
            .some(arr => arr && arr.length > 0);

        if (!hasData) {
            return res.status(404).json({ message: 'No data found for this sample ID' });
        }

        res.status(200).json({ sampleID, physical, chemical, biological, air, environmental });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'An error occurred while searching' });
    }
};

