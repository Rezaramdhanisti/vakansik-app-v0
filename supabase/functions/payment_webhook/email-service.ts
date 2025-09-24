// @ts-nocheck
import { Resend } from "https://esm.sh/resend@3.2.0";

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_KEY"));

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export interface PaymentSuccessEmailData {
  userEmail: string;
  userName: string;
  orderId: string;
  tripName: string;
  tripDate: string;
  amount: number;
  meetingPoint: string;
}

export interface AdminNotificationEmailData {
  orderId: string;
  userName: string;
  userEmail: string;
  tripName: string;
  tripDate: string;
  amount: number;
  meetingPoint: string;
  joinedUsers: any[];
}

/**
 * Send payment success email notification
 */
export async function sendPaymentSuccessEmail(data: PaymentSuccessEmailData): Promise<boolean> {
  try {
    const { userEmail, userName, orderId, tripName, tripDate, amount, meetingPoint } = data;
    
    // Format the amount in Indonesian Rupiah
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

    // Format the trip date
    const formattedDate = new Date(tripDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailTemplate: EmailTemplate = {
      to: userEmail,
      subject: `🎉 Pembayaran Berhasil - ${tripName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pembayaran Berhasil</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
              width: 100% !important;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            @media only screen and (max-width: 600px) {
              .container {
                padding: 15px;
                margin: 10px;
                border-radius: 8px;
              }
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #f97316;
              margin-bottom: 10px;
            }
            .success-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px auto;
              display: block;
              max-width: 100%;
            }
            @media only screen and (max-width: 600px) {
              .success-icon {
                width: 60px;
                height: 60px;
              }
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
              margin-bottom: 10px;
            }
            @media only screen and (max-width: 600px) {
              .title {
                font-size: 20px;
              }
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 30px;
            }
            @media only screen and (max-width: 600px) {
              .subtitle {
                font-size: 14px;
              }
            }
            .order-details {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            @media only screen and (max-width: 600px) {
              .order-details {
                padding: 15px;
              }
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            @media only screen and (max-width: 600px) {
              .detail-row {
                flex-direction: column;
                margin-bottom: 15px;
                padding-bottom: 10px;
              }
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
            }
            @media only screen and (max-width: 600px) {
              .detail-label {
                font-size: 14px;
                margin-bottom: 5px;
              }
            }
            .detail-value {
              color: #6b7280;
              text-align: right;
            }
            @media only screen and (max-width: 600px) {
              .detail-value {
                text-align: left;
                font-size: 14px;
              }
            }
            .amount {
              font-size: 20px;
              font-weight: bold;
              color: #f97316;
            }
            .meeting-info {
              background-color: #fef3e7;
              border-left: 4px solid #f97316;
              padding: 15px;
              margin-bottom: 30px;
              border-radius: 0 8px 8px 0;
            }
            .meeting-title {
              font-weight: 600;
              color: #ea580c;
              margin-bottom: 8px;
            }
            .meeting-text {
              color: #ea580c;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background-color: #f97316;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              word-wrap: break-word;
              max-width: 100%;
            }
            @media only screen and (max-width: 600px) {
              .cta-button {
                padding: 10px 16px;
                font-size: 14px;
                text-align: center;
                display: block;
                margin: 15px auto;
              }
            }
            .contact-button {
              display: inline-block;
              background-color: transparent !important;
              color: #f97316 !important;
              padding: 10px 20px;
              text-decoration: none !important;
              border: 2px solid #f97316 !important;
              border-radius: 8px;
              font-weight: 600;
              margin: 10px 0;
              transition: all 0.3s ease;
            }
            @media only screen and (max-width: 600px) {
              .contact-button {
                padding: 8px 16px;
                font-size: 14px;
                display: block;
                text-align: center;
                margin: 10px auto;
                color: #f97316 !important;
              }
            }
            .contact-button:hover {
              background-color: #f97316 !important;
              color: white !important;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Vakansik</div>
               <img src="https://zqbwtqytteopdsvxubew.supabase.co/storage/v1/object/sign/image-destination/logo-vakansik.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82YTNlMjUzZC1lNTU1LTQ4ZGItOTg4YS03NDZmY2RkZmRlNGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1kZXN0aW5hdGlvbi9sb2dvLXZha2Fuc2lrLndlYnAiLCJpYXQiOjE3NTc2NTc5MzgsImV4cCI6MTc4OTE5MzkzOH0.If5zSR5Fr6U1ggAn1zsQABnJ105weM1dHSnnV6D03So" alt="Vakansik Logo" class="success-icon" />
              <div class="title">Pembayaran Berhasil!</div>
              <div class="subtitle">Terima kasih telah memesan perjalanan dengan kami</div>
            </div>

            <div class="order-details">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Nama Pemesan:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${userName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">ID Pesanan:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${orderId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Destinasi:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${tripName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Tanggal Perjalanan:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span class="detail-label">Total Pembayaran:</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span class="detail-value amount">${formattedAmount}</span>
                  </td>
                </tr>
              </table>
            </div>

            <div class="meeting-info">
              <div class="meeting-title">📍 Titik Kumpul</div>
              <div class="meeting-text">${meetingPoint}</div>
            </div>

            <div style="text-align: center;">
              <a href="vakansik://bookings" class="cta-button">Setelah pembayaranmu sudah selesai, kamu akan diundang ke grup WA Open Trip ini. Tunggu sebentar ya!</a>
            </div>

            <div class="footer">
              <p>Terima kasih telah memilih Vakansik untuk perjalanan Anda!</p>
              <p>Jika Anda memiliki pertanyaan, silakan hubungi tim customer service kami.</p>
              <p><strong>Vakansik Team</strong></p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://wa.me/6287811047085" class="contact-button" style="display: inline-block; background-color: transparent; color: #f97316; padding: 10px 20px; text-decoration: none; border: 2px solid #f97316; border-radius: 8px; font-weight: 600; margin: 10px 0;">Contact Us</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await resend.emails.send({
      from: 'Vakansik <halo@vakansik.com>',
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return false;
  }
}

/**
 * Send admin notification email for successful payment
 */
export async function sendAdminNotificationEmail(data: AdminNotificationEmailData): Promise<boolean> {
  try {
    const { orderId, userName, userEmail, tripName, tripDate, amount, meetingPoint, joinedUsers } = data;
    
    // Get admin emails from environment variable (can be comma-separated or single email)
    const adminEmailConfig = Deno.env.get("ADMIN_EMAIL");
    if (!adminEmailConfig) {
      console.error('Admin email not configured in environment variables');
      return false;
    }
    
    // Parse admin emails (support both single email and comma-separated list)
    const adminEmails = adminEmailConfig.split(',').map(email => email.trim()).filter(email => email.length > 0);
    if (adminEmails.length === 0) {
      console.error('No valid admin emails found');
      return false;
    }
    
    // Format the amount in Indonesian Rupiah
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

    // Format the trip date
    const formattedDate = new Date(tripDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format joined users list with phone numbers
    const joinedUsersList = joinedUsers && joinedUsers.length > 0 
      ? joinedUsers.map(user => {
          const name = user.name || user.email || 'Unknown';
          const phone = user.phone ? ` (${user.phone})` : '';
          return `• ${name}${phone}`;
        }).join('<br>')
      : '• ' + userName;

    const emailTemplate: EmailTemplate = {
      to: adminEmails.join(','), // Send to all admin emails
      subject: `🔔 New Successful Payment - Order ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Payment Notification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
              width: 100% !important;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 20px;
              max-width: 600px;
              margin: 0 auto;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            @media only screen and (max-width: 600px) {
              .container {
                padding: 15px;
                margin: 10px;
                border-radius: 8px;
              }
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #f97316;
              margin-bottom: 10px;
            }
            .notification-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px auto;
              display: block;
              max-width: 100%;
            }
            @media only screen and (max-width: 600px) {
              .notification-icon {
                width: 60px;
                height: 60px;
              }
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 10px;
            }
            @media only screen and (max-width: 600px) {
              .title {
                font-size: 20px;
              }
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 30px;
            }
            @media only screen and (max-width: 600px) {
              .subtitle {
                font-size: 14px;
              }
            }
            .order-details {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
            }
            @media only screen and (max-width: 600px) {
              .order-details {
                padding: 15px;
              }
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            @media only screen and (max-width: 600px) {
              .detail-row {
                flex-direction: column;
                margin-bottom: 15px;
                padding-bottom: 10px;
              }
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
            }
            @media only screen and (max-width: 600px) {
              .detail-label {
                font-size: 14px;
                margin-bottom: 5px;
              }
            }
            .detail-value {
              color: #6b7280;
              text-align: right;
            }
            @media only screen and (max-width: 600px) {
              .detail-value {
                text-align: left;
                font-size: 14px;
              }
            }
            .amount {
              font-size: 20px;
              font-weight: bold;
              color: #059669;
            }
            .meeting-info {
              background-color: #ecfdf5;
              border-left: 4px solid #059669;
              padding: 15px;
              margin-bottom: 30px;
              border-radius: 0 8px 8px 0;
            }
            .meeting-title {
              font-weight: 600;
              color: #047857;
              margin-bottom: 8px;
            }
            .meeting-text {
              color: #047857;
            }
            .participants-info {
              background-color: #fef3e7;
              border-left: 4px solid #f97316;
              padding: 15px;
              margin-bottom: 30px;
              border-radius: 0 8px 8px 0;
            }
            .participants-title {
              font-weight: 600;
              color: #ea580c;
              margin-bottom: 8px;
            }
            .participants-text {
              color: #ea580c;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background-color: #059669;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              word-wrap: break-word;
              max-width: 100%;
            }
            @media only screen and (max-width: 600px) {
              .cta-button {
                padding: 10px 16px;
                font-size: 14px;
                text-align: center;
                display: block;
                margin: 15px auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Vakansik Admin</div>
              <div style="font-size: 48px; color: #059669;">🔔</div>
              <div class="title">New Successful Payment!</div>
              <div class="subtitle">A customer has successfully completed their payment</div>
            </div>

            <div class="order-details">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Order ID:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${orderId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Customer Name:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${userName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Customer Email:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${userEmail}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Trip:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${tripName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span class="detail-label">Trip Date:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span class="detail-value">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <span class="detail-label">Total Amount:</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span class="detail-value amount">${formattedAmount}</span>
                  </td>
                </tr>
              </table>
            </div>

            <div class="meeting-info">
              <div class="meeting-title">📍 Meeting Point</div>
              <div class="meeting-text">${meetingPoint}</div>
            </div>

            <div class="participants-info">
              <div class="participants-title">👥 Participants</div>
              <div class="participants-text">${joinedUsersList}</div>
            </div>

            <div style="text-align: center;">
              <a href="mailto:${userEmail}" class="cta-button">Contact Customer</a>
            </div>

            <div class="footer">
              <p><strong>Vakansik Admin Panel</strong></p>
              <p>This is an automated notification for successful payments.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await resend.emails.send({
      from: 'Vakansik Admin <admin@vakansik.com>',
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log(`Admin notification email sent successfully to ${adminEmails.length} admin(s):`, adminEmails, result);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
}