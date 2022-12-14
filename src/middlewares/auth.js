const jwt = require("jsonwebtoken");
const { isValidId, isValid } = require("../validators/validation");
const mongoose = require("mongoose")
const userModel = require("../models/UserModel");

// authenication
const authenticate = async function (req, res,next) {
  try {
    let bearerToken = req.headers.authorization

    if (!bearerToken)
      return res
        .status(401)
        .send({ status: false, message: "Token is required" });
  

    let token = bearerToken.split(" ")[1];

    jwt.verify(token, "FunctionUp-Group-55-aorijhg@#", function (error, decodedToken) {
      if (error) {
        let message =
          error.message == "jwt expired"
            ? "token expired , login again!"
            : "Invalid token";
        return res.status(401).send({ status: false, message: message });
      }

      req.decodedToken = decodedToken;
      console.log("decoded", decodedToken)
      next();
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//authorisation
const authorise = async function (req, res,next) {
  try {
    let userId = req.params.userId;
    let allowedUser = req.decodedToken.id;
  
    if (!isValid(userId) ||!isValidId(userId))
      return res.status(400).send({ status: false, message: "Invalid UserId" });

    let user = await userModel.findOne({_id:userId, isDeleted: false});
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "You are not registered" });


    if (userId != allowedUser)
      return res
        .status(403)
        .send({ status: false, message: "Unauthorised access!" });

    next();
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authenticate, authorise };
