const CACHE_VERSION = 'ego-eimi-v3';
const PRECACHE_URLS = [
  '.',
  'index.html',
  'manifest.json',
  'src/style.css',
  'src/app.js',
  'src/daily-message.js',
  'data/ego_eimi_mensagens.json',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE_VERSION).map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cacheada = await cache.match(request);

      const buscaNaRede = fetch(request)
        .then((resposta) => {
          if (resposta && resposta.ok) {
            cache.put(request, resposta.clone());
          }
          return resposta;
        })
        .catch(() => undefined);

      // Cache-first para respostas rápidas offline; atualiza em segundo plano.
      if (cacheada) {
        buscaNaRede;
        return cacheada;
      }

      const resposta = await buscaNaRede;
      if (resposta) return resposta;

      if (request.mode === 'navigate') {
        return cache.match('index.html');
      }

      return Response.error();
    })
  );
});
