const isEmpty = require("./is-empty");
const validator = require("validator");
module.exports = function validatePostsInput(data) {
  let errors = {};
  var okey = true;

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Post must be between 10 and 300 characters!";
  }
  if (validator.isEmpty(data.text)) {
    errors.text = "text field is required";
    okey = false;
  }

  return {
    errors,
    IsValid: isEmpty(errors), //okey, //false
  };
};
