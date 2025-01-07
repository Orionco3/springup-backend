const { ObjectId } = require("mongoose").Types;

exports.validateUserName = (name) => {
  const re = /^[a-zA-Z\s]*$/;
  return re.test(name);
};

exports.validateEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(String(email).toLowerCase());
};

exports.isValidObjectId = (id) => {
  if (ObjectId.isValid(id)) {
    return String(new ObjectId(id)) === id;
  }

  return false;
};

exports.validateNotificationData = (data) => {
  const { title, description, departments } = data;
  const errors = {};

  if (!title || title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (title.length > 50) {
    errors.title = "Title cannot be more than 50 characters.";
  }

  if (!description || description.trim().length === 0) {
    errors.description = "Description is required";
  } else if (description.length > 140) {
    errors.description = "Description cannot be more than 140 characters.";
  }

  if (!departments || departments.length === 0) {
    errors.departments = "At least one department is required to notify";
  } else {
    departments.some((department) => {
      const isInvalidObjectId = !this.isValidObjectId(department);

      if (isInvalidObjectId) {
        errors.departments = "Invalid department id is passed.";
      }

      return isInvalidObjectId;
    });
  }

  return errors;
};

exports.validateSubscriptionPlanFields = (req, isFreePlan = false) => {
  const {
    title,
    description,
    prices,
    trialDays = 7,
    departments = 4,
    apps = 3,
    rewards = 0,
    maxUsers = 5,
    freeUsers = 5,
    goalsPerUser = 5,
  } = req.body;
  const errors = {};

  if (title === undefined || title === "") {
    errors.title = "A valid product title is required for the new plan";
  }

  if (description === undefined || description === "") {
    errors.description =
      "A valid product description is required for the new plan";
  }

  if (trialDays === undefined || trialDays === "") {
    errors.trialDays = "Trial days is required";
  } else if (typeof trialDays !== "number") {
    errors.trialDays = "Trial days must be a number";
  } else if (trialDays > 30) {
    errors.trialDays = "Trial days cannot be more than 30 days";
  } else if (trialDays % 1 !== 0) {
    errors.trialDays = "Trial days must be an integer";
  }

  if (departments === undefined || departments === "") {
    errors.departments = "No. of departments is required";
  } else if (typeof departments !== "number") {
    errors.departments = "No. of departments must be a number";
  } else if (departments !== -1 && departments < 4) {
    errors.departments = "No. of departments must be greater than 3";
  } else if (departments % 1 !== 0) {
    errors.departments = "No. of departments must be an integer";
  }

  if (apps === undefined || apps === "") {
    errors.apps = "No. of apps is required";
  } else if (typeof apps !== "number") {
    errors.apps = "No. of apps must be a number";
  } else if (apps !== -1 && apps < 3) {
    errors.apps = "No. of apps must be greater than 2";
  } else if (apps % 1 !== 0) {
    errors.apps = "No. of apps must be an integer";
  }

  if (rewards === undefined || rewards === "") {
    errors.rewards = "No. of rewards is required";
  } else if (typeof rewards !== "number") {
    errors.rewards = "No. of rewards must be a number";
  } else if (rewards !== -1 && rewards < 0) {
    errors.rewards = "No. of rewards must be a positive integer";
  } else if (rewards % 1 !== 0) {
    errors.rewards = "No. of rewards must be an integer";
  }

  if (maxUsers === undefined || maxUsers === "") {
    errors.maxUsers = "No. of users is required";
  } else if (typeof maxUsers !== "number") {
    errors.maxUsers = "No. of users must be a number";
  } else if (maxUsers !== -1 && maxUsers < 5) {
    errors.maxUsers = "No. of users must be greater than 4";
  } else if (maxUsers % 1 !== 0) {
    errors.maxUsers = "No. of users must be an integer";
  }

  if (freeUsers === undefined || freeUsers === "") {
    errors.freeUsers = "No. of free users is required";
  } else if (typeof freeUsers !== "number") {
    errors.freeUsers = "No. of free users must be a number";
  } else if (freeUsers !== -1 && freeUsers < 5) {
    errors.freeUsers = "No. of free users must be greater than 4";
  } else if (freeUsers % 1 !== 0) {
    errors.freeUsers = "No. of free users must be an integer";
  }

  if (goalsPerUser === undefined || goalsPerUser === "") {
    errors.goalsPerUser = "No. of goals per user is required";
  } else if (typeof goalsPerUser !== "number") {
    errors.goalsPerUser = "No. of goals per user must be a number";
  } else if (goalsPerUser !== -1 && goalsPerUser < 5) {
    errors.goalsPerUser = "No. of goals per user must be greater than 4";
  } else if (goalsPerUser % 1 !== 0) {
    errors.goalsPerUser = "No. of goals per user must be an integer";
  }

  return errors;
};
