const mongoose = require('mongoose');

const uri = "mongodb+srv://oncampusmart:OnCampusMart%40543@oncampusmart.zju4fst.mongodb.net/campus-marketplace?retryWrites=true&w=majority&appName=OnCampusMart";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully to MongoDB Atlas");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
