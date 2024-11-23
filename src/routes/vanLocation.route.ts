import express from 'express';
import { ingestVanData } from '../services/data-ingestion-layer';

const vanLocationRouter = express.Router();

vanLocationRouter.post('/api/van-location', async (req, res) => {
    const data: any = req.body;
    if (Array.isArray(data)) {      
    await ingestVanData(data)
     res.status(200).send({message: 'Van location data sent', data});
    } else {
      res.status(400).send('Invalid weather update data');
    }
  });
  ;

export default vanLocationRouter;
