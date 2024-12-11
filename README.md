# LLM Chat Graph

This is a web application that addresses the challenge of organizing and visualizing unstructured information from user queries. The application integrates a conversational interface with dynamic knowledge graph visualization to provide a solution to this problem. Users input queries and receive detailed responses from a Large Language Model (LLM). These responses are then transformed into a continuously evolving knowledge graph, visualized in real-time on the web interface for interactive exploration.

Watch `LLM Chat Graph` demo on Youtube:

[![Watch this video on YouTube](https://img.youtube.com/vi/QpTr1MWfTG0/0.jpg)](https://www.youtube.com/watch?v=QpTr1MWfTG0)


## Features

- User Input: Users submit queries via the conversational interface.
- LLM Response: The system obtains detailed responses from the LLM.
- Graph Update Option: Users choose to add the LLM's response to the knowledge graph.
- Graph Construction: The system extracts entities and relationships to update the graph database.
- Visualization Update: The frontend displays the updated knowledge graph in real-time for user interaction.

## Installation

## Prerequisites

- Node.js (v20.11 or higher)
- npm (v10.2.4 or higher)

## [Next.js](https://nextjs.org/) 
#### Project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Create a `.env.development` file in the root of the project.

    ```bash
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
    ```

2. Run the development server.

    ```bash
    npm run dev
    ```

3. To build and run the project in production mode.

    ```bash
    npm run build
    npm start
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build and Run Docker container

Before running docker build command make sure you have build project using maven command above. 
1. To build Docker image, run the following command:

   ```bash
    docker build -t graph-app . 
   ```

2. To run your Docker container using the newly created image:

   ```bash
    docker run -p 8080:8080 graph-app 
   ```