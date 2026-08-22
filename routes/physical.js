// routes/physical.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// In-memory fallback cache when Supabase is unreachable or using placeholder credentials
const fallbackPhysicalData = [];

// POST — Save physical parameters
router.post('/', async (req, res) => {
    const { sampleID, phValue, temperature, turbidity, conductivity, tds } = req.body;
    const newRecord = {
        id: Date.now(),
        sample_id: sampleID || `SMP-${Math.floor(1000 + Math.random() * 9000)}`,
        ph_value: parseFloat(phValue) || 0,
        temperature: parseFloat(temperature) || 0,
        turbidity: parseFloat(turbidity) || 0,
        conductivity: parseFloat(conductivity) || 0,
        tds: parseFloat(tds) || 0,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('physical_data')
            .insert([{
                sample_id: newRecord.sample_id,
                ph_value: newRecord.ph_value,
                temperature: newRecord.temperature,
                turbidity: newRecord.turbidity,
                conductivity: newRecord.conductivity,
                tds: newRecord.tds
            }]);

        if (error) throw error;
    } catch (error) {
        console.warn('⚠️ Supabase physical_data insert failed (fetch error or placeholder URL). Using local in-memory store:', error.message || error);
        fallbackPhysicalData.unshift(newRecord);
    }

    res.redirect('/fwater');
});

// GET — Retrieve and display physical data
router.get('/', async (req, res) => {
    try {
        const { data: physicalData, error } = await supabase
            .from('physical_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.render('pdi', { physicalData: physicalData && physicalData.length > 0 ? physicalData : fallbackPhysicalData });
    } catch (error) {
        console.warn('⚠️ Supabase physical_data query failed, falling back to local memory store:', error.message || error);
        res.render('pdi', { physicalData: fallbackPhysicalData });
    }
});

module.exports = router;
