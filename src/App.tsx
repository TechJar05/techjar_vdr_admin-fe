import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, AuthProvider } from './context';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
