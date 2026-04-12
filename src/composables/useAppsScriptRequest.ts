import { ref } from 'vue';

export function useAppsScriptRequest<TResult>() {
  const result = ref<TResult | null>(null);
  const loading = ref(false);
  const error = ref('');

  async function execute(request: () => Promise<TResult>) {
    loading.value = true;
    error.value = '';

    try {
      const response = await request();
      result.value = response;
      return response;
    } catch (requestError: unknown) {
      error.value = requestError instanceof Error ? requestError.message : 'Request failed.';
      throw requestError;
    } finally {
      loading.value = false;
    }
  }

  function setResult(value: TResult | null) {
    result.value = value;
  }

  function reset() {
    result.value = null;
    error.value = '';
    loading.value = false;
  }

  return {
    error,
    execute,
    loading,
    reset,
    result,
    setResult
  };
}
