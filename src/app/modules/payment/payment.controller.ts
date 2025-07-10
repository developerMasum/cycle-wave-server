import { Request, Response } from "express";
import { paymentService } from "./payment.service";
import { verifyPayment } from "./payment.utils";

const confirmationController = async (req: Request, res: Response) => {
  const { transactionId, status } = req.query;
  const verifyResponse = await verifyPayment(
    transactionId as string,
    status as string
  );
  console.log(verifyResponse);
  const result = await paymentService.confirmationService(
    req.query.transactionId as string,
    req.query.status as string
  );
  res.send(result);
};
export const paymentController = {
  confirmationController,
};
