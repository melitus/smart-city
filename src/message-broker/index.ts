import { registerAllConsumersListeners } from './kafka/consumers';


registerAllConsumersListeners()
  .then(() => console.log("Consumers running..."))
  .catch((err) => console.error("Error starting consumers:", err));