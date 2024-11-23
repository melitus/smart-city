import express from 'express';
import { getActionableInsights } from '../services/data-storage-layer';

const insightRouter = express.Router();

insightRouter.get('/api/dashboard/insights', async (req, res) => {
    const insights = await getActionableInsights();
    console.log(insights)
    if (insights) {
      res.status(200).send({message: 'Dashboard insight data sent', data: insights});
    } else {
      res.status(400).send('Invalid dashboard insight waiting data');
    }
  });
  
export default insightRouter;