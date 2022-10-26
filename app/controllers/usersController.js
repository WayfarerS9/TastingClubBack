const firebaseDB = require("../settings/firebaseDB");
const { ref, child, get } = require("firebase/database");

exports.getBySearch = (req, res) => {
  let searchingResults = [];
  let dbRef = ref(firebaseDB.database);

  get(child(dbRef, "users")).then(
    (result) => {
      result.forEach((user) => {
        if (
          user.val().firstName.toLowerCase().includes(req.query.term) ||
          user.val().lastName.toLowerCase().includes(req.query.term)
        ) {
          searchingResults.push(user.val());
        }
      });

      res.status(200).send(searchingResults);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};
