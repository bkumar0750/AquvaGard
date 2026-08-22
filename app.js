const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Supabase client (no async connection needed)
require('./config/database');

// Import routes
const physicalRoutes = require('./routes/physical');
const chemicalRoutes = require('./routes/chemical');
const biologicalRoutes = require('./routes/biological');
const airRoutes = require('./routes/air');
const environmentalRoutes = require('./routes/environmental');
const informationRoutes = require('./routes/information');
const authRoutes = require('./routes/auth');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// ── Routes ──────────────────────────────────────────────────────────────────

// Home
app.get('/', (req, res) => {
    res.render('welcome', { pageTitle: 'Home Page', mainHeading: 'Welcome to Water Pollution Awareness' });
});

// Authentication routes
app.use('/', authRoutes);

// Main water pollution page
app.get('/fwater', (req, res) => {
    res.render('fwater', { pageTitle: 'Main', mainHeading: 'About Water Pollution' });
});

// Information route
app.get('/information', (req, res) => {
    res.render('information');
});
app.use('/information', informationRoutes);

// Physical
app.use('/pdi', physicalRoutes);
app.get('/physical', (req, res) => res.render('Physical'));
app.use('/physical', physicalRoutes);

// Chemical
app.use('/cdi', chemicalRoutes);
app.get('/chemical', (req, res) => res.render('Chemical'));
app.use('/chemical', chemicalRoutes);

// Biological
app.use('/bdi', biologicalRoutes);
app.get('/biological', (req, res) => res.render('Biological'));
app.use('/biological', biologicalRoutes);

// Air
app.use('/adi', airRoutes);
app.get('/air', (req, res) => res.render('Air'));
app.use('/air', airRoutes);

// Environmental
app.use('/odi', environmentalRoutes);
app.get('/environmental', (req, res) => res.render('Environmental'));
app.use('/environmental', environmentalRoutes);

// Water pollution & treatment info pages
app.get('/treatment', (req, res) => res.render('treatment'));
app.get('/waterpollution', (req, res) => res.redirect('/fwater'));

// AQI Calculator
app.get('/AQI', (req, res) => res.render('AQI'));

// Parameters routes
const parametersRoutes = require('./routes/parameters');
app.get('/parameters', (req, res) => res.render('parameters'));
app.use('/parameters', parametersRoutes);

// Parameter detail pages
app.get('/p1ammonia',    (req, res) => res.render('p1ammonia'));
app.get('/p2bod',        (req, res) => res.render('p2bod'));
app.get('/p3algae',      (req, res) => res.render('p3algae'));
app.get('/p4cdom',       (req, res) => res.render('p4cdom'));
app.get('/p5chloride',   (req, res) => res.render('p5chloride'));
app.get('/p6chlorophyll',(req, res) => res.render('p6chlorophyll'));
app.get('/p7conductivity',(req,res) => res.render('p7conductivity'));
app.get('/p8cyanide',    (req, res) => res.render('p8cyanide'));
app.get('/p9depth',      (req, res) => res.render('p9depth'));
app.get('/p10do',        (req, res) => res.render('p10do'));
app.get('/p11lsp',       (req, res) => res.render('p11lsp'));
app.get('/p12nitrate',   (req, res) => res.render('p12nitrate'));
app.get('/p13or',        (req, res) => res.render('p13or'));
app.get('/p14ph',        (req, res) => res.render('p14ph'));
app.get('/p15phosphorus',(req, res) => res.render('p15phosphorus'));
app.get('/p16rhodamine', (req, res) => res.render('p16rhodamine'));
app.get('/p17temp',      (req, res) => res.render('p17temp'));
app.get('/p18toc',       (req, res) => res.render('p18toc'));
app.get('/p19turbidity', (req, res) => res.render('p19turbidity'));
app.get('/p20waterlevel',(req, res) => res.render('p20waterlevel'));
app.get('/p21cp',        (req, res) => res.render('p21cp'));

// Water Quality Index pages
app.get('/w6swqi',      (req, res) => res.render('w6swqi'));
app.get('/w4nsfwqi',    (req, res) => res.render('w4nsfwqi'));
app.get('/w5wawqi',     (req, res) => res.render('w5wawqi'));
app.get('/w1ccmewqi',   (req, res) => res.render('w1ccmewqi'));
app.get('/w3iwqi',      (req, res) => res.render('w3iwqi'));
app.get('/w2gwqi',      (req, res) => res.render('w2gwqi'));
app.get('/w7delphiwqi', (req, res) => res.render('w7delphiwqi'));
app.get('/w8minewqi',   (req, res) => res.render('w8minewqi'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
