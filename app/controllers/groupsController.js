const mongoDB = require("../settings/mongoDB");
const firebaseDB = require("../settings/firebaseDB");
const { ref, child, get } = require("firebase/database");

exports.getAll = (req, res) => {
  let proj = { _id: 1, name: 1, description: 1 };
  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let groups = await groupsCollection
        .find({ isPublic: true })
        .project(proj)
        .toArray();

      mongo.close();
      res.status(200).send(groups);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.getByUserIdAndGroupId = (req, res) => {
  let groupId = req.query.groupId;
  let userId = req.query.userId;
  let o_id = mongoDB.ObjectId(groupId);
  let proj = {
    _id: 1,
    name: 1,
    description: 1,
    creatorId: 1,
    participantsApproved: 1,
    participantsRequested: 1,
  };

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let isUserCandidate = false;
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let group = (
        await groupsCollection.find({ _id: o_id }).project(proj).toArray()
      )[0];
      mongo.close();

      let participantsRequested = group.participantsRequested;
      isUserCandidate = participantsRequested.find((item) => item.id === userId)
        ? true
        : false;

      group.isUserCandidate = isUserCandidate;
      delete group.participantsRequested;

      group.participantsApproved = await getUsersArrayByTheirIdArray(
        group.participantsApproved
      );
      res.status(200).send(group);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

async function getUsersArrayByTheirIdArray(arrayOfId) {
  let participantsApprovedFull = [];
  let dbRef = ref(firebaseDB.database);

  await get(child(dbRef, "users")).then((res) => {
    res.forEach((snapshot) => {
      let key = snapshot.key;
      if (arrayOfId.includes(key)) {
        participantsApprovedFull.push(snapshot.val());
      }
    });
  });

  return participantsApprovedFull;
}

exports.getById = (req, res) => {
  let groupId = req.query.groupId;
  let o_id = mongoDB.ObjectId(groupId);
  let proj = {
    _id: 1,
    name: 1,
    description: 1,
    participantsApproved: 1,
    participantsRequested: 1,
    participantsNotResponded: 1,
    participantsDeclined: 1,
    creatorId: 1
  };

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let group = (
        await groupsCollection.find({ _id: o_id }).project(proj).toArray()
      )[0];
      mongo.close();

      group.participantsApproved = await getUsersArrayByTheirIdArray(
        group.participantsApproved
      );
      res.status(200).send(group);
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};



exports.getAllByUserId = (req, res) => {
  let userId = req.query.userId;
  let proj = { participantsApproved: 1, description: 1, name: 1 };
  let results = [];

  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let cursorGroups = groupsCollection.find().project(proj);

      await cursorGroups.forEach((element) => {
        if (element.participantsApproved.includes(userId)) {
          delete element.participantsApproved;
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

exports.create = (req, res) => {
  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      await groupsCollection.insertOne(req.body);
      mongo.close();
      res.status(200).send({ message: "Group has been created successfuly" });
    },
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
};

exports.confirmOrRejectJoin = (req, res) => {
  let group_id = mongoDB.ObjectId(req.body.groupForJoinId);
  let message_id = mongoDB.ObjectId(req.body.messageId);
  mongoDB.mongoClient.connect().then(
    async function (mongo) {
      let db = mongo.db("TastingClub");
      let groupsCollection = db.collection("Groups");
      let messagesCollection;
      let group = await groupsCollection.find({_id: group_id}).toArray();
      let { participantsRequested, participantsApproved, participantsDeclined, participantsNotResponded, category } = group[0];
      let candidateDeclinedIndex = participantsDeclined.findIndex( element => element === req.body.candidateId);

      if(candidateDeclinedIndex !== -1) {
        participantsDeclined.splice(candidateDeclinedIndex, 1)
      }

switch (req.body.category) {
  case 'joinGroup':
    messagesCollection = db.collection("MessagesFor_" + req.body.receiverId);
    let candidateIndex = participantsRequested.findIndex( user => user.id === req.body.candidateId);

    if(candidateIndex === -1) {
      mongo.close();
      res.status(400).send({ message: "Candidate wasn't found" });
    } else {
      let removedUserFromParticipantRequested = participantsRequested.splice(candidateIndex, 1);

      if(req.body.isConfirm) {
        participantsApproved.push(removedUserFromParticipantRequested[0].id)
      } else {
        participantsDeclined.push(removedUserFromParticipantRequested[0].id)
      }      
    }
    break;

  case 'inviteToGroup':
    messagesCollection = db.collection("MessagesFor_" + req.body.candidateId);
    let invitedCandidateIndex = participantsNotResponded.findIndex( user => user === req.body.candidateId);

    if(invitedCandidateIndex === -1) {
      mongo.close();
      res.status(400).send({ message: "Candidate wasn't found" });
    } else {
      let removedUserFromParticipantNotResponded = participantsNotResponded.splice(invitedCandidateIndex, 1);

      if(req.body.isConfirm) {
        participantsApproved.push(removedUserFromParticipantNotResponded[0])
      } else {
        participantsDeclined.push(removedUserFromParticipantNotResponded[0])
      }      
    }
    break;
}

      await groupsCollection.updateOne({_id: group_id}, {$set: { participantsRequested, participantsApproved, participantsDeclined, participantsNotResponded }});
      await messagesCollection.updateOne({_id: message_id}, {$set: { isProcessed: true }});
      mongo.close();
      res.status(200).send({ message: "The decision has been made" });

    }, 
    (error) => {
      console.log(error);
      res.send(error);
    }
  )
}
