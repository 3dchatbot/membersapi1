const router = require("express").Router();
const passport = require("passport");
const config = require("../app/config/auth.config");
const db = require("../app/models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");



const express = require('express');
const MetaAuth = require('meta-auth');

//const app = express();
const metaAuth = new MetaAuth({banner: "Example Site Banner",
});

router.use('/', express.static('.'));


router.get("/login/success", (req, res) => {
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
				/*	var token = jwt.sign({ id: user.id }, config.secret, {
						expiresIn: 86400 // 24 hours
					  });

					  
				*/	
				const body = { _id: user._id};
				const token = jwt.sign({ user: body }, config.secret, {
					expiresIn: 86400 // 24 hours
				  });
				res.status(200).send({
						id: user._id,
						username: user.username,
						email: user.email,
					    roles: authorities,
					    accessToken: token,
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
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});


router.get('/web3/:MetaAddress', metaAuth, (req, res) => {
	// Request a message from the server
	if (req.metaAuth && req.metaAuth.challenge) {
	  res.send(req.metaAuth.challenge)
	}
  });
  
  router.get('/web3/:MetaMessage/:MetaSignature', metaAuth, (req, res) => {
	if (req.metaAuth && req.metaAuth.recovered) {
	  // Signature matches the cache address/challenge
	  // Authentication is valid, assign JWT, etc.
	  res.send(req.metaAuth.recovered);
	} else {
	  // Sig did not match, invalid authentication
	  res.status(400).send();
	};
  });


router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: "/login/failed",
	})
);

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});

module.exports = router;