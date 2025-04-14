import EmergencyContact from "../models/emergency-contact.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/async.js";
import ErrorResponse from "../utils/error-response.js";

// @desc    Add emergency contact
// @route   POST /api/v1/emergency-contacts
export const addContact = asyncHandler(async (req, res, next) => {
   const contact = await EmergencyContact.create({
      ...req.body,
      user: req.user.id,
   });

   // Add to user's emergency contacts
   await User.findByIdAndUpdate(req.user.id, {
      $push: { emergencyContacts: contact._id },
   });

   res.status(201).json({
      success: true,
      data: contact,
   });
});

// @desc    Get user's emergency contacts
// @route   GET /api/v1/emergency-contacts
export const getContacts = asyncHandler(async (req, res, next) => {
   const contacts = await EmergencyContact.find({ user: req.user.id });

   res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
   });
});

// @desc    Update emergency contact
// @route   PUT /api/v1/emergency-contacts/:id
export const updateContact = asyncHandler(async (req, res, next) => {
   let contact = await EmergencyContact.findById(req.params.id);

   if (!contact || contact.user.toString() !== req.user.id) {
      return next(new ErrorResponse("Contact not found", 404));
   }

   contact = await EmergencyContact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });

   res.status(200).json({
      success: true,
      data: contact,
   });
});

// @desc    Delete emergency contact
// @route   DELETE /api/v1/emergency-contacts/:id
export const deleteContact = asyncHandler(async (req, res, next) => {
   const contact = await EmergencyContact.findById(req.params.id);

   if (!contact || contact.user.toString() !== req.user.id) {
      return next(new ErrorResponse("Contact not found", 404));
   }

   await contact.remove();

   // Remove from user's emergency contacts
   await User.findByIdAndUpdate(req.user.id, {
      $pull: { emergencyContacts: contact._id },
   });

   res.status(200).json({
      success: true,
      data: {},
   });
});
