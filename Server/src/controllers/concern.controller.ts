import { Request, Response } from "express";
import { IConcernService } from "../interfaces/service/concern/IConcern.service";
import { StatusCode } from "../constants/statusCode";
import { AppError } from "../errors/AppError";

export class ConcernController {
  constructor(private _concernService: IConcernService) {}

  async raiseConcern(req: Request, res: Response): Promise<void> {
    const orderId = req.params.orderId as string;
    const { reason } = req.body;
    const customerId = (req as any).user.userId || (req as any).user.id;

    if (!req.file) {
      throw new AppError("Photo evidence is required to raise a concern", StatusCode.BAD_REQUEST);
    }

    if (!reason || !reason.trim()) {
      throw new AppError("Reason description is required", StatusCode.BAD_REQUEST);
    }

    const concern = await this._concernService.raiseConcern(
      {
        orderId,
        customerId,
        reason,
        imageBuffer: req.file.buffer,
        imageMimeType: req.file.mimetype,
      },
      req.file
    );

    res.status(StatusCode.CREATED).json({
      success: true,
      message: "Concern raised successfully",
      data: { concern },
    });
  }

  async getAllConcerns(req: Request, res: Response): Promise<void> {
    const { status } = req.query;
    const concerns = await this._concernService.getAllConcerns(status as string);

    res.status(StatusCode.OK).json({
      success: true,
      data: { concerns },
    });
  }

  async getConcernById(req: Request, res: Response): Promise<void> {
    const concernId = req.params.concernId as string;
    const concern = await this._concernService.getConcernById(concernId);

    if (!concern) {
      throw new AppError("Concern not found", StatusCode.NOT_FOUND);
    }

    res.status(StatusCode.OK).json({
      success: true,
      data: { concern },
    });
  }

  async approveConcern(req: Request, res: Response): Promise<void> {
    const concernId = req.params.concernId as string;
    const { adminNote } = req.body;

    const concern = await this._concernService.approveConcern(concernId, adminNote);

    res.status(StatusCode.OK).json({
      success: true,
      message: "Concern approved and order marked as resolved (100% refund issued)",
      data: { concern },
    });
  }

  async rejectConcern(req: Request, res: Response): Promise<void> {
    const concernId = req.params.concernId as string;
    const { adminNote } = req.body;

    const concern = await this._concernService.rejectConcern(concernId, adminNote);

    res.status(StatusCode.OK).json({
      success: true,
      message: "Concern rejected and order reverted to placed status",
      data: { concern },
    });
  }
}
