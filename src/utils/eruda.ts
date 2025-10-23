import eruda from 'eruda';

export async function setupEruda(id: any) {
  const enable =
    /(\?|&)debug=1\b/.test(location.search) || localStorage.getItem('eruda') === '1';
  if (!enable) return;

  (window as any).eruda = eruda;
  if (id === '1463782322' || id === '2106187940') {
    eruda.init();
    eruda.get('console')?.config.set('catchGlobalErr', false);
  }
}