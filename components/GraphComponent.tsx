// app/GraphPage.tsx
'use client'
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import Graph from 'graphology';

// Define interfaces for nodes and links compatible with D3
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label?: string;
  color?: string;
  size?: number;
  degree?: number; // New property to store the degree of the node
  textColor: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  color?: string;
  size?: number;
  textColor: string;
}

interface GraphPageProps {
  graphData: Graph; // Graphology graph
}

const GraphComponent: React.FC<GraphPageProps> = ({ graphData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Reconstruct the Graphology Graph instance
    const graph = new Graph();
    graph.import(graphData);

    // Calculate the degree of each node
    graph.forEachNode((node, attributes) => {
      attributes.degree = graph.degree(node);
    });

    // Convert Graphology graph to nodes and links arrays
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    graph.forEachNode((nodeKey, nodeAttributes) => {
      nodes.push({
        id: nodeKey,
        ...nodeAttributes,
        size: Math.max(10, nodeAttributes.degree! * 2), // Ensure size is large enough to view
        // Set textColor to white if degree exceeds the threshold
        textColor: nodeAttributes.degree! >= 10 ? 'white' : (nodeAttributes.textColor || 'gray'),
      });
    });

    graph.forEachEdge((edgeKey, attributes, source, target) => {
      links.push({
        id: edgeKey,
        source: source,
        target: target,
        ...attributes,
      });
    });

    // Select the SVG element and clear any previous content
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    // Set the SVG width and height to '100%'
    svgElement.attr('width', '100%').attr('height', '100%');

    // Get dimensions from the SVG element
    const svgRect = svgRef.current?.getBoundingClientRect();
    const width = svgRect?.width || 800;
    const height = svgRect?.height || 600;
    const padding = 50; // Padding around the graph

    // Add zoom and pan behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10]) // Define the zoom scale extent
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    const svg = svgElement.call(zoomBehavior);

    const g = svg.append('g'); // Container for all the elements

    // Add a container for the graph elements to apply transformations
    const graphGroup = g.append('g');

    // Set up the D3 force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3.forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300)) // Adjust strength for better spacing
      .force('center', d3.forceCenter(0, 0))
      .force('x', d3.forceX().strength((d) => (d.degree || 0) * 0.01)) // Slight pull towards center based on degree
      .force('y', d3.forceY().strength((d) => (d.degree || 0) * 0.01)) // Slight pull towards center based on degree
      .stop(); // Stop the simulation to manually control ticks

    // Manually run the simulation to completion
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    // Calculate the bounding box of the nodes
    const xValues = nodes.map((d) => d.x!);
    const yValues = nodes.map((d) => d.y!);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    // Calculate scale to fit the graph within the SVG with padding
    const scale = Math.min(
      (width - 2 * padding) / graphWidth,
      (height - 2 * padding) / graphHeight
    );

    // Calculate translation to center the graph
    const translateX = width / 2 - (minX + graphWidth / 2) * scale;
    const translateY = height / 2 - (minY + graphHeight / 2) * scale;

    // Apply the calculated zoom transform
    svg.call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale * 30)
    );

    // Add lines for the links
    const link = graphGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => Math.sqrt(d.size || 1))
      .attr('stroke', (d) => d.color || '#999');

    // Add circles for the nodes
    const node = graphGroup
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.size || 10) // Include degree influence in size
      .attr('fill', (d) => d.color || '#1f77b4')
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add labels for the nodes
    const labels = graphGroup
      .selectAll<SVGTextElement, GraphNode>('text.node-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .text((d) => d.label || d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', -10)
      .attr('font-size', '12px')
      .attr('fill', (d) => d.textColor || 'white');

    // Add labels for the links
    const linkLabels = graphGroup
      .selectAll<SVGTextElement, GraphLink>('text.link-label')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .text((d) => (d.label ? d.label.toLowerCase() : ''))
      .attr('font-size', '6px')
      .attr('fill', (d) => d.textColor || 'white');

    // Function to update positions based on node coordinates
    function updatePositions() {
      // Update positions of links
      link
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      // Update positions of nodes
      node
        .attr('cx', (d) => d.x!)
        .attr('cy', (d) => d.y!);

      // Update positions of node labels
      labels
        .attr('x', (d) => d.x!)
        .attr('y', (d) => d.y! - 10);

      // Update positions of link labels at the midpoint of the links
      linkLabels
        .attr(
          'x',
          (d) => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2
        )
        .attr(
          'y',
          (d) => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2
        );
    }

    // Call updatePositions initially to set positions
    updatePositions();

    // Add the tick handler to the simulation
    simulation.on('tick', updatePositions);

    // Clean up the simulation on component unmount
    return () => {
      simulation.stop();
    };
  }, [graphData]);

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>;
};

export default GraphComponent;