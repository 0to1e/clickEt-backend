import { body } from "express-validator";

export const validationRules = [
  body("name")
    .isString()
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 to 100 characters")
    .notEmpty()
    .withMessage("Movie name is required."),
  body("category")
    .isString()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Movie's category is required."),
  body("description")
    .isString()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Movie's description is required."),
  body("releaseDate")
    .isDate()
    .withMessage("Invalid data type. Date required")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Movie's release date is required."),
  body("duration_min")
    .isInt()
    .withMessage("Invalid data type. Integer required")
    .notEmpty()
    .withMessage("Movie's duration is required."),
  body("language")
    .isString()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Movie's language is required."),
  body("posterURL.sm")
    .isURL()
    .withMessage("Invalid URL format for small poster.")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Small poster URL is required."),
  body("posterURL.lg")
    .isURL()
    .withMessage("Invalid URL format for large poster.")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Large poster URL is required."),
  body("trailerURL")
    .isURL()
    .withMessage("Invalid URL format")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Movie's trailer URL is required."),
  body("status")
    .isIn(["showing", "upcoming"])
    .withMessage("Movie's status must be either 'showing' or 'coming'.")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Movie's status is required."),
];
