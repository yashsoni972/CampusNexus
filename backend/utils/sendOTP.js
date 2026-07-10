const nodemailer = require('nodemailer');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email with professional HTML template
async function sendOTP(toEmail, otp, purpose = 'verification') {
  const isLogin = purpose === 'login';
  const subject = isLogin
    ? 'CampusNexus — Login OTP'
    : 'CampusNexus — Email Verification OTP';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                  CampusNexus
                </h1>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                  College ERP Platform
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 40px 32px;">
                <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:18px;font-weight:700;">
                  ${isLogin ? 'Login Verification Code' : 'Verify Your Email Address'}
                </h2>
                <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                  ${isLogin
                    ? 'Use the code below to complete your login. This code is valid for <strong>10 minutes</strong>.'
                    : 'Enter the code below to verify your email and activate your account. Valid for <strong>10 minutes</strong>.'}
                </p>

                <!-- OTP Box -->
                <div style="background:#f0f0fe;border:2px dashed #4f46e5;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">
                    Your OTP Code
                  </p>
                  <p style="margin:0;font-size:42px;font-weight:800;color:#4f46e5;letter-spacing:10px;">
                    ${otp}
                  </p>
                </div>

                <div style="background:#fef9ec;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                  <p style="margin:0;font-size:13px;color:#92400e;">
                    <strong>Security tip:</strong> Never share this OTP with anyone.
                    CampusNexus will never ask for your OTP.
                  </p>
                </div>

                <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                  If you did not request this, please ignore this email.
                  Your account remains secure.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  &copy; 2025 CampusNexus · Built for modern education
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"CampusNexus" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
}

// Verify transporter is configured
async function verifyMailConfig() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === 'your_gmail@gmail.com' ||
      !process.env.EMAIL_PASS.trim()) {
    console.warn('⚠️  EMAIL not configured — OTP emails disabled, direct login active');
    return false;
  }
  try {
    await transporter.verify();
    console.log('✅ Email transporter ready — OTP emails enabled');
    return true;
  } catch (err) {
    console.warn('⚠️  Email login failed:', err.message);
    console.warn('⚠️  Fix EMAIL_PASS in backend/.env — using direct login for now');
    return false;
  }
}

module.exports = { generateOTP, sendOTP, verifyMailConfig };
