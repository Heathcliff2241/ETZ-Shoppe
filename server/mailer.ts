import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendOtp(toEmail: string, code: string): Promise<void> {
  if (!isMailConfigured()) return;

  await transporter.sendMail({
    from: `"ETZ A Shoppe" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Your Admin Login Code: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafaf8; border: 1px solid #e5e3de; border-radius: 12px;">
        <h2 style="margin: 0 0 8px; font-size: 22px; color: #1c1c1a;">ETZ A Shoppe</h2>
        <p style="color: #6b6b65; font-size: 14px; margin: 0 0 24px;">Admin Login Verification</p>
        <p style="color: #1c1c1a; font-size: 15px; margin: 0 0 16px;">Your one-time login code is:</p>
        <div style="background: #1c1c1a; color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 8px; margin: 0 0 20px;">
          ${code}
        </div>
        <p style="color: #6b6b65; font-size: 13px; margin: 0;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  });
}

export async function sendOrderNotification(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  subtotal: number;
  items: Array<{ productName?: string; productId?: string }>;
}): Promise<void> {
  if (!isMailConfigured()) return;

  const itemSummary = order.items
    .map((item) => item.productName || item.productId || 'Item')
    .join(', ');
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const subject = `New order ${order.id} — ${order.status}`;
  const adminHtml = `
    <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #fafaf8; border: 1px solid #e5e3de; border-radius: 12px;">
      <h2 style="margin: 0 0 8px; font-size: 22px; color: #1c1c1a;">ETZ A Shoppe</h2>
      <p style="margin: 0 0 16px; color: #6b6b65;">A new order has been placed and its status is now <strong>${order.status}</strong>.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      <p><strong>Items:</strong> ${itemSummary || 'No items listed'}</p>
      <p><strong>Subtotal:</strong> ₱${Number(order.subtotal).toLocaleString()}</p>
    </div>
  `;
  const customerHtml = `
    <div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background: #fafaf8; border: 1px solid #e5e3de; border-radius: 12px;">
      <h2 style="margin: 0 0 8px; font-size: 22px; color: #1c1c1a;">ETZ A Shoppe</h2>
      <p style="margin: 0 0 16px; color: #6b6b65;">Thank you for your order. Your order status is currently <strong>${order.status}</strong>.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Items:</strong> ${itemSummary || 'No items listed'}</p>
      <p><strong>Subtotal:</strong> ₱${Number(order.subtotal).toLocaleString()}</p>
    </div>
  `;

  await transporter.sendMail({ from: `"ETZ A Shoppe" <${process.env.SMTP_USER}>`, to: adminEmail, subject, html: adminHtml });
  await transporter.sendMail({ from: `"ETZ A Shoppe" <${process.env.SMTP_USER}>`, to: order.customerEmail, subject: `Your ETZ A Shoppe order ${order.id} is ${order.status}`, html: customerHtml });
}
