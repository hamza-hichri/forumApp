const isEmpty = require("./is-empty");
const validator = require("validator");
module.exports = function validateExperienceInput(data) {
  let errors = {};
  var okey = true;

  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (validator.isEmpty(data.title)) {
    errors.title = "title field is required";
  }
  if (validator.isEmpty(data.company)) {
    errors.company = "company field is required";
  }
  if (validator.isEmpty(data.from)) {
    errors.from = "from date field is required";
  }
  return {
    errors,
    IsValid: isEmpty(errors), //okey, //false
  };
};
