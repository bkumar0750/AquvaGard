// routes/air.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/database');

// In-memory fallback cache when Supabase is unreachable or using placeholder credentials
const fallbackAirData = [];

// POST — Save air quality parameters
router.post('/', async (req, res) => {
    const { sampleID, pm, so2, no2, co, o3, lead, vocs } = req.body;

    if (!sampleID || !pm || !so2 || !no2 || !co || !o3 || !lead || !vocs) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    const newRecord = {
        id: Date.now(),
        sample_id: sampleID,
        pm: parseFloat(pm) || 0,
        so2: parseFloat(so2) || 0,
        no2: parseFloat(no2) || 0,
        co: parseFloat(co) || 0,
        o3: parseFloat(o3) || 0,
        lead: parseFloat(lead) || 0,
        vocs: parseFloat(vocs) || 0,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('air_quality_data')
            .insert([{
                sample_id: sampleID,
                pm: newRecord.pm,
                so2: newRecord.so2,
                no2: newRecord.no2,
                co: newRecord.co,
                o3: newRecord.o3,
                lead: newRecord.lead,
                vocs: newRecord.vocs
            }]);

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Air quality data saved successfully',
            data
        });
    } catch (error) {
        console.warn('⚠️ Supabase air_quality_data insert failed. Using local in-memory store:', error.message || error);
        fallbackAirData.unshift(newRecord);
        return res.status(201).json({
            success: true,
            message: 'Air quality data saved locally (in-memory mode)',
            data: [newRecord]
        });
    }
});

// GET — Retrieve and display air quality data
router.get('/', async (req, res) => {
    try {
        const { data: airData, error } = await supabase
            .from('air_quality_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.render('adi', { airData: airData && airData.length > 0 ? airData : fallbackAirData });
    } catch (error) {
        console.warn('⚠️ Supabase air_quality_data query failed, falling back to local memory store:', error.message || error);
        res.render('adi', { airData: fallbackAirData });
    }
});

module.exports = router;
