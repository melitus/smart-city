import express from 'express';
import { readCsvFile } from '../utils/validation';
import { ingestPassengerData } from '../services/data-ingestion-layer/passenger-data.service';
import { PassengerWaitingDataSchema } from '../models';

const passengerRouter = express.Router();

passengerRouter.post('/passenger-waiting', async (req, res) => {    
    const data: any = req.body;
    if (Array.isArray(data)) {      
    await ingestPassengerData(data)
     res.status(200).send({message: 'Passenger waiting data sent', data});

    } else {
      res.status(400).send('Invalid passenger waiting data');
    }
  });
  
export default passengerRouter;
