import { useEffect, useState, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../context/AuthContext';

export default function GoogleButton({
  onSuccess,
  onError,
  text = 'signin_with',
  label = 'Continue with Google',
  disabled = false,
}) {
  const [gisLoaded, setGisLoaded] = useState(Boolean(window.google?.accounts));
  const [loading, setLoading] = useState(false);
  const tokenClientRef = useRef(null);

  useEffect(() => {
    let checkInterval = null;
    let attempts = 0;

    const setupGoogle = () => {
      if (window.google?.accounts) {
        setGisLoaded(true);

        // 1. Setup OAuth 2.0 Token Client (Popup flow - works in 100% of modern browsers)
        try {
          if (window.google.accounts.oauth2) {
            tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: 'email profile openid',
              callback: async (tokenResponse) => {
                setLoading(false);
                if (tokenResponse.error) {
                  console.error('Google OAuth error:', tokenResponse);
                  onError?.(new Error(tokenResponse.error_description || tokenResponse.error || 'Google sign-in was canceled or failed.'));
                  return;
                }
                if (tokenResponse.access_token) {
                  try {
                    await onSuccess({ access_token: tokenResponse.access_token });
                  } catch (err) {
                    onError?.(err);
                  }
                } else {
                  onError?.(new Error('No access token received from Google.'));
                }
              },
            });
          }
        } catch (e) {
          console.warn('Google oauth2 initTokenClient warning:', e);
        }

        // 2. Setup ID Token Client (One-Tap / Credential callback)
        try {
          if (window.google.accounts.id) {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: async (response) => {
                setLoading(false);
                if (response.credential) {
                  try {
                    await onSuccess({ credential: response.credential });
                  } catch (err) {
                    onError?.(err);
                  }
                } else {
                  onError?.(new Error('No credential received from Google.'));
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
          }
        } catch (e) {
          console.warn('Google accounts.id initialize warning:', e);
        }
      }
    };

    if (window.google?.accounts) {
      setupGoogle();
    } else {
      checkInterval = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts) {
          clearInterval(checkInterval);
          setupGoogle();
        } else if (attempts > 30) {
          // 6 seconds elapsed
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [onSuccess, onError]);

  const handleClick = (e) => {
    e.preventDefault();
    if (disabled || loading) return;

    if (!window.google?.accounts) {
      onError?.(
        new Error(
          'Google Identity Services is currently blocked or loading. Please disable any ad-blockers for accounts.google.com or use Email sign in.'
        )
      );
      return;
    }

    setLoading(true);

    // Primary: Google OAuth2 Token Client (opens popup with account selector)
    if (tokenClientRef.current) {
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Token client requestAccessToken failed, trying fallback prompt:', err);
      }
    }

    // Secondary fallback: Google One Tap prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
            console.log('Google prompt not displayed:', notification.getNotDisplayedReason());
          }
        });
        return;
      } catch (err) {
        setLoading(false);
        onError?.(err);
        return;
      }
    }

    setLoading(false);
    onError?.(new Error('Google authentication service is unavailable.'));
  };

  return (
    <div className="google-auth-wrapper">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="btn-google-custom"
        aria-label={label}
        style={{
          opacity: disabled || loading ? 0.75 : 1,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
        }}
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
        <span>{loading ? 'Connecting to Google...' : label}</span>
      </button>
    </div>
  );
}
