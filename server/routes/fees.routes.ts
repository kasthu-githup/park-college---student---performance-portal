import { Router, Response } from 'express';
import { repo } from '../repository';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/fees - List fee records
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { studentRegNo, status } = req.query;

  let list = [...repo.fees];

  if (req.user && req.user.role === 'student') {
    list = list.filter((f) => f.studentRegNo.toUpperCase() === req.user!.id.toUpperCase());
  } else if (studentRegNo) {
    list = list.filter((f) => f.studentRegNo.toUpperCase() === String(studentRegNo).toUpperCase());
  }

  if (status && status !== 'all') {
    list = list.filter((f) => f.status.toLowerCase() === String(status).toLowerCase());
  }

  res.json({ success: true, data: list, total: list.length });
});

// POST /api/fees/:id/pay - Record tuition/development fee installment
router.post('/:id/pay', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  const paymentNum = Number(amount);
  if (isNaN(paymentNum) || paymentNum <= 0) {
    return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
  }

  const fee = repo.fees.find((f) => f.id === id);
  if (!fee) {
    return res.status(404).json({ success: false, message: 'Fee record not found' });
  }

  const newPaid = fee.paidAmount + paymentNum;
  const newDue = Math.max(0, fee.totalFee - newPaid);
  const status = newDue === 0 ? 'Paid' : 'Partial';

  fee.paidAmount = newPaid;
  fee.dueAmount = newDue;
  fee.status = status;
  fee.noDueApproved = newDue === 0;
  fee.lastPaymentDate = new Date().toISOString().split('T')[0];
  fee.receiptNumber = `AIT/26-27/REC-${Math.floor(10000 + Math.random() * 90000)}`;

  await repo.saveFee(fee);

  repo.logAudit(
    'FEE_PAYMENT_RECORDED',
    req.user!.email,
    req.user!.role,
    `Recorded payment of ₹${paymentNum.toLocaleString()} for student ${fee.studentRegNo}. Balance Due: ₹${newDue.toLocaleString()}`,
    req.ip
  );

  res.json({
    success: true,
    message: `Payment of ₹${paymentNum.toLocaleString()} recorded successfully. Receipt: ${fee.receiptNumber}`,
    data: fee,
  });
});

// POST /api/fees - Create or upsert fee record
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const newFee = req.body;
  if (!newFee || !newFee.studentRegNo) {
    return res.status(400).json({ success: false, message: 'studentRegNo is required' });
  }
  const existingIdx = repo.fees.findIndex((f) => f.id === newFee.id);
  if (existingIdx >= 0) {
    repo.fees[existingIdx] = { ...repo.fees[existingIdx], ...newFee };
    await repo.saveFee(repo.fees[existingIdx]);
  } else {
    repo.fees.unshift(newFee);
    await repo.saveFee(newFee);
  }
  res.json({ success: true, data: newFee });
});

// DELETE /api/fees/:id - Remove fee record
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await repo.deleteFee(id);
  res.json({ success: true, message: 'Fee record deleted' });
});

export default router;
