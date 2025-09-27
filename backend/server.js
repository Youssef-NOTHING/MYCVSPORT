const express = require('express');
const cors = require('cors');
const path = require('path');
const upload = require('./upload');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Placeholder for comments
let comments = [];

app.post('/api/comments', (req, res) => {
    const { comment } = req.body;
    if (comment) {
        comments.push(comment);
        res.status(201).json({ success: true });
    } else {
        res.status(400).json({ success: false });
    }
});

app.get('/api/comments', (req, res) => {
    res.json(comments);
});

app.post('/api/upload', upload.array('media'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    // Return file info for frontend to display
    const files = req.files.map(f => ({
        filename: f.filename,
        url: `/uploads/${f.filename}`,
        mimetype: f.mimetype
    }));
    res.status(201).json({ success: true, files });
});

app.get('/api/media', (req, res) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) return res.status(500).json({ success: false });
        // Filter images and videos
        const mediaFiles = files.filter(f => /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(f)).map(f => ({
            filename: f,
            url: `/uploads/${f}`,
            type: /\.(mp4|webm|mov)$/i.test(f) ? 'video' : 'image'
        }));
        res.json(mediaFiles);
    });
});

app.delete('/api/media/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    fs.unlink(filePath, err => {
        if (err) return res.status(404).json({ success: false, message: 'File not found.' });
        res.json({ success: true });
    });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
