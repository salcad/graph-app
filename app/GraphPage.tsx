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
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  color?: string;
  size?: number;
}

interface GraphPageProps {
  graphData: Graph; // Graphology graph
}

const GraphPage: React.FC<GraphPageProps> = ({ graphData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Reconstruct the Graphology Graph instance
    const graph = new Graph();
    graph.import(graphData);

    // Convert graphology graph to nodes and links arrays
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Ensure that nodes have label properties
    graph.forEachNode((nodeKey, nodeAttributes) => {
      nodes.push({
        id: nodeKey,
        ...nodeAttributes,
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

    // Set dimensions for the SVG
    const width = 800;
    const height = 600;

    // Select the SVG element and clear any previous content
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove();

    // Add zoom and pan behavior
    const svg = svgElement
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
          g.attr('transform', event.transform);
        })
      );

    const g = svg.append('g'); // Container for all the elements

    // Set up the D3 force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Add lines for the links
    const link = g
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => Math.sqrt(d.size || 1))
      .attr('stroke', (d) => d.color || '#999');

    // Add circles for the nodes
    const node = g
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.size || 5)
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
    const labels = g
      .selectAll<SVGTextElement, GraphNode>('text.node-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      // Use d.label or d.id as fallback
      .text((d) => d.label || d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', -10)
      .attr('font-size', '12px')
      .attr('fill', 'white'); 

    // Add labels for the links
    const linkLabels = g
      .selectAll<SVGTextElement, GraphLink>('text.link-label')
      .data(links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .text((d) => d.label.toLowerCase() || '')
      .attr('font-size', '6px')
      .attr('fill', 'gray'); 

    // Update positions on each simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      node.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

      labels.attr('x', (d) => d.x!).attr('y', (d) => d.y! - 10);

      // Position the link labels at the midpoint of the links
      linkLabels
        .attr('x', (d) => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', (d) => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);
    });

    // Clean up the simulation on component unmount
    return () => {
      simulation.stop();
    };
  }, [graphData]);

  return <svg ref={svgRef}></svg>;
};

export default GraphPage;