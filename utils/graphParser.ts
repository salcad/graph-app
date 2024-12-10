import Graph from 'graphology';

// Define interfaces for Neo4j data
interface Neo4jNode {
  id: number;
  labels: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: { [key: string]: any };
}

interface Neo4jEdge {
  id: number;
  type: string;
  startNodeId: number;
  endNodeId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: { [key: string]: any };
}

interface Neo4jRecord {
  n: Neo4jNode;
  r: Neo4jEdge;
  m: Neo4jNode;
}

function getColorByLabel(label: string): string {  
  const labelToColorMap: { [key: string]: string } = {
    // Person or Organization
    "Person": "SkyBlue",
    "People": "SkyBlue",
    "Company": "SkyBlue",
    "Organization": "SkyBlue",

    // Technologies and Software
    "Technology": "DodgerBlue",
    "Framework": "DodgerBlue",
    "Tool": "DodgerBlue",
    "Platform": "DodgerBlue",
    "Application": "DodgerBlue",
    "Library": "DodgerBlue",
    "JavaScript_library": "DodgerBlue",
    "Language": "DodgerBlue",
    "Programming_language": "DodgerBlue",
    "Systems_programming_language": "DodgerBlue",
    "Database": "DodgerBlue",
    "Query_language": "DodgerBlue",
    "Runtime_environment": "DodgerBlue",
    "Engine": "DodgerBlue",
    "Operating_system": "DodgerBlue",
    "Software_package": "DodgerBlue",
    "Module": "DodgerBlue",
    "Component": "DodgerBlue",
    "Components": "DodgerBlue",
    "Kernel": "DodgerBlue",

    // Concepts and Principles
    "Concept": "Tomato",
    "Paradigm": "Tomato",
    "Principle": "Tomato",
    "Core_principle": "Tomato",
    "Attribute": "Tomato",
    "Aspect": "Tomato",
    "Pure_functions": "Tomato",
    "Domain": "Tomato",
    "Discipline": "Tomato",

    // Features and Benefits
    "Feature": "Orange",
    "Features": "Orange",
    "Benefit": "Orange",
    "Output": "Orange",
    "Debugability": "Orange",
    "Ease_of_testing": "Orange",
    "Consistency": "Orange",
    "Help_maintain": "Orange",

    // Actions and Processes
    "Action": "Turquoise",
    "Process": "Turquoise",
    "Activity": "Turquoise",
    "Dispatching": "Turquoise",
    "Changing_method": "Turquoise",
    "Response_method": "Turquoise",

    // Types and Categories
    "Type": "LightBlue",
    "Application_type": "LightBlue",
    "Operations_type": "LightBlue",

    // Purpose and Use Cases
    "Purpose": "Peru",
    "Use_case": "Peru",

    // Resources and Devices
    "Resource": "Olive",
    "Devices": "Olive",
    "Device": "Olive",

    // Data Structures and State Management
    "Data_structure": "DodgerBlue",
    "State_management": "DodgerBlue",
    "State_management_library": "DodgerBlue",
    "Single_immutable_store": "DodgerBlue",
    "Read_only": "DodgerBlue",

    // Relations and Instances
    "Relation": "Gray",
    "Instances": "Gray",

    // Alias
    "Alias": "Pink",

    // Objects and Artifacts
    "Object": "Violet",
    "Artifact": "Violet",

    // Specifications and Targets
    "Specification": "Silver",
    "Target": "Silver",

    // Movies
    "Movie": "LightPink",
  };

  return labelToColorMap[label] || "White";
}

// Function to parse Neo4j data and create a graphology Graph
export function parseNeo4jDataToGraph(data: Neo4jRecord[]): Graph {
  const graph = new Graph({ multi: true, type: 'directed' });

  data.forEach(record => {
    const { n, m, r } = record;

    const labelColorN = n.labels.length > 0 ? getColorByLabel(n.labels[0]) : "White";
    const labelColorM = m.labels.length > 0 ? getColorByLabel(m.labels[0]) : "White";

    // Add node n
    if (!graph.hasNode(n.id.toString())) {
      graph.addNode(n.id.toString(), {
        label: n.properties.name,
        color: labelColorN,
        textColor: labelColorN, 
        // Temporary random positions; will be updated by layout
        x: Math.random(),
        y: Math.random(),
        size: 2,
      });
    }

    // Add node m
    if (!graph.hasNode(m.id.toString())) {
      graph.addNode(m.id.toString(), {
        label: m.properties.name,
        color: labelColorM,
        textColor: labelColorM, 
        x: Math.random(),
        y: Math.random(),
        size: 2,
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
          color: getColorByLabel(m.labels[0]),
          size: 1,
          // Optionally, set edge label color if needed
          // labelColor: getColorByLabel(m.labels),
        }
      );
    }
  });

  return graph;
}