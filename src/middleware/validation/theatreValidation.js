import { body, validationResult } from "express-validator";

export const validateTheatre = [
  body("name")
    .trim()
    .escape()
    .isString()
    .withMessage("The name must be a string")
    .notEmpty()
    .withMessage("The name is required"),

  body("location")
    .isArray()
    .withMessage("Location must be an array")
    .custom((locations) => {
      locations.forEach((location) => {
        if (!location.address) {
          throw new Error("Location address is required");
        }
        if (
          !location.coordinates ||
          !location.coordinates.latitude ||
          !location.coordinates.longitude
        ) {
          throw new Error(
            "Location must include valid coordinates (latitude and longitude)"
          );
        }
      });
      return true;
    }),

  // Validate contact array - at least one contact with address, phone numbers, and emails
  body("contact")
    .isArray()
    .withMessage("Contact must be an array")
    .notEmpty()
    .withMessage("At least one contact is required")
    .custom((contacts) => {
      contacts.forEach((contact) => {
        if (!contact.address) {
          throw new Error("Contact address is required");
        }
        if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
          throw new Error("Contact must have at least one phone number");
        }
        contact.phoneNumbers.forEach((phone) => {
          if (!phone.type || !phone.number) {
            throw new Error("Phone number type and number are required");
          }
        });
        if (!contact.emails || contact.emails.length === 0) {
          throw new Error("Contact must have at least one email");
        }
        contact.emails.forEach((email) => {
          if (!email.type || !email.email) {
            throw new Error("Email type and email address are required");
          }
        });
      });
      return true;
    }),

  // Validate hallIds - an array of ObjectIds (optional)
  body("hallIds")
    .optional()
    .isArray()
    .withMessage("hallIds must be an array")
    .custom((hallIds) => {
      hallIds.forEach((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid hall ID");
        }
      });
      return true;
    }),

  // Validate commissionRate array - each should have an address and rate
  body("commissionRate")
    .isArray()
    .withMessage("commissionRate must be an array")
    .custom((rates) => {
      rates.forEach((rate) => {
        if (!rate.address) {
          throw new Error("Address is required for commission rate");
        }
        if (rate.rate === undefined || rate.rate < 0 || rate.rate > 100) {
          throw new Error("Rate must be between 0 and 100");
        }
      });
      return true;
    }),

  // Validate isActive - boolean value
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be a boolean")
    .optional(),

  // Collect validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
