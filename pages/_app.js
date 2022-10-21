import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import '../styles/globals.css'
import store from '../redux/store';
import { Provider } from 'react-redux';

const isBrowser = () => window !== undefined;

function MyApp({ Component, pageProps }) {


  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])   
  if(!mounted || !isBrowser()) return 'Loading...';

  return(
    <Provider store={store}>
      <Layout> 
        <Component {...pageProps} />
      </Layout> 
    </Provider>
  );
}

export default MyApp
