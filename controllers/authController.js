// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');

const fallbackUsers = [];

// Sign Up
exports.signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let registered = false;

        try {
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existing) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const { data, error } = await supabase
                .from('users')
                .insert([{ name, email, password: hashedPassword }])
                .select()
                .single();

            if (error) throw error;
            registered = true;
        } catch (dbError) {
            console.warn('⚠️ Supabase users operation failed in authController. Using local fallback:', dbError.message || dbError);
            const existingLocal = fallbackUsers.find(u => u.email === email);
            if (existingLocal) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            fallbackUsers.push({
                id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                created_at: new Date().toISOString()
            });
            registered = true;
        }

        if (registered) {
            res.status(201).json({ message: 'User registered successfully' });
        }
    } catch (error) {
        console.error('Sign-Up Error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Sign In
exports.signIn = async (req, res) => {
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
            console.warn('⚠️ Supabase user lookup failed in authController. Using local fallback:', dbError.message || dbError);
            user = fallbackUsers.find(u => u.email === email);
        }

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const secret = process.env.JWT_SECRET || 'water_pollution_jwt_secret_2024';
        const token = jwt.sign(
            { id: user.id, email: user.email },
            secret,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Sign-in successful', token });
    } catch (error) {
        console.error('Sign-In Error:', error);
        res.status(500).json({ message: 'Error signing in' });
    }
};

