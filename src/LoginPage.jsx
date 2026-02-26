import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  signInWithGoogle, 
  registerWithEmail, 
  loginWithEmail,
  sendEmailLink,
  signInWithLink,
  isEmailLinkSignIn,
  getStoredEmail,
  auth
} from './firebase';

function LoginPage({ onLogin }) {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [usePasswordless, setUsePasswordless] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const checkEmailLink = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const oobCode = urlParams.get('oobCode');
      const apiKey = urlParams.get('apiKey');
      
      let email = urlParams.get('email');
      if (!email) {
        const continueUrl = urlParams.get('continueUrl');
        if (continueUrl) {
          try {
            const continueParams = new URLSearchParams(new URL(continueUrl).search);
            email = continueParams.get('email');
          } catch (e) {
            console.error('Error parsing continueUrl:', e);
          }
        }
      }
      
      if (!email) {
        email = getStoredEmail();
      }
      
      console.log('mode:', mode, 'oobCode:', oobCode ? 'present' : 'missing', 'email:', email);
      
      if (mode === 'signIn' && oobCode && email) {
        console.log('Processing email link sign-in for:', email);
        setLoading(true);
        try {
          const fullLink = window.location.href;
          console.log('Full link:', fullLink);
          const result = await signInWithLink(email, fullLink);
          console.log('Sign in successful:', result.user);
          onLogin(result.user);
          localStorage.removeItem('emailForSignIn');
        } catch (err) {
          console.error('Sign in error:', err);
          setError('El enlace ha expirado o ya fue usado: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkEmailLink();
  }, [searchParams]);

  const handleSignInWithLink = async (email, link) => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithLink(email, link);
      onLogin(result.user);
      localStorage.removeItem('emailForSignIn');
    } catch (err) {
      setError('El enlace ha expirado o ya fue usado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await signInWithGoogle();
      onLogin(result.user);
    } catch (err) {
      setError('Error al iniciar sesión con Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (usePasswordless) {
        console.log('Sending passwordless email to:', email);
        await sendEmailLink(email);
        console.log('Email sent, setting emailSent to true');
        setEmailSent(true);
      } else if (isRegister) {
        const result = await registerWithEmail(email, password);
        onLogin(result.user);
      } else {
        const result = await loginWithEmail(email, password);
        onLogin(result.user);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo inválido');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está en uso');
      } else if (err.code === 'auth/invalid-email') {
        setError('Correo inválido');
      } else {
        setError('Error al iniciar sesión: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Correo enviado</h2>
          <p className="text-gray-500 mb-4">
            Hemos enviado un enlace de acceso a <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-400">
            Revisa tu bandeja de entrada y haz clic en el enlace para iniciar sesión.
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm">
        <h1 className="text-2xl font-light text-gray-900 text-center mb-2">
          {usePasswordless ? 'Iniciar sesión' : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {usePasswordless ? 'Recibe un enlace en tu correo' : (isRegister ? 'Regístrate con tu correo' : 'Usa tu cuenta para continuar')}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              required
            />
            
            {!usePasswordless && (
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                required={!usePasswordless}
                minLength={6}
              />
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando...' : (usePasswordless ? 'Enviar enlace' : (isRegister ? 'Registrarse' : 'Iniciar sesión'))}
            </button>
          </form>

        {!isRegister && (
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                setUsePasswordless(!usePasswordless);
                setError('');
              }}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {usePasswordless ? 'Usar contraseña' : '¿Sin contraseña?'}
            </button>
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400">o</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          Continuar con Google
        </button>

        {!usePasswordless && (
          <p className="mt-6 text-center text-sm text-gray-500">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-gray-900 hover:underline font-medium"
            >
              {isRegister ? 'Iniciar sesión' : 'Regístrate'}
            </button>
          </p>
        )}
        </div>
      </div>
  );
}

export default LoginPage;
