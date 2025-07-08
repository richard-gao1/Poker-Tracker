import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

///////////
// USERS //
///////////

// Add a new user to the collection
router.post("/users/", async (req, res) => {
  let collection = await db.collection("users");
  let newDocument = req.body;
  newDocument.createdDate = new Date();
  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

// Delete a user
// might later want a batch delete but for now we will skip that
router.delete("/users/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };

  const collection = db.collection("users");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

// Update the user's information
// json format {fieldToBeUpdated: updatedValue}
router.patch("/users/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $set: req.body
  };

  let collection = await db.collection("users");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});

// Get a list of users
router.get("/users/", async (req, res) => {
  // build query
  const {startDate, endDate, startName, endName, limit = 50} = req.query;
  const query = {};

  if (startDate || endDate) {
    query.createdDate = {}
    if (startDate && Date.parse(startDate)) query.createdDate.$gte = new Date(startDate);
    if (endDate && Date.parse(endDate)) query.createdDate.$lte = new Date(endDate);
  }

  if (startName || endName) {
    query.name = {}
    if (startName) query.name.$gte = startName;
    if (endName) query.name.$lte = endName;
  }

  let collection = await db.collection("users");
  let results = await collection.find(query)
    // .sort({createdDate: -1}) // newest first
    // .limit(limit)
    .toArray();

  res.send(results).status(200);
});

// Get a single user
router.get("/users/:id", async (req, res) => {
  let collection = await db.collection("users");
  let query = {_id: ObjectId(req.params.id)};
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

//////////////
// SESSIONS //
//////////////

// Post a single session
router.post("/users/:id/sessions/", async (req, res) => {
  let collection = await db.collection("sessions");
  let newDocument = req.body
  newDocument.createdDate = new Date();
  newDocument.date = new Date(newDocument.date);
  newDocument.userId = ObjectId(req.params.id);
  let result = await collection.insertOne(req.body);
  res.send(result).status(204);
});

// Get a single session
router.get("/users/:id/sessions/:sessionId", async (req, res) => {
  let collection = await db.collection("sessions");
  let query = {
    _id: ObjectId(req.params.sessionId),
    userId: ObjectId(req.params.id)
   };
  let result = await collection.findOne(query);
  
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200)
});

// Get all sessions for a given user
router.get("/users/:id/sessions/", async (req, res) => {
  // build query
  const {startDate, endDate, startName, endName, location, cash, limit = 50} = req.query;
  const query = {
    userId: ObjectId(req.params.id)
   };

  if (startDate || endDate) {
    query.date = {}
    if (startDate && Date.parse(startDate)) query.date.$gte = new Date(startDate);
    if (endDate && Date.parse(endDate)) query.date.$lte = new Date(endDate);
  }

  if (startName || endName) {
    query.sessionName = {}
    if (startName) query.sessionName.$gte = startName;
    if (endName) query.sessionName.$lte = endName;
  }

  if (location) {
    query.location = {}
    query.location.$in = location.split(",");
  }

  if (cash) query.cash = cash === "true";

  let collection = await db.collection("sessions");
  
  let result = await collection.find(query)
    .toArray();
  
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200)
});

// Delete a single session
router.delete("/users/:id/sessions/:sessionId", async (req, res) => {
  let collection = await db.collection("sessions");
  let query = {
    _id: ObjectId(req.params.sessionId),
    userId: ObjectId(req.params.id)
   };
  let result = await collection.deleteOne(query);
  
  res.send(result).status(200)
});

// Patch a single session
// json format {fieldToBeUpdated: updatedValue}
router.patch("/users/:id/sessions/:sessionId", async (req, res) => {
  const query = { _id: ObjectId(req.params.sessionId), userId: ObjectId(req.params.id) };
  let updatedFields = req.body
  if (updatedFields.date) updatedFields.date = new Date(updatedFields.date)
  const updates = {
    $set: updatedFields
  };

  let collection = await db.collection("sessions");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});


export default router;
