import express from "express";
import path from "node:path";
import db from "./config/connection.js";
import routes from "./routes/index.js";

// Apollo Server Setup for GraphQL
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./schemas/typeDefs.js";
import resolvers from "./schemas/resolvers.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Set up a flag to toggle between REST and GraphQL (can use an env variable or any configuration method)
const useGraphQL = process.env.USE_GRAPHQL === "true";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve client/build as static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Apollo Server Setup for GraphQL
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Add authentication middleware here
      return { req };
    },
  });

  await server.start();
  server.applyMiddleware({ app });
  console.log(
    `🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
};

// Start GraphQL server if the flag is set to true
if (useGraphQL) {
  db.once("open", async () => {
    // Start GraphQL server
    await startApolloServer();
    app.listen(PORT, () => {
      console.log(`🌍 Server is listening on http://localhost:${PORT}`);
    });
  });
} else {
  // If we're not using GraphQL, only use RESTful API
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Server is listening on http://localhost:${PORT}`);
    });
  });

  // Use REST routes
  app.use(routes);
}
