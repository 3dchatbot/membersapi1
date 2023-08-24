const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    publicid: String,
     profile: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile"
      }
      ],
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  })
);

module.exports = User;
