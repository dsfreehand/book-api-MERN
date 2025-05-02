import { IResolvers } from "@graphql-tools/utils"; // Correct import for IResolvers
import User from "../models/User.js";
import { signToken } from "../services/auth.js";

// Define the resolvers for the queries and mutations
const resolvers: IResolvers = {
  Query: {
    // Fetch a single user by either their ID or username
    getSingleUser: async (_, { id, username }, { user }) => {
      try {
        const foundUser = await User.findOne({
          $or: [{ _id: id || user?._id }, { username }],
        });
        if (!foundUser) {
          throw new Error("Cannot find a user with this id or username!");
        }
        return foundUser;
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },

    // Fetch saved books of the logged-in user
    savedBooks: async (_, __, { user }) => {
      try {
        const foundUser = await User.findById(user._id);
        if (!foundUser) {
          throw new Error("User not found");
        }
        return foundUser.savedBooks;
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },
  },

  Mutation: {
    // Create a new user and sign a token for them
    createUser: async (_, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },

    // Log in a user and return a token
    login: async (_, { username, email, password }) => {
      try {
        const user = await User.findOne({
          $or: [{ username }, { email }],
        });
        if (!user) {
          throw new Error("Can't find this user");
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new Error("Wrong password!");
        }

        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },

    // Save a book to a user's savedBooks array
    saveBook: async (_, { bookInput }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },

    // Delete a book from a user's savedBooks array
    deleteBook: async (_, { bookId }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }
        return updatedUser;
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },
  },
};

export default resolvers;
