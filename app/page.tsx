'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ChatComponent from '@/components/ChatComponent';
import { Grid, Alert } from '@mui/material'; // 1. Import Alert
import Graph from 'graphology';
import { GraphService } from '@/services/graphService';

const GraphComponent = dynamic(() => import('../components/GraphComponent'), { ssr: false });

const HomePage: React.FC = () => {
  const [graphData, setGraphData] = useState<Graph | null>(null);
  const [error, setError] = useState<string | null>(null); // 2. Add error state

  const fetchGraphData = async () => {
    try {
      const graph = await GraphService.fetchAllNodes();
      if (graph) {
        setGraphData(graph);
        setError(null); 
      } else {
        setError('Failed to fetch graph data, please, check your neo4j db connection');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('An unexpected error occurred while fetching graph data.');
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
    <Grid container sx={{ height: '100vh', position: 'relative' }}>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
        >
          {error}
        </Alert>
      )}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          height: '100%',
          overflow: 'hidden',
          border: '2px solid darkgray',
          boxSizing: 'border-box',
        }}
      >
        <ChatComponent onSaveComplete={refreshGraphData} />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          height: '100%',
          overflow: 'hidden',
          border: '2px solid darkgray',
          boxSizing: 'border-box',
        }}
      >
        {graphData && <GraphComponent graphData={graphData} />}
      </Grid>
    </Grid>
  );
};

export default HomePage;