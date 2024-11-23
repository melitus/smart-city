import express from 'express';
import { ingestWeatherData } from '../services/data-ingestion-layer';

const weatherRouter = express.Router();

weatherRouter.post('/api/weather-updates', async (req, res) => {
  const data: any = req.body;
  if (Array.isArray(data)) {      
  await ingestWeatherData(data)
   res.status(200).send({message: 'Weather data sent', data});
    } else {
      res.status(400).send('Invalid weather update data');
    }
  });
  

export default weatherRouter;
