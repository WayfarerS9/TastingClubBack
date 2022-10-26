const mongoDB = require("../settings/mongoDB");
const firebaseDB = require("../settings/firebaseDB");
const { ref, child, get } = require("firebase/database");

exports.getAllByUserId = (req, res) => {
  let userId = req.query.userId;

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let dbRef = ref(firebaseDB.database);
      let messagesCollection = db.collection("MessagesFor_" + userId);
      let messages = await messagesCollection.find().toArray();

      let setOfMailersId = new Set(messages.map((element) => element.mailerId));
      let arrayOfMailersId = [...setOfMailersId];
      let arrayOfMailers = [];

      await get(child(dbRef, "users")).then(
        (res) => {
          res.forEach((snapshot) => {
            let key = snapshot.key;
            if (arrayOfMailersId.includes(key)) {
              arrayOfMailers.push(snapshot.val());
            }
          });
        },
        (error) => {
          console.log(error);
          res.send(error);
        }
      );

      let queryResult = messages.map((element) => {
        element.mailer = arrayOfMailers.find(
          (el) => el.id === element.mailerId
        );
        delete element.mailerId;
        return element;
      });

      mongo.close();
      res.status(200).send(queryResult);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.changeReadingStatus = (req, res) => {
  let { userId, messageId } = req.body;
  let o_id = mongoDB.ObjectId(messageId);

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let messagesCollection = db.collection("MessagesFor_" + userId);

      await messagesCollection.updateOne(
        { _id: o_id },
        { $set: { isRead: true } }
      );
      mongo.close();
      res.status(200).send({ message: "Message is read" });
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.handleRequestForJoin = (req, res) => {
  let dbRef = ref(firebaseDB.database);
  get(child(dbRef, "users/" + req.body.userId)).then((snapshot) => {
    let user = snapshot.val();
    delete user.birthday;

    let groupId = req.body.groupId;
    let o_id = mongoDB.ObjectId(groupId);
    let proj = { participantsRequested: 1, creatorId: 1, name: 1 };

    mongoDB.mongoClient.connect().then(async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let group = await groupsCollection
        .find({ _id: o_id })
        .project(proj)
        .toArray();
      let participantsRequested = group[0].participantsRequested;

      if (participantsRequested.find((item) => item.id === req.body.userId)) {
        mongo.close();
        res.status(400).send({
          message: "Your request is still under consideration",
        });
      } else {
        participantsRequested.push(user);
        await groupsCollection
          .updateOne(
            { _id: o_id },
            { $set: { participantsRequested: participantsRequested } }
          )
          .then(
            async () => {
              let messageCollectionName = "MessagesFor_" + group[0].creatorId;
              let messageCollection = db.collection(messageCollectionName);
              await messageCollection
                .insertOne({
                  receiverId: group[0].creatorId,
                  mailerId: req.body.userId,
                  category: "joinGroup",
                  groupForJoinId: group[0]._id,
                  message: `${user.firstName} ${user.lastName} wants to join group "${group[0].name}". Are you agree?`,
                  isRead: false,
                  isProcessed: false,
                  messageDate: new Date(),
                })
                .then(
                  () => {
                    mongo.close();
                    res.status(200).send({
                      message: "Request to join the group is sent successfuly",
                    });
                  },
                  (error) => {
                    console.log(error);
                    res.send(error);
                  }
                );
            },
            (error) => {
              console.log(error);
              res.send(error);
            }
          );
      }
    });
  });
};

exports.handleRequestForInvitation = (req, res) => {
  let { receiverId, mailerId, groupForJoinId, mailerName, groupName } =
    req.body;

  let message = {
    receiverId,
    mailerId,
    category: "inviteToGroup",
    groupForJoinId,
    message: `${mailerName} invite you to join group ${groupName}. What do you think about it?`,
    isRead: false,
    isProcessed: false,
    messageDate: new Date(),
  };

  let group_id = mongoDB.ObjectId(groupForJoinId);
  let proj = { participantsDeclined: 1, participantsNotResponded: 1 };

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let messageCollection = db.collection("MessagesFor_" + receiverId);
      await messageCollection.insertOne(message);

      let group = await groupsCollection
        .find({ _id: group_id })
        .project(proj)
        .toArray();

      let indexOfDeletingElement =
        group[0].participantsDeclined.indexOf(receiverId);

      if (indexOfDeletingElement !== -1) {
        group[0].participantsDeclined.splice(indexOfDeletingElement, 1);
      }

      group[0].participantsNotResponded.push(receiverId);

      await groupsCollection.updateOne(
        { _id: group_id },
        {
          $set: {
            participantsDeclined: group[0].participantsDeclined,
            participantsNotResponded: group[0].participantsNotResponded,
          },
        }
      );

      mongo.close();
      res.status(200).send({
        message: "Invitation to join the group is sent successfuly",
      });
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};
