exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send(/*{
    id:  req.userId,
   // username: user.username,
   // email: user.email,
   // roles: authorities
   // accessToken: token
  }*/ req.userId+"User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
