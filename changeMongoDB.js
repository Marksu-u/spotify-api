import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Audio from './models/audio.model.js';

dotenv.config();

const mongoURI = process.env.MONGO_DB_ACCESS;

const updateGenreField = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Fetch all Audio documents
    const audios = await Audio.find();

    for (let audio of audios) {
      // Check if metadata.genre exists and is an array
      const firstGenre =
        Array.isArray(audio.metadata.genre) && audio.metadata.genre.length > 0
          ? audio.metadata.genre[0]
          : 'Unknown'; // Default to 'Unknown' if it's not an array or empty

      // Update the document, specifically the metadata.genre field
      await Audio.findByIdAndUpdate(audio._id, {'metadata.genre': firstGenre});
    }

    console.log('All audio documents have been updated.');
  } catch (error) {
    console.error('Error updating audio documents:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateGenreField();
