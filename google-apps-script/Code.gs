/**
 * Crown Collision - website form handler
 *
 * What this does:
 *   1. Receives a booking request from the website.
 *   2. Appends one row to the Google Sheet it is bound to.
 *   3. Emails the shop so nobody has to watch the spreadsheet.
 *   4. Optionally sends the customer a short confirmation.
 *
 * Where it lives:
 *   Google Sheet  >  Extensions  >  Apps Script  >  paste this in.
 *
 * Deploying it, and pasting the resulting URL into the website,
 * is covered step by step in the deployment guide.
 */

/* ====================== SETTINGS ====================== */

var SETTINGS = {
  // Who gets told about a new request. Comma separate for more than one.
  notifyEmail: 'info@crowncollisoncalgary.com',

  // Tab inside the spreadsheet. Created automatically if missing.
  sheetName: 'Requests',

  // Send the customer a short confirmation when they leave an email.
  sendCustomerReply: true,

  // Name the confirmation comes from.
  businessName: 'Crown Collision',
  businessPhone: '403 276 9613',

  // Calgary. Leave this alone unless you move.
  timeZone: 'America/Edmonton'
};

/* Column order in the sheet. Add to the end if you add form fields. */
var COLUMNS = [
  ['timestamp',      'Received'],
  ['name',           'Name'],
  ['phone',          'Phone'],
  ['email',          'Email'],
  ['job_type',       'Job type'],
  ['vehicle_year',   'Year'],
  ['vehicle_make',   'Make'],
  ['vehicle_model',  'Model'],
  ['insurer',        'Insurer'],
  ['claim_number',   'Claim number'],
  ['preferred_date', 'Preferred date'],
  ['preferred_time', 'Time of day'],
  ['message',        'Details'],
  ['page_url',       'Page'],
  ['status',         'Status']
];

/* ====================== ENTRY POINTS ====================== */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return reply({ result: 'error', message: 'Busy. Please try again.' });
  }

  try {
    var data = parseBody(e);

    if (!data || !trim(data.name) || !trim(data.phone)) {
      return reply({ result: 'error', message: 'Name and phone are required.' });
    }

    // Honeypot. Real people leave this empty.
    if (trim(data.company)) {
      return reply({ result: 'ok' });
    }

    data.timestamp = Utilities.formatDate(new Date(), SETTINGS.timeZone, 'yyyy-MM-dd HH:mm:ss');
    data.status = 'New';

    var row = writeRow(data);
    notifyShop(data, row);

    if (SETTINGS.sendCustomerReply && isEmail(trim(data.email))) {
      confirmToCustomer(data);
    }

    return reply({ result: 'ok', row: row });

  } catch (err) {
    logFailure(err, e);
    return reply({ result: 'error', message: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/** Visiting the /exec URL in a browser shows this, which is a handy check. */
function doGet() {
  return reply({ result: 'ok', message: 'Crown Collision form handler is running.' });
}

/* ====================== SHEET ====================== */

function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SETTINGS.sheetName);

  if (!sh) {
    sh = ss.insertSheet(SETTINGS.sheetName);
  }

  if (sh.getLastRow() === 0) {
    var headers = COLUMNS.map(function (c) { return c[1]; });
    sh.appendRow(headers);
    var head = sh.getRange(1, 1, 1, headers.length);
    head.setFontWeight('bold')
        .setBackground('#08090b')
        .setFontColor('#d8a838');
    sh.setFrozenRows(1);
    sh.setColumnWidth(COLUMNS.length - 2, 380); // Details column
  }
  return sh;
}

function writeRow(data) {
  var sh = sheet();
  var values = COLUMNS.map(function (c) {
    var v = data[c[0]];
    return v === undefined || v === null ? '' : String(v);
  });
  sh.appendRow(values);
  return sh.getLastRow();
}

/* ====================== EMAIL ====================== */

function notifyShop(data, row) {
  var to = SETTINGS.notifyEmail;
  if (!to) return;

  var who = trim(data.name);
  var type = trim(data.job_type) || 'Request';
  var subject = 'New ' + type.toLowerCase() + ' request: ' + who + ' (' + trim(data.phone) + ')';

  var rows = COLUMNS
    .filter(function (c) { return c[0] !== 'status'; })
    .map(function (c) {
      var v = trim(data[c[0]]);
      if (!v) return '';
      return '<tr>' +
        '<td style="padding:9px 14px;border-bottom:1px solid #eee;color:#666;' +
        'font:600 12px/1.4 Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;' +
        'white-space:nowrap;vertical-align:top;">' + esc(c[1]) + '</td>' +
        '<td style="padding:9px 14px;border-bottom:1px solid #eee;' +
        'font:400 15px/1.55 Arial,sans-serif;color:#111;">' + esc(v) + '</td></tr>';
    })
    .join('');

  var html =
    '<div style="background:#f4f4f5;padding:26px;">' +
      '<div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e3e3e6;">' +
        '<div style="background:#08090b;padding:20px 24px;">' +
          '<div style="color:#d8a838;font:700 20px/1 Arial,sans-serif;letter-spacing:.06em;' +
          'text-transform:uppercase;">Crown Collision</div>' +
          '<div style="color:#9aa1ab;font:400 13px/1.5 Arial,sans-serif;margin-top:5px;">' +
          'New request from the website</div>' +
        '</div>' +
        '<div style="padding:22px 24px 6px;font:400 15px/1.6 Arial,sans-serif;color:#111;">' +
          '<b>' + esc(who) + '</b> asked for ' + esc(type.toLowerCase()) + '. ' +
          'Call back on <a href="tel:' + esc(digits(data.phone)) + '" ' +
          'style="color:#8a6a10;">' + esc(trim(data.phone)) + '</a>.' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse;margin:14px 0 0;">' + rows + '</table>' +
        '<div style="padding:16px 24px 22px;font:400 13px/1.6 Arial,sans-serif;color:#777;">' +
          'Row ' + row + ' in the Requests sheet.' +
        '</div>' +
      '</div>' +
    '</div>';

  var plain = COLUMNS
    .filter(function (c) { return trim(data[c[0]]); })
    .map(function (c) { return c[1] + ': ' + trim(data[c[0]]); })
    .join('\n');

  var options = { name: SETTINGS.businessName + ' website', htmlBody: html };
  if (isEmail(trim(data.email))) options.replyTo = trim(data.email);

  MailApp.sendEmail(to, subject, plain, options);
}

function confirmToCustomer(data) {
  var to = trim(data.email);
  var first = trim(data.name).split(/\s+/)[0] || 'there';

  var html =
    '<div style="background:#f4f4f5;padding:26px;">' +
      '<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e3e3e6;">' +
        '<div style="background:#08090b;padding:20px 24px;color:#d8a838;' +
        'font:700 20px/1 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;">' +
        'Crown Collision</div>' +
        '<div style="padding:24px;font:400 15px/1.65 Arial,sans-serif;color:#111;">' +
          '<p style="margin:0 0 14px;">Hi ' + esc(first) + ',</p>' +
          '<p style="margin:0 0 14px;">We have your request and someone will call you back shortly ' +
          'to sort out a time.</p>' +
          '<p style="margin:0 0 14px;">If you need us sooner, the shop line is ' +
          '<a href="tel:' + esc(digits(SETTINGS.businessPhone)) + '" style="color:#8a6a10;">' +
          esc(SETTINGS.businessPhone) + '</a>.</p>' +
          '<p style="margin:22px 0 0;color:#666;font-size:14px;">' + esc(SETTINGS.businessName) + '<br>' +
          'Calgary, AB</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail(to, 'We got your request', 
    'Hi ' + first + ',\n\nWe have your request and will call you back shortly.\n\n' +
    SETTINGS.businessName + '\n' + SETTINGS.businessPhone,
    { name: SETTINGS.businessName, htmlBody: html });
}

