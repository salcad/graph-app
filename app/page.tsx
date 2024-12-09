'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseNeo4jDataToGraph } from '../utils/graphParser';
import ChatComponent from '../components/ChatComponent';
import { Grid } from '@mui/material';

interface GraphData {
  nodes: any[];
  links: any[];
}

const GraphComponent = dynamic(() => import('../components/GraphComponent'), { ssr: false });

const HomePage: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const fetchGraphData = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/findAllNode', { cache: 'no-store' });
      const data = await res.json();
      const graph = parseNeo4jDataToGraph(data);
      setGraphData(graph);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Function to refresh graph data, passed to ChatComponent
  const refreshGraphData = () => {
    fetchGraphData();
  };

  return (
    <Grid container style={{ height: '100vh' }}>
      <Grid item xs={12} md={6} style={{ height: '100%', overflow: 'auto' }}>
        <ChatComponent onSaveComplete={refreshGraphData} />
      </Grid>
      <Grid item xs={12} md={6} style={{ height: '100%', overflow: 'hidden' }}>
        <GraphComponent graphData={graphData} />
      </Grid>
    </Grid>
  );
};

export default HomePage;