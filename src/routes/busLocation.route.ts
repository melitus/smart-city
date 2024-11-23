import express from 'express';
import { ingestBusData } from '../services/data-ingestion-layer';

const busRouter = express.Router();
busRouter.post('/api/bus-location', async (req, res) => {
    const data: any = req.body;
    if (Array.isArray(data)) {
      await ingestBusData(data)
      res.status(200).send({message: 'Bus location data sent', data});
    } else {
      res.status(400).send('Invalid bus location data');
    }
  });
  
export default busRouter;
