import User from '../models/User'; // MongoDB User model
import { signToken } from '../services/auth'; // Token utility
import { searchGoogleBooks } from '../services/googleBooks'; // Google Books API logic

const resolvers = {
   Query: {
      // Fetch a single user by ID or username
      getSingleUser: async (_, { id, username }, { user }) => {
         const foundUser = await User.findOne({
            $or: [{ _id: user ? user._id : id }, { username }],
         });

         if (!foundUser) {
            throw new Error('Cannot find a user with this ID or username!');
         }
         return foundUser;
      },

      // Search books using the Google Books API
      searchBooks: async (_, { query }) => {
         const books = await searchGoogleBooks(query);
         return books;
      },

      // Get saved books for the logged-in user
      savedBooks: async (_, __, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to view saved books.');
         }
         return user.savedBooks;
      },
   },

   Mutation: {
      // Create a new user and return auth payload
      createUser: async (_, { username, email, password }) => {
         const user = await User.create({ username, email, password });
         if (!user) {
            throw new Error('Error creating user.');
         }
         const token = signToken(user.username, user.password, user._id);
         return { token, user };
      },

      // Log in an existing user and return auth payload
      login: async (_, { username, email, password }) => {
         const user = await User.findOne({ $or: [{ username }, { email }] });
         if (!user) {
            throw new Error('Cannot find user.');
         }

         const correctPw = await user.isCorrectPassword(password);
         if (!correctPw) {
            throw new Error('Incorrect password.');
         }

         const token = signToken(user.username, user.password, user._id);
         return { token, user };
      },

      // Save a book for the logged-in user
      saveBook: async (_, { bookInput }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to save books.');
         }

         const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { savedBooks: bookInput } },
            { new: true, runValidators: true }
         );
         return updatedUser;
      },

      // Remove a book from the logged-in user's saved books
      deleteBook: async (_, { bookId }, { user }) => {
         if (!user) {
            throw new Error('You must be logged in to delete books.');
         }

         const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $pull: { savedBooks: { bookId } } },
            { new: true }
         );

         if (!updatedUser) {
            throw new Error('Could not find user with this ID.');
         }
         return updatedUser;
      },
   },
};

export default resolvers;
