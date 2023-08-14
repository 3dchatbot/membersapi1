const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};

exports.signingoogle = (req, res) => {
	if (req.user) {

		User.findOne({
			email: req.user.emails[0].value
		  })
			.populate("roles", "-__v")
			.exec((err, user) => {
				if (err) {
				  res.status(500).send({ message: err });
				  return;
				}
		  
				if (!user) {
				  return res.status(404).send({ message: "User Not found." });
				}else{
					var authorities = [];
					for (let i = 0; i < user.roles.length; i++) {
						authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
					  }
					var token = jwt.sign({ id: user.id }, config.secret, {
						expiresIn: 86400 // 24 hours
					  });

					  
					
				const body = { _id: user._id};
				/*const token = jwt.sign({ user: body }, config.secret, {
					expiresIn: 86400 // 24 hours
				  });
				*/res.status(200).send({
						id: user._id,
						username: user.username,
						email: user.email,
					    roles: authorities,
					    accessToken: token,
            logintype: "google",
					  error: false,
					  message: "Your a G",
					  user: req.user
					  });

				}
				/*var token = jwt.sign({ id: user.id }, config.secret, {
					expiresIn: 86400 // 24 hours
				  });
				var passwordIsValid = bcrypt.compareSync(
				  req.body.password,
				  user.password
				);
		  
				if (!passwordIsValid) {
				  return res.status(401).send({
					accessToken: null,
					message: "Invalid Password!"
				  });
				}
		  
				
		  
				var authorities = [];
		  
				for (let i = 0; i < user.roles.length; i++) {
				  authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
				}*/
				
			  });
	/*	res.status(200).json({
			error: false,
			message: "Successfully Loged In",
			user: req.user.emails[0].value,
		});*/
	} else {
		res.status(403).json({ error: true, message: "Not Authorized" });
	}
};

