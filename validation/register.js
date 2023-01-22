const isEmpty = require("./is-empty");
const validator = require("validator");
module.exports = function validateRegisterInput(data) {
  let errors = {};
  var okey = true;

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!validator.isLength(data.name, { min: 3, max: 30 })) {
    errors.name = "Name must be between 3 and 30 characters!";
    okey = false;
  }
  if (validator.isEmpty(data.name)) {
    errors.name = "name field is required";
    okey = false;
  }

  if (validator.isEmpty(data.email)) {
    errors.email = "email field is required";
    okey = false;
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "email must be valid ";
    okey = false;
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "password field is required";
    okey = false;
  }
  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.passwordLength = "password must be at least 6 characters!";
    okey = false;
  }
  if (validator.isEmpty(data.password2)) {
    errors.passwordConfirm = "confirm password field is required";
    okey = false;
  }
  if (!validator.equals(data.password, data.password2)) {
    okey = false;
    errors.passwordMatch = "password doesn't match !";
  }
  return {
    errors,
    IsValid: isEmpty(errors), //okey, //false
  };
};
