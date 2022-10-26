const firebaseDB = require("../settings/firebaseDB");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword  } = require("firebase/auth");
const { set, ref, child, get } = require("firebase/database");


exports.registrationOfNewUser = (req, res) => {
  let user = Object.assign({}, req.body)
  delete user.password;

  createUserWithEmailAndPassword(firebaseDB.auth, req.body.email, req.body.password).then(
    (userCredential) => {
      user.id = userCredential.user.uid;
      let token = userCredential.user.stsTokenManager.accessToken;
      let refresh = userCredential.user.stsTokenManager.refreshToken;
      let message = "You have successfully registered";

      set(ref(firebaseDB.database, 'users/' + user.id), user).then( () => {
        res.status(200).send({ message, user, token, refresh });        
      });

    },
    (error) => {
      let message = error.message;
      res.status(400).send({ message });
    }
  );
};


exports.signInUser = (req, res) => {

  signInWithEmailAndPassword(firebaseDB.auth, req.body.email, req.body.password)
    .then( (userCredential) => {
      let dbRef = ref(firebaseDB.database)
      get(child(dbRef, 'users/' + userCredential.user.uid)).then( snapshot => {
        let user = snapshot.val();        
        let token = userCredential.user.stsTokenManager.accessToken;
        let refresh = userCredential.user.stsTokenManager.refreshToken;
        let message = "You have successfully logged in";
        res.status(200).send({ message, user, token, refresh });
      })
    },
      (error) => {
        let message = error.code;
        res.status(401).send({ message });
    })
}
