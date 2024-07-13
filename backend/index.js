const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { body, validationResult } = require('express-validator');
const path = require('path');
const cors = require('cors');

// Initialize Firestore
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());  // Enable CORS for all routes

app.post('/submitForm', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
        const docRef = await db.collection('forms').add({
            name,
            email,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).send(`Form submitted with ID: ${docRef.id}`);
    } catch (error) {
        res.status(500).send('Error adding form: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
