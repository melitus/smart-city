import ActionableInsightModel, { ActionableInsight, InsightType } from "../../models/actionableInsight.model";

/**
 * Saves actionable insights for later retrieval.
 * @param insight - Actionable insight data
 */
export const saveActionableInsight = async (insight: Partial<ActionableInsight>): Promise<void> => {
  try {
    const actionableInsight = new ActionableInsightModel(insight);
    await actionableInsight.save();
    console.log('Saved actionable insight:', actionableInsight);
  } catch (error) {
    console.trace(error);
    console.error('Error saving actionable insight:', error);
  }
};

/**
 * Retrieves all actionable insights from the database.
 * @returns {Promise<ActionableInsight[]>} - A promise that resolves with an array of actionable insights.
 */
export const getActionableInsights = async (): Promise<ActionableInsight[]> => {
  try {
    // Fetch all actionable insights from the database
    let searchQuery: any = {};
    const insights = await ActionableInsightModel.find(searchQuery); 
    console.log({insights})
    return insights;
  } catch (error) {
    console.error('Error retrieving actionable insights:', error);
    throw new Error('Unable to fetch actionable insights');
  }
};