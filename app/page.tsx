import dynamic from 'next/dynamic';
import { parseNeo4jDataToGraph } from '../utils/graphParser';
import ChatComponent from '../components/ChatComponent';
import { Grid } from '@mui/material';

const GraphComponent = dynamic(() => import('../components/GraphComponent'), { ssr: false });

export default async function HomePage() {
  const res = await fetch('http://localhost:8080/api/findAllNode', { cache: 'no-store' });
  const data = await res.json();
  const graph = parseNeo4jDataToGraph(data);

  return (
    <Grid container style={{ height: '100vh' }}>
      <Grid item xs={12} md={6} style={{ height: '100%', overflow: 'auto' }}>
        <ChatComponent />
      </Grid>
      <Grid item xs={12} md={6} style={{ height: '100%', overflow: 'hidden' }}>
        <GraphComponent graphData={graph} />
      </Grid>
    </Grid>
  );
}