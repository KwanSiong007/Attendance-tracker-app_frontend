import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import { BACKEND_URL } from "../constants/BackendUrl";
import { useEffect, useState } from "react";

//The function takes two parameters: email and password, which are the user's email address and password, respectively.
//It's declared as an async function, which means it can perform asynchronous operations (like interacting with a database) and use await to pause execution until the operation is complete.
export const register = async (email, password) => {
  try {
    //The await keyword pauses execution until this function completes.
    //It creates a new user account using the provided email and password.
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    //After successfully creating a user, the function extracts the user object from the userCredential.
    //This object represents the newly created user.
    const user = userCredential.user;
    //The function returns the user object, which can be useful for further operations or for indicating a successful registration.
    return user;
  } catch (error) {
    //If an error occurs during user registration, this line extracts an error code from the error object. The error code provides information about the type of error that occurred.
    const errorCode = error.code;
    //This line extracts the error message from the error object. The error message provides additional details about the error, which can be helpful for debugging.
    const errorMessage = error.message;
    console.log(`Error at register: ${errorCode} ${errorMessage}`);
  }
};

export const signIn = async (email, password) => {
  //const [user, setUser] = useState([]);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    //const user = userCredential.user;
    const userID = userCredential.user.uid;
    console.log("userID:", userID);
    //! Make query to workers table by using userID, then consolidate all details together in user object?
    const response = await axios.get(`${BACKEND_URL}/workers/${userID}`);
    //setUser(response.data);
    const user = response.data;
    console.log("user:", user);
    return user;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`Error at signIn
    : ${errorCode} ${errorMessage}`);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(`Error at signOut
    : ${errorCode} ${errorMessage}`);
  }
};

//onAuthStateChanged: This is a listener function that allows you to track the authentication state of a user.
//-When you set up this listener and provide a callback function, Firebase will call this function whenever a user signs in or signs out.
//callback: This is a function that will be called whenever the user's authentication state changes.
export const reAuth = (callback) => {
  onAuthStateChanged(auth, callback);
};

//You're defining a function called getCurrentUser. This function doesn't take any arguments (that's what () means).
//Inside the getCurrentUser function, you're returning the currentUser property of the auth object.
//currentUser is the currently signed-in user if there is one. This property contains information about the user, like their username or email.
//If no user is signed in, currentUser will be null or undefined.
export const getCurrentUser = () => {
  return auth.currentUser;
};
