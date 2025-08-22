import '../styles.css'; // глобальный css доступен везде

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}