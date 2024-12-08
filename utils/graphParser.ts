/* eslint-disable @typescript-eslint/no-explicit-any */
import Graph from 'graphology';

// Define interfaces for Neo4j data
interface Neo4jNode {
  id: number;
  labels: string[];
  properties: { [key: string]: any };
}

interface Neo4jEdge {
  id: number;
  type: string;
  startNodeId: number;
  endNodeId: number;
  properties: { [key: string]: any };
}

interface Neo4jRecord {
  n: Neo4jNode;
  r: Neo4jEdge;
  m: Neo4jNode;
}

// Color mapping for labels
const labelColors: { [label: string]: string } = {
  Technology: '#1f77b4',
  Concept: '#ff7f0e',
  Framework: '#2ca02c',
  Tool: '#d62728',
  Platform: '#9467bd',
  // Add more labels and colors as needed
};

// Function to get color based on label
const getColorByLabel = (labels: string[]): string => {
  for (const label of labels) {
    if (labelColors[label]) {
      return labelColors[label];
    }
  }
  return '#cccccc'; // Default color
};

// Function to parse Neo4j data and create a graphology Graph
export function parseNeo4jDataToGraph(data: Neo4jRecord[]): Graph {
  const graph = new Graph({ multi: true, type: 'directed' });

  data.forEach(record => {
    const { n, m, r } = record;

    // Add node n
    if (!graph.hasNode(n.id)) {
      graph.addNode(n.id.toString(), {
        label: n.properties.name,
        color: getColorByLabel(n.labels),
        // Temporary random positions; will be updated by layout
        x: Math.random(),
        y: Math.random(),
        size: 10,
      });
    }

    // Add node m
    if (!graph.hasNode(m.id)) {
      graph.addNode(m.id.toString(), {
        label: m.properties.name,
        color: getColorByLabel(m.labels),
        x: Math.random(),
        y: Math.random(),
        size: 10,
      });
    }

    // Add edge r
    const edgeKey = r.id.toString();
    if (!graph.hasEdge(edgeKey)) {
      graph.addEdgeWithKey(
        edgeKey,
        r.startNodeId.toString(),
        r.endNodeId.toString(),
        {
          label: r.type,
          color: '#999999',
          size: 1,
        }
      );
    }
  });

  return graph;
}
