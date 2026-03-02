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
  for (let i = password.length; i < length; i++) {
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
    throw new Error('Failed to suspend user: ' + error.message);
  }
}

function resetUserPassword(email, actionLog) {
  const newPassword = generatePassword();
  try {
    AdminDirectory.Users.update({
      password: newPassword,
      changePasswordAtNextLogin: true
    }, email);
    logAction(actionLog, 'Security', 'Reset Password', 'Success', 'Password reset and forced rotation on next login.');
    return newPassword;
  } catch (error) {
    logAction(actionLog, 'Security', 'Reset Password', 'Failed', error.message);
    throw new Error('Failed to reset password: ' + error.message);
  }
}

function removeAppSpecificPasswords(email, actionLog) {
  try {
    const asps = AdminDirectory.Asps.list(email);

    if (!asps.items || asps.items.length === 0) {
      logAction(actionLog, 'Security', 'Remove App-Specific Passwords', 'Skipped', 'No app-specific passwords found.');
      return;
    }

    asps.items.forEach(function(asp) {
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

    tokens.forEach(function(token) {
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
