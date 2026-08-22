// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

// In-memory fallback user store for local testing/offline fallback
const fallbackUsers = [];

// GET — Sign-up page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// GET — Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// POST — Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let registered = false;

        try {
            // Check if user already exists in Supabase
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existing) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Insert new user into Supabase
            const { data, error } = await supabase
                .from('users')
                .insert([{ name, email, password: hashedPassword }])
                .select()
                .single();

            if (error) throw error;
            registered = true;
        } catch (dbError) {
            console.warn('⚠️ Supabase users operation failed. Using local in-memory fallback:', dbError.message || dbError);
            
            const existingLocal = fallbackUsers.find(u => u.email === email);
            if (existingLocal) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                created_at: new Date().toISOString()
            };
            fallbackUsers.push(newUser);
            registered = true;
        }

        if (registered) {
            return res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (error) {
        console.error('Sign-Up Error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// POST — Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user = null;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (!error && data) {
                user = data;
            } else if (error) {
                throw error;
            }
        } catch (dbError) {
            console.warn('⚠️ Supabase user query failed. Checking local memory fallback:', dbError.message || dbError);
            user = fallbackUsers.find(u => u.email === email);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const secret = process.env.JWT_SECRET || 'water_pollution_jwt_secret_2024';
        const token = jwt.sign(
            { id: user.id, email: user.email },
            secret,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});

module.exports = router;