import { Router, Request, Response, NextFunction } from "express";
import { concernController, authMiddleware } from "../config/dependencies";
import { upload } from "../middlewares/upload.middleware";

const router = Router();



// Customer raises concern for an order
router.post(
  "/orders/:orderId/concern",
  authMiddleware.authenticate,
  authMiddleware.authorize("user"),
  upload.single("photo"),
  concernController.raiseConcern
);

// Admin list all concerns
router.get(
  "/admin/concerns",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.getAllConcerns
);

// Admin get concern details by ID
router.get(
  "/admin/concerns/:concernId",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.getConcernById
);

// Admin approve concern
router.post(
  "/admin/concerns/:concernId/approve",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.approveConcern
);

// Admin reject concern
router.post(
  "/admin/concerns/:concernId/reject",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  concernController.rejectConcern
);

export default router;
