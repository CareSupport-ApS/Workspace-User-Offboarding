function runGmailOperations(userEmail, actionLog, options) {
  const config = options || {};
  const subject = config.autoReplySubject || 'Out of office';
  const message = config.autoReplyMessage || 'This mailbox is no longer monitored. Please contact your manager or IT support for assistance.';

  try {
    Gmail.Users.Settings.updateVacation({
      enableAutoReply: true,
      responseSubject: subject,
      responseBodyPlainText: message,
      restrictToContacts: false,
      restrictToDomain: true
    }, userEmail);

    logAction(
      actionLog,
      'Gmail',
      'Enable Vacation Auto-Reply',
      'Success',
      `${userEmail} | Subject: ${subject}`
    );
  } catch (error) {
    logAction(
      actionLog,
      'Gmail',
      'Enable Vacation Auto-Reply',
      'Failed',
      `${userEmail}: ${error.message}`
    );
  }
}
