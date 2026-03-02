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
    Calendar.Acl.insert({
      role: 'writer',
      scope: {
        type: 'user',
        value: managerEmail
      }
    }, userEmail);
    logAction(actionLog, 'Calendar', 'Grant Calendar Access to Manager', 'Success', `${managerEmail} on ${userEmail}`);
  } catch (error) {
    logAction(actionLog, 'Calendar', 'Grant Calendar Access to Manager', 'Failed', error.message);
  }
}
