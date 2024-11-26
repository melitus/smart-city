import { Router } from 'express';

import busLocationRoutes from './busLocation.route';
import weatherUpdatesRoutes from './weatherUpdates.route';
import vanLocationRoutes from './vanLocation.route';
import passengerWaitingRoutes from './passengerWaiting.route';
import insightRouter from './insights.route'

const apiRouter = Router();
console.log('💻 SETUP - Installing All Routes...');


apiRouter.use(busLocationRoutes);
apiRouter.use(weatherUpdatesRoutes);
apiRouter.use(vanLocationRoutes);
apiRouter.use(passengerWaitingRoutes);
apiRouter.use(insightRouter);


export default apiRouter;
