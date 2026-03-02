// @ts-nocheck

function logAction(actionLog, category, action, result, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    category,
    action,
    result,
    details: details || ''
  };
  actionLog.push(entry);
  Logger.log(`[${entry.category}] ${entry.action} - ${entry.result}: ${entry.details}`);
  return entry;
}

function actionLogToText(actionLog) {
  return actionLog
    .map((item) => `- [${item.category}] ${item.action}: ${item.result}${item.details ? ` (${item.details})` : ''}`)
    .join('\n');
}

function isSuperAdmin() {
  try {
    AdminDirectory.Users.list({ customer: 'my_customer', maxResults: 1 });
    return true;
  } catch (e) {
    return false;
  }
}

function getAllUsers() {
  try {
    const users = [];
    let pageToken;

    do {
      const response = AdminDirectory.Users.list({
        customer: 'my_customer',
        maxResults: 100,
        orderBy: 'givenName',
        pageToken,
        query: 'isSuspended=false',
        fields: 'users(primaryEmail,name/fullName),nextPageToken'
      });

      if (response.users && response.users.length > 0) {
        response.users.forEach((user) => {
          users.push({ email: user.primaryEmail, name: user.name.fullName });
        });
      }

      pageToken = response.nextPageToken;
    } while (pageToken);

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

function getUserDirectoryContext(email, actionLog) {
  const context = { userDisplay: email, managerEmail: null, managerDisplay: 'No manager found.' };

  try {
    const user = AdminDirectory.Users.get(email, { projection: 'full' });

    if (user.name && user.name.fullName) {
      context.userDisplay = `${user.name.fullName} <${email}>`;
    }

    if (user.relations && user.relations.length > 0) {
      const managerRelation = user.relations.find((r) => r.type === 'manager' && r.value);
      if (managerRelation) {
        context.managerEmail = managerRelation.value;
        context.managerDisplay = managerRelation.value;

        try {
          const managerUser = AdminDirectory.Users.get(context.managerEmail, { projection: 'basic' });
          if (managerUser.name && managerUser.name.fullName) {
            context.managerDisplay = `${managerUser.name.fullName} <${context.managerEmail}>`;
          }
        } catch (_managerError) {
          // Keep manager email as display value.
        }
      }
    }

    logAction(actionLog, 'Directory', 'Load User Context', 'Success', `User: ${context.userDisplay} | Manager: ${context.managerDisplay}`);
  } catch (error) {
    logAction(actionLog, 'Directory', 'Load User Context', 'Failed', error.message);
    throw new Error(`Failed to load user context: ${error.message}`);
  }

  return context;
}

function removeUserFromGroups(email, actionLog) {
  try {
    const groups = AdminDirectory.Groups.list({ userKey: email, maxResults: 500 });

    if (!groups.groups || groups.groups.length === 0) {
      logAction(actionLog, 'Directory', 'Remove Group Memberships', 'Skipped', 'User is not a member of any groups.');
      return;
    }

    groups.groups.forEach((group) => {
      try {
        AdminDirectory.Members.remove(group.id, email);
        logAction(actionLog, 'Directory', 'Remove Group Membership', 'Success', group.email);
      } catch (groupError) {
        logAction(actionLog, 'Directory', 'Remove Group Membership', 'Failed', `${group.email}: ${groupError.message}`);
      }
    });
  } catch (error) {
    logAction(actionLog, 'Directory', 'Remove Group Memberships', 'Failed', error.message);
  }
}

function removeCustomAdminRoles(email, actionLog) {
  try {
    const roleAssignments = AdminDirectory.RoleAssignments.list('my_customer', { userKey: email });

    if (!roleAssignments.items || roleAssignments.items.length === 0) {
      logAction(actionLog, 'Directory', 'Remove Custom Admin Roles', 'Skipped', 'No custom admin roles assigned.');
      return;
    }

    roleAssignments.items.forEach((assignment) => {
      let roleName = assignment.roleId;
      try {
        const roleInfo = AdminDirectory.Roles.get('my_customer', assignment.roleId);
        if (roleInfo && roleInfo.roleName) roleName = roleInfo.roleName;
      } catch (_roleLookupError) {
        // Keep role ID as fallback.
      }

      try {
        AdminDirectory.RoleAssignments.remove('my_customer', assignment.roleAssignmentId);
        logAction(actionLog, 'Directory', 'Remove Custom Admin Role', 'Success', roleName);
      } catch (removeError) {
        logAction(actionLog, 'Directory', 'Remove Custom Admin Role', 'Failed', `${roleName}: ${removeError.message}`);
      }
    });
  } catch (error) {
    logAction(actionLog, 'Directory', 'Remove Custom Admin Roles', 'Failed', error.message);
  }
}

function hideUserFromGlobalAddressList(email, actionLog) {
  try {
    AdminDirectory.Users.update({ includeInGlobalAddressList: false }, email);
    logAction(actionLog, 'Directory', 'Hide User from Global Address List', 'Success', email);
  } catch (error) {
    logAction(actionLog, 'Directory', 'Hide User from Global Address List', 'Failed', error.message);
  }
}

function generatePassword() {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()-_=+[]{};:,.<>?';

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i += 1) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function suspendUser(email, actionLog) {
  try {
    AdminDirectory.Users.update({ suspended: true }, email);
    logAction(actionLog, 'Security', 'Suspend User', 'Success', email);
  } catch (error) {
    logAction(actionLog, 'Security', 'Suspend User', 'Failed', error.message);
    throw new Error(`Failed to suspend user: ${error.message}`);
  }
}

function resetUserPassword(email, actionLog) {
  const newPassword = generatePassword();
  try {
    AdminDirectory.Users.update({ password: newPassword, changePasswordAtNextLogin: true }, email);
    logAction(actionLog, 'Security', 'Reset Password', 'Success', 'Password reset and forced rotation on next login.');
    return newPassword;
  } catch (error) {
    logAction(actionLog, 'Security', 'Reset Password', 'Failed', error.message);
    throw new Error(`Failed to reset password: ${error.message}`);
  }
}

function removeAppSpecificPasswords(email, actionLog) {
  try {
    const asps = AdminDirectory.Asps.list(email);

    if (!asps.items || asps.items.length === 0) {
      logAction(actionLog, 'Security', 'Remove App-Specific Passwords', 'Skipped', 'No app-specific passwords found.');
      return;
    }

    asps.items.forEach((asp) => {
      try {
        AdminDirectory.Asps.delete(email, asp.codeId);
        logAction(actionLog, 'Security', 'Remove App-Specific Password', 'Success', asp.codeId);
      } catch (error) {
        logAction(actionLog, 'Security', 'Remove App-Specific Password', 'Failed', `${asp.codeId}: ${error.message}`);
      }
    });
  } catch (error) {
    logAction(actionLog, 'Security', 'Remove App-Specific Passwords', 'Failed', error.message);
  }
}

function revokeOauthTokens(email, actionLog) {
  try {
    const tokenResponse = AdminDirectory.Tokens.list(email);
    const tokens = tokenResponse.items || [];

    if (tokens.length === 0) {
      logAction(actionLog, 'Security', 'Revoke OAuth Tokens', 'Skipped', 'No OAuth tokens found.');
      return;
    }

    tokens.forEach((token) => {
      try {
        AdminDirectory.Tokens.remove(email, token.clientId);
        logAction(actionLog, 'Security', 'Revoke OAuth Token', 'Success', token.clientId);
      } catch (error) {
        logAction(actionLog, 'Security', 'Revoke OAuth Token', 'Failed', `${token.clientId}: ${error.message}`);
      }
    });
  } catch (error) {
    logAction(actionLog, 'Security', 'Revoke OAuth Tokens', 'Failed', error.message);
  }
}

function signUserOutOfAllSessions(email, actionLog) {
  try {
    AdminDirectory.Users.signOut(email);
    logAction(actionLog, 'Security', 'Sign Out of All Sessions', 'Success', email);
  } catch (error) {
    logAction(actionLog, 'Security', 'Sign Out of All Sessions', 'Failed', error.message);
  }
}

function transferDriveOwnershipToManager(userEmail, managerEmail, managerDisplay, actionLog) {
  if (!managerEmail) {
    logAction(actionLog, 'Drive', 'Transfer Ownership', 'Skipped', 'No manager set for the user.');
    return;
  }

  try {
    let pageToken;
    let transferredCount = 0;
    let foundCount = 0;

    do {
      const files = Drive.Files.list({
        q: `'${userEmail}' in owners and trashed = false`,
        pageSize: 100,
        pageToken
      });

      const items = files.items || [];
      foundCount += items.length;

      items.forEach((file) => {
        try {
          Drive.Permissions.insert({
            type: 'user',
            role: 'owner',
            value: managerEmail,
            emailAddress: managerEmail,
            transferOwnership: true
          }, file.id);
          transferredCount += 1;
          logAction(actionLog, 'Drive', 'Transfer File Ownership', 'Success', `${file.title} -> ${managerDisplay}`);
        } catch (fileError) {
          logAction(actionLog, 'Drive', 'Transfer File Ownership', 'Failed', `${file.title}: ${fileError.message}`);
        }
      });

      pageToken = files.nextPageToken;
    } while (pageToken);

    if (foundCount === 0) {
      logAction(actionLog, 'Drive', 'Transfer Ownership', 'Skipped', 'No owned Drive files found.');
    } else {
      logAction(actionLog, 'Drive', 'Transfer Ownership', 'Completed', `Transferred ${transferredCount} of ${foundCount} files to ${managerDisplay}.`);
    }
  } catch (error) {
    logAction(actionLog, 'Drive', 'Transfer Ownership', 'Failed', error.message);
  }
}

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

    logAction(actionLog, 'Gmail', 'Enable Vacation Auto-Reply', 'Success', `${userEmail} | Subject: ${subject}`);
  } catch (error) {
    logAction(actionLog, 'Gmail', 'Enable Vacation Auto-Reply', 'Failed', `${userEmail}: ${error.message}`);
  }
}

