function logAction(actionLog, category, action, result, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    category: category,
    action: action,
    result: result,
    details: details || ''
  };
  actionLog.push(entry);
  Logger.log(`[${entry.category}] ${entry.action} - ${entry.result}: ${entry.details}`);
  return entry;
}

function actionLogToText(actionLog) {
  return actionLog
    .map(item => `- [${item.category}] ${item.action}: ${item.result}${item.details ? ' (' + item.details + ')' : ''}`)
    .join('\n');
}
