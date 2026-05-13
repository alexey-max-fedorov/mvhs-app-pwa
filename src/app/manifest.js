export default function manifest() {
  return {
    name: 'MVHS App',
    short_name: 'MVHS',
    theme_color: '#050506',
    background_color: '#050506',
    display: 'standalone',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
