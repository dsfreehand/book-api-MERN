import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Apollo Server Setup for GraphQL (Commented out for now)
// import { ApolloServer } from 'apollo-server-express';
// import typeDefs from './typeDefs/typeDefs';
// import resolvers from './resolvers/resolvers';

// const startApolloServer = async () => {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     context: ({ req }) => {
//       // Add authentication middleware here
//       return { req };
//     },
//   });
  
//   await server.start();
//   server.applyMiddleware({ app });
//   console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
// };
// db.once('open', async () => {
// // Start GraphQL server
// await startApolloServer();
// });

// // End of GraphQL server setup


// Start the Express server (Comment out if testing GraphQL server)
app.listen(PORT, () =>
  console.log(`🌍 Server is listening on http://localhost:${PORT}`)
);

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
