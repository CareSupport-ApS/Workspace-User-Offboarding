function hasAppsScriptRuntime(): boolean {
  return typeof google !== 'undefined' && Boolean(google?.script?.run);
}

export function gasCall<TResponse>(functionName: string, ...args: unknown[]): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    if (!hasAppsScriptRuntime()) {
      reject(new Error('google.script.run is only available when running as an Apps Script web app.'));
      return;
    }

    const runner = google?.script?.run
      .withSuccessHandler((value) => resolve(value as TResponse))
      .withFailureHandler((error) => reject(error));

    const callable = runner?.[functionName];
    if (typeof callable !== 'function') {
      reject(new Error(`Apps Script function "${functionName}" is not available.`));
      return;
    }

    callable(...args);
  });
}
