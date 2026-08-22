// routes/information.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// GET /information/data — Return distinct sampleIDs from all tables
router.get('/data', async (req, res) => {
    try {
        const [
            { data: physical, error: e1 },
            { data: chemical, error: e2 },
            { data: biological, error: e3 },
            { data: air, error: e4 },
            { data: other, error: e5 }
        ] = await Promise.all([
            supabase.from('physical_data').select('sample_id'),
            supabase.from('chemical_data').select('sample_id'),
            supabase.from('biological_data').select('sample_id'),
            supabase.from('air_quality_data').select('sample_id'),
            supabase.from('environmental_data').select('sample_id')
        ]);

        if (e1 || e2 || e3 || e4 || e5) throw (e1 || e2 || e3 || e4 || e5);

        const unique = arr => [...new Set((arr || []).map(r => r.sample_id))];

        res.json({
            physical: unique(physical),
            chemical: unique(chemical),
            biological: unique(biological),
            air: unique(air),
            other: unique(other)
        });
    } catch (error) {
        console.warn('⚠️ Supabase information query failed, returning empty samples:', error.message || error);
        res.json({ physical: [], chemical: [], biological: [], air: [], other: [] });
    }
});

module.exports = router;
