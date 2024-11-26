import chalk from "chalk";

export const logError = (message: string, error: Error): void => {
    console.error(chalk.red(`${message}\nStack Trace: ${error.stack}`));
    // It will be great to write the error to a file or an external logging service like Loki + Grafana
  };

  export const sendAlert = (message: string): void => {
    // This hypothetical implementation simulate how to send alerts via email, SMS to a monitoring tool 
    // like Prometheus + Grafana, or Datadog
    console.log(`ALERT: ${message}`);
  };
  


/**
 * Handles HTTP errors by logging, alerting, and categorizing the error.
 * @param {any} error - The error object caught during the HTTP request.
 * @param {string} method - The HTTP method (GET, POST, etc.).
 * @param {string} url - The URL that caused the error.
 */
export const handleHttpError = (error: any, method: string, url: string) => {
  const errorCode = error.response?.status || 500;
  const errorMessage = error.response?.data?.message || error.message || "Unknown error";

  console.error(chalk.red(`Error during ${method} request to ${url}:`));
  console.error(`Status Code: ${errorCode}`);
  console.error(`Message: ${errorMessage}`);

  logError(`Critical error during ${method} request to ${url}: ${errorMessage}`, error);

  if (errorCode >= 500) {
    sendAlert(`Server Error on ${url}: ${errorMessage}`);
  }

  // Handle specific error codes
  switch (errorCode) {
    case 400:
      console.log(chalk.yellow("Client-side error. Please check your request data."));
      break;
    case 404:
      console.log(chalk.yellow("Endpoint not found. Check the API route or server setup."));
      break;
    case 500:
    default:
      console.log(chalk.red("Server error. Attempting to recover..."));
      break;
  }
};