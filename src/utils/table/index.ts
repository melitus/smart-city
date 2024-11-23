import Table from "cli-table";
import chalk from "chalk";

// Set the style for the table header
const headerStyle = {
  border: ['green'],
  colAligns: ['middle'],
  head: ['gray'],
};

// Function to adjust table based on terminal width
const adjustColumnWidths = () => {
  const terminalWidth = process.stdout.columns; // Get terminal width
  const maxWidth = Math.floor(terminalWidth / 6); // Maximum width for each column
  const defaultColumnWidths = [30, 30, 30, 30, 30, 60]; // Default widths

  // Adjust the column widths dynamically based on available terminal width
  const adjustedWidths = defaultColumnWidths.map((width) => {
    return Math.min(width, maxWidth); // Ensure no column is too wide
  });

  return adjustedWidths;
};

export const dashboardInsight = async (result) => {
  console.log({ result });

  // Header definition
  const head = [
    chalk.blue.bold('_id'),
    chalk.blue.bold('vehicleId'),
    chalk.blue.bold('type'),
    chalk.blue.bold('detail'),
    chalk.blue.bold('location'),
    chalk.blue.bold('timestamp'),
  ];

  // Dynamically adjust column widths based on terminal size
  const columnWidths = adjustColumnWidths();

  let table = new Table({
    head: head,
    colWidths: columnWidths,
    style: headerStyle,
  });

  // Push data into the table
  result.data.forEach(({ _id, vehicleId, type, detail, location, timestamp }) => {
    table.push([_id, vehicleId, type, detail, location, timestamp]);
  });

  // Return the generated table
  return table.toString();
};
