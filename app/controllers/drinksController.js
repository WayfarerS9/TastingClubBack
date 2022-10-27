const mongoDB = require("../settings/mongoDB");

exports.getBySearch = (req, res) => {
  console.log(req.query)
  let results = [];
  let proj = { brand: 1, typeOfDrink: 1, name: 1 };

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let drinksCollection = db.collection("Drinks");
      let cursorDrinks = drinksCollection.find().project(proj);

      await cursorDrinks.forEach((element) => {
        if (element.name.toLowerCase().includes(req.query.crt.toLowerCase())) {
          results.push(element);
        }
      });

      mongo.close();
      res.status(200).send(results);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.getById = (req, res) => {
  let drinkId = req.query.drinkId;
  let userId = req.query.userId;
  let o_id = mongoDB.ObjectId(drinkId);

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let drinksCollection = db.collection("Drinks");
      let userReviewCollection = db.collection("Review_" + userId);
      let receivedDrink = await drinksCollection.find({ _id: o_id }).toArray();
      let isTasted = await userReviewCollection
        .find({ _id: receivedDrink[0]._id.toString() })
        .toArray();
      receivedDrink[0].isTasted = isTasted.length > 0 ? true : false;

      mongo.close();
      res.status(200).send(receivedDrink[0]);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.postReview = (req, res) => {
  if (!req.body.tastingDate || !req.body.tastingRate || !req.body.tastingReview) {
    res
      .status(400)
      .send({ message: "All form fields must be completed" });
  } else {
    let collectionName = "Review_" + req.body.userId;
    mongoDB.mongoClient.connect().then(
      async function (mongo) {
        let db = mongo.db("TastingClub");
        let reviewCollection = db.collection(collectionName);
        await reviewCollection.insertOne(req.body);

        mongo.close();
        res
          .status(200)
          .send({ message: "Your review has been added successfully" });
      },
      (error) => {
        console.log(error);
        res.send(error);
      }
    );
  }
};

exports.getAllByUserId = (req, res) => {
  let id = req.query.id;
  let targetCollection = "Review_" + id;

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let tastedDrinksCollection = db.collection(targetCollection);
      let receivedTastedDrinks = await tastedDrinksCollection
        .find()
        .project({ brand: 1, typeOfDrink: 1, name: 1 })
        .toArray();

      mongo.close();
      res.status(200).send(receivedTastedDrinks);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.getTastedById = (req, res) => {
  let userId = req.query.userId;
  let drinkId = req.query.drinkId;
  let targetCollection = "Review_" + userId;

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let tastedDrinksCollection = db.collection(targetCollection);
      let receivedTastedDrink = await tastedDrinksCollection
        .find({ _id: drinkId })
        .toArray();

      mongo.close();
      res.status(200).send(receivedTastedDrink[0]);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.putReview = (req, res) => {
  let collectionName = "Review_" + req.body.userId;

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let reviewCollection = db.collection(collectionName);
      await reviewCollection.replaceOne({ _id: req.body._id }, req.body, {
        upsert: false,
      });

      mongo.close();
      res
        .status(200)
        .send({ message: "Your review has been update successfully" });
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.create = (req, res) => {
  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let drinksCollection = db.collection("Drinks");
      let result = await drinksCollection.insertOne(req.body);

      mongo.close();
      res.status(200).send({ message: "Drink has been created successfuly" });
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};
