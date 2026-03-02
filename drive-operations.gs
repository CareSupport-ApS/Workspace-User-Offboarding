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
        pageToken: pageToken
      });

      const items = files.items || [];
      foundCount += items.length;

      items.forEach(function(file) {
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
