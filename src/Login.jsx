import { signInWithGoogle } from "./firebase";

function Login({ onLogin }) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      onLogin(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome</h1>
        <p style={styles.subtitle}>Sign in to continue</p>
        <button onClick={handleGoogleLogin} style={styles.button}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            style={styles.icon} 
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '320px',
  },
  title: {
    margin: '0 0 8px 0',
    color: '#333',
    fontSize: '24px',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#666',
    fontSize: '14px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    transition: 'background-color 0.2s',
  },
  icon: {
    width: '20px',
    height: '20px',
  },
};

export default Login;
