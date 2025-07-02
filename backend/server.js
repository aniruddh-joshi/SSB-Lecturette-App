// server.js (Diagnostic Version)

console.log('--- Starting server.js ---');

// 1. Load environment variables
try {
    require('dotenv').config();
    console.log('✅ dotenv loaded.');
} catch (error) {
    console.error('❌ FATAL: Could not load dotenv.', error);
    process.exit(1); // Exit if essentials are missing
}

// 2. Load dependencies
try {
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    console.log('✅ Dependencies loaded (express, mongoose, cors).');

    // 3. Check for MONGO_URI
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri === 'your_connection_string') {
        console.error('❌ FATAL: MONGO_URI is not defined or is not set in your .env file.');
        console.log('Please ensure your .env file has a line like: MONGO_URI=mongodb+srv://...');
        process.exit(1);
    }
    console.log('✅ MONGO_URI found.');

    // Initialize the app
    const app = express();
    console.log('✅ Express app initialized.');

    // --- Middleware ---
    app.use(cors());
    app.use(express.json());
    console.log('✅ Middleware (cors, express.json) configured.');

    // --- Database Connection ---
    console.log('Attempting to connect to MongoDB Atlas...');
    mongoose.connect(mongoUri)
        .then(() => console.log('✅✅✅ Successfully connected to MongoDB Atlas!'))
        .catch(error => {
            console.error('❌❌❌ Error connecting to MongoDB Atlas:', error.message);
        });

    // --- Mongoose Schema & Model ---
    const lecturetteSchema = new mongoose.Schema({
        topic: { type: String, required: true },
        content: { type: String, required: true }
    });
    const Lecturette = mongoose.model('Lecturette', lecturetteSchema);
    console.log('✅ Mongoose schema and model defined.');

    // --- API Routes (Endpoints) ---
    app.get('/api/lecturettes', async (req, res) => {
        try {
            const lecturettes = await Lecturette.find();
            res.json(lecturettes);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    app.post('/api/lecturettes', async (req, res) => {
        const lecturette = new Lecturette({
            topic: req.body.topic,
            content: req.body.content
        });
        try {
            const newLecturette = await lecturette.save();
            res.status(201).json(newLecturette);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

    app.put('/api/lecturettes/:id', async (req, res) => {
        try {
            const updatedLecturette = await Lecturette.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedLecturette);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

    app.delete('/api/lecturettes/:id', async (req, res) => {
        try {
            await Lecturette.findByIdAndDelete(req.params.id);
            res.json({ message: 'Lecturette deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });
    console.log('✅ API routes configured.');

    // --- Start the Server ---
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀🚀🚀 Server is running and listening on port ${PORT} 🚀🚀🚀`);
    });

} catch (error) {
    console.error('❌❌❌ A fatal error occurred during server setup:', error);
    process.exit(1);
}