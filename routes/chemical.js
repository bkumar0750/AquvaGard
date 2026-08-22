// routes/chemical.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// In-memory fallback cache when Supabase is unreachable or using placeholder credentials
const fallbackChemicalData = [];

// POST — Save chemical parameters
router.post('/', async (req, res) => {
    const { sampleID, do: DO, bod, cod, nh3, no3, no2, phosphate, chlorite } = req.body;
    const newRecord = {
        id: Date.now(),
        sample_id: sampleID || `SMP-${Math.floor(1000 + Math.random() * 9000)}`,
        do_value: parseFloat(DO) || 0,
        bod: parseFloat(bod) || 0,
        cod: parseFloat(cod) || 0,
        nh3: parseFloat(nh3) || 0,
        no3: parseFloat(no3) || 0,
        no2: parseFloat(no2) || 0,
        phosphate: parseFloat(phosphate) || 0,
        chlorite: parseFloat(chlorite) || 0,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('chemical_data')
            .insert([{
                sample_id: newRecord.sample_id,
                do_value: newRecord.do_value,
                bod: newRecord.bod,
                cod: newRecord.cod,
                nh3: newRecord.nh3,
                no3: newRecord.no3,
                no2: newRecord.no2,
                phosphate: newRecord.phosphate,
                chlorite: newRecord.chlorite
            }]);

        if (error) throw error;
    } catch (error) {
        console.warn('⚠️ Supabase chemical_data insert failed. Using local in-memory store:', error.message || error);
        fallbackChemicalData.unshift(newRecord);
    }

    res.redirect('/fwater');
});

// GET — Retrieve and display chemical data
router.get('/', async (req, res) => {
    try {
        const { data: chemicalData, error } = await supabase
            .from('chemical_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.render('cdi', { chemicalData: chemicalData && chemicalData.length > 0 ? chemicalData : fallbackChemicalData });
    } catch (error) {
        console.warn('⚠️ Supabase chemical_data query failed, falling back to local memory store:', error.message || error);
        res.render('cdi', { chemicalData: fallbackChemicalData });
    }
});

module.exports = router;
