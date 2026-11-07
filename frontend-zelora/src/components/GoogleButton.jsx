import { useEffect, useRef, useState } from 'react';
import { GOOGLE_CLIENT_ID } from '../context/AuthContext';

export default function GoogleButton({
  onSuccess,
  onError,
  text = 'signin_with',
  label = 'Continue with Google'
}) {
  const buttonRef = useRef(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    let checkInterval = null;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              if (response.credential) {
                onSuccess({ credential: response.credential });
              } else {
                onError?.(new Error('No credential received from Google.'));
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear container before rendering
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: text, // 'signin_with' or 'signup_with'
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 380,
          });

          setGisLoaded(true);
        } catch (err) {
          console.warn('Google Identity Services initialization warning:', err);
          setInitError(err.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      // Poll briefly for the async script to load
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initializeGoogle();
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [text, onSuccess, onError]);

  // Fallback click handler if user clicks the wrapper
  const handleFallbackClick = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        onError?.(err);
      }
    } else {
      onError?.(new Error('Google Identity Services is still loading. Please check your internet connection.'));
    }
  };

  return (
    <div className="google-auth-wrapper">
      <div
        ref={buttonRef}
        id="google-signin-btn-container"
        className="google-btn-container"
      />
      {!gisLoaded && (
        <button
          type="button"
          onClick={handleFallbackClick}
          className="btn-google-custom"
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{label}</span>
        </button>
      )}
    </div>
  );
}

