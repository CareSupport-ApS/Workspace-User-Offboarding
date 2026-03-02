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
        pageToken: pageToken,
        query: 'isSuspended=false',
        fields: 'users(primaryEmail,name/fullName),nextPageToken'
      });

      if (response.users && response.users.length > 0) {
        response.users.forEach(function(user) {
          users.push({
            email: user.primaryEmail,
            name: user.name.fullName
          });
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
  const context = {
    userDisplay: email,
    managerEmail: null,
    managerDisplay: 'No manager found.'
  };

  try {
    const user = AdminDirectory.Users.get(email, { projection: 'full' });

    if (user.name && user.name.fullName) {
      context.userDisplay = `${user.name.fullName} <${email}>`;
    }

    if (user.relations && user.relations.length > 0) {
      const managerRelation = user.relations.find(r => r.type === 'manager' && r.value);
      if (managerRelation) {
        context.managerEmail = managerRelation.value;
        context.managerDisplay = managerRelation.value;

        try {
          const managerUser = AdminDirectory.Users.get(context.managerEmail, { projection: 'basic' });
          if (managerUser.name && managerUser.name.fullName) {
            context.managerDisplay = `${managerUser.name.fullName} <${context.managerEmail}>`;
          }
        } catch (managerError) {
          // Keep manager email as display value.
        }
      }
    }

    logAction(actionLog, 'Directory', 'Load User Context', 'Success', `User: ${context.userDisplay} | Manager: ${context.managerDisplay}`);
  } catch (error) {
    logAction(actionLog, 'Directory', 'Load User Context', 'Failed', error.message);
    throw new Error('Failed to load user context: ' + error.message);
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

    groups.groups.forEach(function(group) {
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

    roleAssignments.items.forEach(function(assignment) {
      let roleName = assignment.roleId;
      try {
        const roleInfo = AdminDirectory.Roles.get('my_customer', assignment.roleId);
        if (roleInfo && roleInfo.roleName) {
          roleName = roleInfo.roleName;
        }
      } catch (roleLookupError) {
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
