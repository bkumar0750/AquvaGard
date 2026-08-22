// routes/biological.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// In-memory fallback cache when Supabase is unreachable or using placeholder credentials
const fallbackBiologicalData = [];

// POST — Save biological parameters
router.post('/', async (req, res) => {
    const { sampleID, coliform, fecalColiform, algalCount, pathogens } = req.body;
    const newRecord = {
        id: Date.now(),
        sample_id: sampleID || `SMP-${Math.floor(1000 + Math.random() * 9000)}`,
        coliform: parseFloat(coliform) || 0,
        fecal_coliform: parseFloat(fecalColiform) || 0,
        algal_count: parseFloat(algalCount) || 0,
        pathogens: parseFloat(pathogens) || 0,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('biological_data')
            .insert([{
                sample_id: newRecord.sample_id,
                coliform: newRecord.coliform,
                fecal_coliform: newRecord.fecal_coliform,
                algal_count: newRecord.algal_count,
                pathogens: newRecord.pathogens
            }]);

        if (error) throw error;
    } catch (error) {
        console.warn('⚠️ Supabase biological_data insert failed. Using local in-memory store:', error.message || error);
        fallbackBiologicalData.unshift(newRecord);
    }

    res.redirect('/fwater');
});

// GET — Retrieve and display biological data
router.get('/', async (req, res) => {
    try {
        const { data: biologicalData, error } = await supabase
            .from('biological_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.render('bdi', { biologicalData: biologicalData && biologicalData.length > 0 ? biologicalData : fallbackBiologicalData });
    } catch (error) {
        console.warn('⚠️ Supabase biological_data query failed, falling back to local memory store:', error.message || error);
        res.render('bdi', { biologicalData: fallbackBiologicalData });
    }
});

module.exports = router;
