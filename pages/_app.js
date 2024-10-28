import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import "@/styles/globals.css";

function E4SSCApp({ Component, pageProps }) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser) {
    return null;
  }

  return (
    <BrowserRouter>
      <Component {...pageProps} />
    </BrowserRouter>
  );
}

export default E4SSCApp;
