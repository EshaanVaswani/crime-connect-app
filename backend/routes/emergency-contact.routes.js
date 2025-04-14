import express from "express";
import {
   addContact,
   getContacts,
   updateContact,
   deleteContact,
} from "../controllers/emergency-contact.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();

router.route("/").post(protect, addContact).get(protect, getContacts);

router.route("/:id").put(protect, updateContact).delete(protect, deleteContact);

export default router;