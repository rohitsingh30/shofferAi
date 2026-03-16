import Razorpay from 'razorpay';

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('Razorpay keys not configured (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)');
    }
    _razorpay = new Razorpay({ key_id, key_secret });
  }
  return _razorpay;
}

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
