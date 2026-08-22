// routes/environmental.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// In-memory fallback cache when Supabase is unreachable or using placeholder credentials
const fallbackEnvironmentalData = [];

// POST — Save environmental parameters
router.post('/', async (req, res) => {
    const { sampleID, radiological, noise, soil, waste } = req.body;
    const newRecord = {
        id: Date.now(),
        sample_id: sampleID || `SMP-${Math.floor(1000 + Math.random() * 9000)}`,
        radiological: parseFloat(radiological) || 0,
        noise: parseFloat(noise) || 0,
        soil: parseFloat(soil) || 0,
        waste: parseFloat(waste) || 0,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('environmental_data')
            .insert([{
                sample_id: newRecord.sample_id,
                radiological: newRecord.radiological,
                noise: newRecord.noise,
                soil: newRecord.soil,
                waste: newRecord.waste
            }]);

        if (error) throw error;
    } catch (error) {
        console.warn('⚠️ Supabase environmental_data insert failed. Using local in-memory store:', error.message || error);
        fallbackEnvironmentalData.unshift(newRecord);
    }

    res.redirect('/fwater');
});

// GET — Retrieve and display environmental data
router.get('/', async (req, res) => {
    try {
        const { data: environmentalData, error } = await supabase
            .from('environmental_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.render('odi', { environmentalData: environmentalData && environmentalData.length > 0 ? environmentalData : fallbackEnvironmentalData });
    } catch (error) {
        console.warn('⚠️ Supabase environmental_data query failed, falling back to local memory store:', error.message || error);
        res.render('odi', { environmentalData: fallbackEnvironmentalData });
    }
});

module.exports = router;
