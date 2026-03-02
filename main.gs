// Version 2.1
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Google Workspace Offboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sendRunSummaryEmailToScriptRunner(result, actionLog) {
  const recipient = Session.getActiveUser().getEmail();
  const subject = `[Workspace Offboarding] ${result.success ? 'Success' : 'Failure'} - ${result.userEmail}`;
  const body = [
    `Status: ${result.success ? 'SUCCESS' : 'FAILED'}`,
    `User: ${result.userDisplay || result.userEmail}`,
    `Manager: ${result.managerDisplay || 'None'}`,
    `Runner: ${recipient}`,
    '',
    'Action log:',
    actionLogToText(actionLog),
    '',
    result.success ? `Temporary Password: ${result.newPassword}` : `Error: ${result.errorMessage}`
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    });
    logAction(actionLog, 'System', 'Send Summary Email to Script Runner', 'Success', recipient);
  } catch (error) {
    logAction(actionLog, 'System', 'Send Summary Email to Script Runner', 'Failed', error.message);
  }
}

function offboardUser(formData) {
  const email = formData.email;
  const actionLog = [];
  let context = {
    userDisplay: email,
    managerEmail: null,
    managerDisplay: 'No manager found.'
  };
  let newPassword = '';

  try {
    if (!email) {
      throw new Error('User email is required.');
    }

    if (!isSuperAdmin()) {
      throw new Error('You must be a Google Workspace super admin to use this tool.');
    }

    logAction(actionLog, 'System', 'Start Offboarding Run', 'Success', email);

    context = getUserDirectoryContext(email, actionLog);

    suspendUser(email, actionLog);
    newPassword = resetUserPassword(email, actionLog);

    removeUserFromGroups(email, actionLog);
    removeCustomAdminRoles(email, actionLog);
    hideUserFromGlobalAddressList(email, actionLog);

    transferDriveOwnershipToManager(email, context.managerEmail, context.managerDisplay, actionLog);

    runGmailOperations(email, actionLog, {
      autoReplySubject: formData.autoReplySubject,
      autoReplyMessage: formData.autoReplyMessage
    });
    runCalendarOperations(email, context.managerEmail, actionLog);

    removeAppSpecificPasswords(email, actionLog);
    revokeOauthTokens(email, actionLog);
    signUserOutOfAllSessions(email, actionLog);

    logAction(actionLog, 'System', 'Finish Offboarding Run', 'Success', email);

    const result = {
      success: true,
      userEmail: email,
      userDisplay: context.userDisplay,
      managerDisplay: context.managerDisplay,
      newPassword: newPassword,
      message: 'User offboarded successfully!',
      log: actionLog
    };

    sendRunSummaryEmailToScriptRunner(result, actionLog);
    return result;
  } catch (error) {
    logAction(actionLog, 'System', 'Finish Offboarding Run', 'Failed', error.message);

    const failureResult = {
      success: false,
      userEmail: email,
      userDisplay: context.userDisplay,
      managerDisplay: context.managerDisplay,
      errorMessage: error.message,
      message: 'Failed to offboard user: ' + error.message,
      log: actionLog
    };

    sendRunSummaryEmailToScriptRunner(failureResult, actionLog);
    throw new Error(failureResult.message);
  }
}
