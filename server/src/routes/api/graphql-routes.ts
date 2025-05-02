import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "../../schemas/typeDefs";
import resolvers from "../../schemas/resolvers";
import { authenticateToken } from "../../services/auth"; // Authentication middleware
import router from ".";

const app = express();

// Initialize Apollo Server with typeDefs and resolvers
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Check for JWT token and make user available in the context
    const token = req.headers.authorization || "";
    const mockResponse = {} as express.Response; // Create a proper mock Response object
    const user = authenticateToken(
      req as express.Request,
      mockResponse,
      (err?: any) => {
        if (err) throw err;
      }
    ); // Cast req to CustomRequest to match the expected type
    return { user };
  },
});

apolloServer.applyMiddleware({ app, path: "/graphql" });

export default router;
