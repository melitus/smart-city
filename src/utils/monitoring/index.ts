export const logError = (message: string, error: Error): void => {
    console.error(`${message}\nStack Trace: ${error.stack}`);
    // It will be great to write the error to a file or an external logging service like Loki + Grafana
  };

  export const sendAlert = (message: string): void => {
    // This hypothetical implementation simulate how to send alerts via email, SMS to a monitoring tool 
    // like Prometheus + Grafana, or Datadog
    console.log(`ALERT: ${message}`);
  };
  