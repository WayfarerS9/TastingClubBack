module.exports = (app) => {
  const regAuth = require('./auth/regAuth')
  const drinksController = require('./controllers/drinksController')
  const groupsController = require('./controllers/groupsController')
  const messagesController = require('./controllers/messagesController')
  const usersController = require('./controllers/usersController')


  app.route("/auth/registration").post(regAuth.registrationOfNewUser);
  app.route("/auth/signIn").post(regAuth.signInUser);
  
  app.route("/drinks/getBySearch").get(drinksController.getBySearch);
  app.route("/drinks/getById").get(drinksController.getById);
  app.route("/drinks/postReview").post(drinksController.postReview);
  app.route("/drinks/putReview").put(drinksController.putReview);
  app.route("/drinks/getAllByUserId").get(drinksController.getAllByUserId);
  app.route("/drinks/getTastedById").get(drinksController.getTastedById);
  app.route("/drinks/create").post(drinksController.create);
  
  app.route("/groups/getAll").get(groupsController.getAll);
  app.route("/groups/getById").get(groupsController.getById);
  app.route("/groups/getByUserIdAndGroupId").get(groupsController.getByUserIdAndGroupId);
  app.route("/groups/getAllByUserId").get(groupsController.getAllByUserId);
  app.route("/groups/create").post(groupsController.create);
  app.route("/groups/confirmOrRejectJoin").put(groupsController.confirmOrRejectJoin);
  
  app.route("/messages/getAllByUserId").get(messagesController.getAllByUserId);
  app.route("/messages/changeReadingStatus").put(messagesController.changeReadingStatus);
  app.route("/messages/handleRequestForJoin").post(messagesController.handleRequestForJoin);
  app.route("/messages/handleRequestForInvitation").post(messagesController.handleRequestForInvitation);


  
  app.route("/users/getBySearch").get(usersController.getBySearch);


/*   
  const user = require("./../settings/firebaseDb");
  const farm = require("./../Controllers/farmController");
  const coops = require("./../Controllers/coopsController");
  const sensors = require("./../Controllers/sensorsController");
  const sensorsValidation = require('./../Controllers/sensorsValidatonController')
  const influx = require('../Controllers/influxController')

  app.route("/api/auth/signup").post(user.signUp);
  app.route("/api/auth/signin").post(user.signIn);

  app.route("/api/farms").get(farm.getFarms);
  app.route("/api/create-farms").post(farm.createFarms);
  app.route("/api/update-farms/:id").put(farm.updateFarms);
  app.route("/api/delete-farms/:id").delete(farm.deleteFarms);

  app.route("/api/coops/:id").get(coops.getCoops);
  app.route("/api/create-coops").post(coops.createCoops);
  app.route("/api/update-coops/:id").put(coops.updateCoops);
  app.route("/api/delete-coops/:id").delete(coops.deleteCoops);

  app.route("/api/sensors/:id").get(sensors.getSensors);
  app.route('/api/sensors-is-valid').get(sensorsValidation.getValidDeviceId)
  app.route("/api/create-deviceId").put(sensors.createDeviceId);

  app.route("/api/postData-to-influxDb").post(influx.getDataFromMySql); 
*/
};