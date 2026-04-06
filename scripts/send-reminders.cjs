const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...rest] = trimmed.split('=');
    if (!key) return;

    const value = rest.join('=').trim();
    if (value === undefined || value === null) return;
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function ensureEnvVariables(keys) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    process.exit(1);
  }
}

async function main() {
  loadDotEnv();

  ensureEnvVariables([
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM',
  ]);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
  const fromAddress = process.env.EMAIL_FROM;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const dbPath = path.resolve(process.cwd(), 'noodle.db');
  if (!fs.existsSync(dbPath)) {
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inOneWeek = new Date(today);
  inOneWeek.setDate(today.getDate() + 7);

  const todayIso = today.toISOString().slice(0, 10);
  const weekIso = inOneWeek.toISOString().slice(0, 10);

  const rows = db.prepare(`
    SELECT u.id AS student_id,
           u.email AS student_email,
           u.first_name AS student_first_name,
           u.last_name AS student_last_name,
           a.id AS assessment_id,
           a.title AS assessment_title,
           a.date AS assessment_date,
           c.title AS course_title,
           c.code AS course_code
    FROM enrollments e
    JOIN users u ON u.id = e.student_id
    JOIN courses c ON c.id = e.course_id
    JOIN assessments a ON a.course_id = c.id
    WHERE a.date > ?
      AND a.date <= ?
    ORDER BY u.email, a.date;
  `).all(todayIso, weekIso);

  const reminders = new Map();

  for (const row of rows) {
    if (!row.student_email) continue;

    const dueDate = new Date(`${row.assessment_date}T00:00:00`);
    if (!(dueDate > today && dueDate <= inOneWeek)) continue;

    const studentKey = row.student_email;
    if (!reminders.has(studentKey)) {
      reminders.set(studentKey, {
        email: row.student_email,
        name: `${row.student_first_name || ''} ${row.student_last_name || ''}`.trim(),
        items: [],
      });
    }

    reminders.get(studentKey).items.push({
      title: row.assessment_title,
      course: row.course_title,
      code: row.course_code,
      date: row.assessment_date,
    });
  }

  if (reminders.size === 0) {
    process.exit(0);
  }

  let sentCount = 0;
  for (const reminder of reminders.values()) {
    const subject = `Upcoming assignment reminder: ${reminder.items.length} due soon`;
    const itemsText = reminder.items
      .map((item) => `- ${item.title} (${item.course || item.code}) — due ${item.date}`)
      .join('\n');
    const bodyText = `Hi ${reminder.name || 'student'},\n\n` +
      `The following assignment(s) are due in the next 7 days:\n\n` +
      `${itemsText}\n\n` +
      `Please complete them before the due dates.\n\n` +
      `Best regards,\nYour Course Notification System`;
    const bodyHtml = `
      <p>Hi ${reminder.name || 'student'},</p>
      <p>The following assignment(s) are due in the next 7 days:</p>
      <ul>
        ${reminder.items.map((item) => `
          <li><strong>${item.title}</strong> (${item.course || item.code}) — due <strong>${item.date}</strong></li>
        `).join('')}
      </ul>
      <p>Please complete them before the due dates.</p>
      <p>Best regards,<br/>Your Course Notification System</p>
    `;

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: reminder.email,
        subject,
        text: bodyText,
        html: bodyHtml,
      });
      sentCount += 1;
    } catch (error) {
      process.exit(1);
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Reminder script failed:', error);
  process.exit(1);
});
