import React, { useState } from 'react';

import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
firebase.initializeApp(firebaseConfig)

 
function App() {
  const [newUser, setNewUser]= useState(false)
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: ''
  })
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const provider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
      .then(res => {
        
        const { email, name } = res.additionalUserInfo.profile
        const signedInUser = {
          isSignedIn: true,
          name: name,
          email: email
        }
        setUser(signedInUser)
        
      })
      .catch(err => {
        console.log(err)
        
    })
  }
  const handleFBLogIn = () => {
    firebase.auth().signInWithPopup(fbProvider).then(function (result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          error: '',
          success: false
        }
        setUser(signedOutUser)
    })
  }
  const handleChange = (e) => {
    
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value)
     
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user }
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo)
    }
  }

  const handleSubmit = (e) => {
    console.log(user.email, user.password)
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
         updatUserName(user.name)
        })
        .catch(error => {
          // Handle Errors here.
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
      
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user }
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          console.log('logged in successfully', res)
        })
        .catch(function (error) {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    e.preventDefault()
  }
    
  const updatUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
      
    }).then(function () {
      // Update successful.
    }).catch(function (error) {
      // An error happened.
    });
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
          <button onClick={handleSignIn}>Sign in</button>
      } <br/>
      <button onClick={handleFBLogIn}>Sign In Using Facebook</button>
      {
        user.isSignedIn && 
        <div>
          <p>Welcoem, {user.name} </p>
          <p>Email: {user.email}</p>
        </div> 
      }

      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange={()=>setNewUser(!newUser)} name="nerUser" id="" />
      <label htmlFor="newUser">New User SignUp</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleChange} placeholder="Your name" />}<br />
        <input type="text" name="email" onBlur={handleChange} placeholder="Email address" required/><br />
        <input type="password" name="password" onBlur={handleChange} placeholder="Your Password" required /><br/>
        <input type="submit" value={newUser? 'Sign Up': 'Log In'}/>
      </form>
      <p style={{ color: 'red' }}> {user.error} </p>
      {user.success && <p style={{ color: 'green ' }}>User {newUser? 'created' : 'logged in'} successfully</p>}
    </div>
  );
}

export default App;
