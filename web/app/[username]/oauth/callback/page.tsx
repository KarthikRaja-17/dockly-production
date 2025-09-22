// 'use client';
// import { useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { useRouter, useSearchParams } from 'next/navigation';
// import DocklyLoader from '../../../../utils/docklyLoader';

// const OAuthCallback = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const token = searchParams ? searchParams.get('token') : null;
//     const username = localStorage.getItem('username');

//     if (token) {
//       try {
//         const user = jwtDecode(token);
//         localStorage.setItem('accessToken', token);
//         localStorage.setItem('user', JSON.stringify(user));
//         router.replace(`/${username}/planner`);
//       } catch (error) {
//         router.replace('/login');
//       }
//     } else {
//       router.replace('/login');
//     }
//   }, [router, searchParams]);

//   return;
// };

// export default OAuthCallback;

'use client';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Card, Typography } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import DocklyLoader from '../../../../utils/docklyLoader';

const { Title, Text } = Typography;

const OAuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams ? searchParams.get('token') : null;
    const error = searchParams ? searchParams.get('error') : null;
    const source = searchParams ? searchParams.get('source') : null; // NEW: Check for source parameter
    const username = localStorage.getItem('username');

    if (error) {
      // Handle OAuth errors
      console.error('OAuth error:', error);
      const description = searchParams?.get('description') || 'Authentication failed';

      // Show error and redirect after delay
      setTimeout(() => {
        router.replace('/auth/connect?error=' + encodeURIComponent(description));
      }, 3000);
      return;
    }

    if (token) {
      try {
        const user = jwtDecode(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // NEW: Redirect based on OAuth source
        if (username) {
          if (source === 'fitbit') {
            // Redirect to health dashboard for Fitbit connections
            router.replace(`/${username}/health-hub`);
          } else {
            // Default redirect for other OAuth sources (Google, Microsoft, etc.)
            router.replace(`/${username}/planner`);
          }
        } else {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Token decode error:', error);
        router.replace('/login?error=invalid_token');
      }
    } else {
      console.error('No token received');
      router.replace('/login?error=no_token');
    }
  }, [router, searchParams]);

  const error = searchParams?.get('error');
  const description = searchParams?.get('description');
  const source = searchParams?.get('source');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      padding: '24px'
    }}>
      <Card style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none'
      }}>
        {error ? (
          <>
            <XCircle size={48} color="#ff4d4f" style={{ marginBottom: '16px' }} />
            <Title level={3} style={{ color: '#ff4d4f', marginBottom: '8px' }}>
              Authentication Failed
            </Title>
            <Text type="secondary">
              {description || 'An error occurred during authentication'}
            </Text>
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Redirecting you back...
              </Text>
            </div>
          </>
        ) : (
          <>
            <DocklyLoader />
            <Title level={3} style={{ marginBottom: '8px' }}>
              {source === 'fitbit' ? 'Fitbit Connected Successfully!' : 'Completing Authentication'}
            </Title>
            <Text type="secondary">
              {source === 'fitbit'
                ? 'Redirecting to your health dashboard...'
                : 'Please wait while we set up your account...'}
            </Text>
          </>
        )}
      </Card>
    </div>
  );
};

export default OAuthCallback;