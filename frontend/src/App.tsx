import { Provider } from 'react-redux';
import { store } from './store';
import AppLayout from './components/Layout/AppLayout';

function App() {
  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );
}

export default App;
