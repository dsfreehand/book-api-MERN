import { gql } from 'apollo-server';

const typeDefs = gql`
   type Query {
      getSingleUser(id: ID, username: String): User
      searchBooks(query: String!): [Book]
      savedBooks: [Book]
   }

   type Mutation {
      createUser(username: String!, email: String!, password: String!): AuthPayload
      login(username: String, email: String, password: String!): AuthPayload
      saveBook(bookInput: BookInput!): User
      deleteBook(bookId: ID!): User
   }

   type User {
      id: ID!
      username: String!
      email: String!
      savedBooks: [Book]
   }

   type Book {
      bookId: ID!
      title: String!
      author: String!
      description: String
      image: String
      link: String
   }

   input BookInput {
      bookId: ID!
      title: String!
      author: String!
      description: String
      image: String
      link: String
   }

   type AuthPayload {
      token: String!
      user: User
   }
`;

export default typeDefs;
