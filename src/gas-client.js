function hasAppsScriptRuntime() {
  return typeof google !== 'undefined' && google.script && google.script.run;
}

export function gasCall(functionName, ...args) {
  return new Promise((resolve, reject) => {
    if (!hasAppsScriptRuntime()) {
      reject(new Error('google.script.run is only available when running as an Apps Script web app.'));
      return;
    }

    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)[functionName](...args);
  });
}
