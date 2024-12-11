import axios from 'axios';
import Graph from 'graphology';
import { parseNeo4jDataToGraph } from '@/utils/graphParser';
import { HEADERS } from '@/services/constant'; 

export interface ChatResponse {
  response: string;
}

export class GraphService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/graph/api';

  public static async fetchAllNodes(): Promise<Graph | null> {
    try {
      const response = await axios.get(`${this.BASE_URL}/findAllNode`, {
        headers: HEADERS,
      });
      const graph = parseNeo4jDataToGraph(response.data);
      return graph;
    } catch (error) {
      console.error('Error fetching graph data:', error);
      return null;
    }
  }

  public static async sendPrompt(prompt: string): Promise<string | null> {
    try {
      const response = await axios.post<ChatResponse>(
        `${this.BASE_URL}/chat`,
        { prompt },
        {
          headers: HEADERS,
        }
      );

      if (response.data && response.data.response) {
        return response.data.response;
      } else {
        console.warn('No response field in API response:', response.data);
        return 'No response from LLM.';
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error sending prompt:', error);
      throw new Error(error.response?.data?.message || error.message || 'Unknown error');
    }
  }

  public static async saveToGraph(content: string): Promise<void> {
    try {
      const response = await axios.post(
        `${this.BASE_URL}/saveToGraph`,
        content,
        {
          headers: {
            'Content-Type': 'text/plain'
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to save to graph: ${response.statusText}`);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving to graph:', error);
      throw new Error(error.response?.data?.message || error.message || 'Unknown error');
    }
  }

}