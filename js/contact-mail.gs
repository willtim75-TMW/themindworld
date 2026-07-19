/**
 * The Mind World — contact form mailer (Google Apps Script)
 *
 * Deploy as a Web app (Execute as: Me, Who has access: Anyone),
 * then paste the Web app URL into GOOGLE_SCRIPT_URL in js/main.js
 *
 * Change CONTACT_TO when Google Workspace is ready.
 */
var CONTACT_TO = "willtim75@gmail.com";
var CONTACT_SUBJECT = "The Mind World Request";

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    var name = data.name || "(not provided)";
    var email = data.email || "";
    var business = data.business || "(not provided)";
    var message = data.message || "";
    var details = data.details || "";
    var subject = data.subject || CONTACT_SUBJECT;

    var body =
      details ||
      [
        "The Mind World — new website request",
        "",
        "Name: " + name,
        "Email: " + email,
        "Business: " + business,
        "",
        "Message:",
        message,
      ].join("\n");

    var options = {
      to: CONTACT_TO,
      subject: subject,
      body: body,
    };

    if (email) {
      options.replyTo = email;
    }

    MailApp.sendEmail(options);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/** Optional: open the web app URL in a browser to confirm deployment */
function doGet() {
  return ContentService.createTextOutput(
    "The Mind World contact endpoint is running."
  );
}
