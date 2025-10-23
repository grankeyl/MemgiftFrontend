// export async function setupEruda(id: any) {
//     console.log("SETUP:" + id);
//   const enable =
//     /(\?|&)debug=1\b/.test(location.search) || localStorage.getItem('eruda') === '1';
//   if (!enable) return;

//   (window as any).eruda = eruda;
// //   if (id === '1463782322' || id === '2106187940') {
//     eruda.init();
// //     eruda.get('console')?.config.set('catchGlobalErr', false);
// //   }
// } 

export async function setupEruda(force = false, id: any) {
  const enable = force
    || /(?:\?|&)debug=1\b/.test(location.search)
    || localStorage.getItem('eruda') === '1';
  if (!enable) return;

  const mod = await import('eruda');
  const e: any = (mod as any).default ?? mod; // ВАЖНО: .default в ESM

  if (id === '1463782322' || id === '2106187940') {
    if ((window as any).eruda?._inited) return;
    (window as any).eruda = e;
    e.init();
    e.show(); // на всякий
    // Чтобы не спряталось под шапкой WebView
    const s = document.createElement('style');
    s.textContent = `.eruda-container{z-index:2147483647!important}`;
    document.head.appendChild(s);
    (e as any)._inited = true;
  }
}