function runCalendarOperations(userEmail, managerEmail, actionLog) {
  if (!managerEmail) {
    logAction(actionLog, 'Calendar', 'Grant Calendar Access to Manager', 'Skipped', 'No manager available.');
    return;
  }

  if (typeof Calendar === 'undefined' || !Calendar.Acl) {
    logAction(actionLog, 'Calendar', 'Grant Calendar Access to Manager', 'Skipped', 'Calendar advanced service is not enabled.');
    return;
  }

  try {
    Calendar.Acl.insert({ role: 'writer', scope: { type: 'user', value: managerEmail } }, userEmail);
    logAction(actionLog, 'Calendar', 'Grant Calendar Access to Manager', 'Success', `${managerEmail} on ${userEmail}`);
  } catch (error) {
    logAction(actionLog, 'Calendar', 'Grant Calendar Access to Manager', 'Failed', error.message);
  }
}

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
    MailApp.sendEmail({ to: recipient, subject, body });
    logAction(actionLog, 'System', 'Send Summary Email to Script Runner', 'Success', recipient);
  } catch (error) {
    logAction(actionLog, 'System', 'Send Summary Email to Script Runner', 'Failed', error.message);
  }
}

function offboardUser(formData) {
  const email = formData.email;
  const actionLog = [];
  let context = { userDisplay: email, managerEmail: null, managerDisplay: 'No manager found.' };
  let newPassword = '';

  try {
    if (!email) throw new Error('User email is required.');
    if (!isSuperAdmin()) throw new Error('You must be a Google Workspace super admin to use this tool.');

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
      newPassword,
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
      message: `Failed to offboard user: ${error.message}`,
      log: actionLog
    };

    sendRunSummaryEmailToScriptRunner(failureResult, actionLog);
    throw new Error(failureResult.message);
  }
}

Object.assign(globalThis, { doGet, offboardUser, getAllUsers });
