import dynamic from 'next/dynamic';
import { parseNeo4jDataToGraph } from '../utils/graphParser';
const GraphPage = dynamic(() => import('./GraphPage'), { ssr: false });

export default async function HomePage() {
  const res = await fetch('http://localhost:8080/api/executeCypher', { cache: 'no-store' });
  const data = await res.json();
  const graph = parseNeo4jDataToGraph(data);

  return <GraphPage graphData={graph} />;
}