const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

const app = express();
const port = 3001;

mongoose.connect('mongodb://127.0.0.1:27017/audioDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>
    {console.log("MongoDB connected");}
);

const Audio = mongoose.model('Audio', { name: String, audio: Buffer });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('audioFile'), async (req, res) => {
  try {
    const audio = new Audio({
      name: req.file.originalname,
      audio: req.file.buffer
    });
    await audio.save();
    res.send('Audio file uploaded successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading audio file');
  }
});

app.get('/audio/:id', async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return res.status(404).send('Audio not found');
    }
    const audioStream = new Readable();
    audioStream.push(audio.audio);
    audioStream.push(null);

    res.set({
      'Content-Type': 'audio/mp3',
      'Content-Length': audio.audio.length
    });
    audioStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving audio');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
