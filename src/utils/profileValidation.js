import { check } from "express-validator";

export const editProfileValidator = [
  check("firstName").notEmpty().withMessage("First name is required").isString().withMessage("First name must be a string"),
  check("lastName").notEmpty().withMessage("Last name is required").isString().withMessage("Last name must be a string"),
  check("contact").notEmpty().withMessage("Contact is required").matches(/^\d{10}$/).withMessage("Contact must be exactly 10 digits"),
  check("bio").notEmpty().withMessage("Bio is required").isString().withMessage("Bio must be a string"),
  check("age").notEmpty().withMessage("Age is required").isNumeric().withMessage("Age must be a number"),
];
