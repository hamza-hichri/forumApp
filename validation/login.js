const isEmpty = require("./is-empty");
const validator = require("validator");
module.exports = function validateLoginInput(data) {
  let errors = {};
  var okey = true;

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!validator.isEmail(data.email)) {
    errors.email = "email must be valid ";
    okey = false;
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "password field is required";
    okey = false;
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "email field is required";
    okey = false;
  }

  return {
    errors,
    IsValid: isEmpty(errors), //okey, //false
  };
};