/* ====================== HELPERS ====================== */

function parseBody(e) {
  if (!e) return null;

  // The site posts JSON as text/plain to avoid a CORS preflight.
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // Fall through to form encoded values.
    }
  }
  if (e.parameter && Object.keys(e.parameter).length) return e.parameter;
  return null;
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function trim(v) {
  return v === undefined || v === null ? '' : String(v).trim();
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function digits(v) {
  return trim(v).replace(/[^\d+]/g, '');
}

function esc(v) {
  return trim(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function logFailure(err, e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName('Errors') || ss.insertSheet('Errors');
    if (sh.getLastRow() === 0) sh.appendRow(['When', 'Error', 'Payload']);
    sh.appendRow([
      Utilities.formatDate(new Date(), SETTINGS.timeZone, 'yyyy-MM-dd HH:mm:ss'),
      String(err && err.stack ? err.stack : err),
      e && e.postData ? String(e.postData.contents).slice(0, 4000) : ''
    ]);
  } catch (ignored) {}
}

/* ====================== ONE OFF CHECKS ====================== */

/**
 * Run this once from the Apps Script editor to create the sheet
 * headers and to trigger the permission prompt before you deploy.
 */
function setup() {
  sheet();
  Logger.log('Sheet ready: ' + SETTINGS.sheetName);
}

/**
 * Run this to prove the whole path works. It writes a test row
 * and emails you exactly what a real request looks like.
 */
function sendTestRequest() {
  var fake = {
    name: 'Test Customer',
    phone: '403 555 0134',
    email: SETTINGS.notifyEmail,
    job_type: 'Insurance claim',
    vehicle_year: '2019',
    vehicle_make: 'Toyota',
    vehicle_model: 'RAV4',
    insurer: 'Test Insurance',
    claim_number: 'TEST-0001',
    preferred_date: '2026-01-15',
    preferred_time: 'Morning',
    message: 'This is a test row. Delete it once you have seen it.',
    page_url: 'local test',
    timestamp: Utilities.formatDate(new Date(), SETTINGS.timeZone, 'yyyy-MM-dd HH:mm:ss'),
    status: 'Test'
  };
  var row = writeRow(fake);
  notifyShop(fake, row);
  Logger.log('Test written to row ' + row + ' and emailed to ' + SETTINGS.notifyEmail);
}
