import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcrypt";
import Book from "./Book"; // Ensure it's the correct import

// Define the interface for the BookDocument (if not already defined)
import type { BookDocument } from "./Book";

export interface UserDocument extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[]; // Define this as an array of BookDocument
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: [Book], // Ensure this is correctly referencing the Book schema
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash user password before saving
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to compare password for login
userSchema.methods.isCorrectPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// Virtual field `bookCount` to get the number of saved books
userSchema.virtual("bookCount").get(function () {
  return this.savedBooks.length;
});

const User = model<UserDocument>("User", userSchema);

export default User;
