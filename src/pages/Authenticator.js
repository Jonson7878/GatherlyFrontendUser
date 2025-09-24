import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Stack, TextField, Button, IconButton, Tooltip, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useLocation, useNavigate } from 'react-router-dom';
import CommonSidebar from '../components/CommonSidebar';
import { useUser } from '../components/UserContext';
import { setupTwoFactorApi, verifyTwoFactorApi, validateTwoFactorApi } from '../api/userApi';
import verifyImage from '../assets/authentication.png';
import secureImage from '../assets/secure .png';

const Authenticator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser();

  const params = useMemo(() => {
    const state = location.state || {};
    return {
      mode: state.mode || 'setup',
      pendingUserId: state.userId || null,
      email: state.email || user?.email || '',
      password: state.password || '',
    };
  }, [location.state, user]);

  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);  // eslint-disable-next-line
  const [message, setMessage] = useState('');
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.mode === 'setup') {
      setupTwoFactorApi()
        .then((res) => {
          setQrCode(res.qrCode);
          setSecret(res.secret);
          if (res.otpauthUrl) setOtpauthUrl(res.otpauthUrl);
        })
        .catch((err) => {
          setMessage(err?.response?.data?.message || 'Failed to initiate 2FA setup');
        });
    }
  }, [params.mode]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value;
    setCodeDigits(next);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const code = useMemo(() => codeDigits.join(''), [codeDigits]);

  const handleCopySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      setMessage('Failed to copy secret');
    }
  };

  const handlePasteOtp = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;
    e.preventDefault();
    const next = [...codeDigits];
    for (let i = 0; i < Math.min(6, digits.length); i += 1) {
      next[i] = digits[i];
    }
    setCodeDigits(next);
    const lastIndex = Math.min(digits.length, 6) - 1;
    if (lastIndex >= 0) inputsRef.current[lastIndex]?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setAlert({ message: 'Enter 6-digit code', severity: 'error' });
      return;
    }
    setSubmitting(true);
    setMessage('');
    setAlert({ message: '', severity: '' });

    try {
      if (params.mode === 'setup') {
        await verifyTwoFactorApi(code);
        setAlert({ message: 'Two-factor enabled successfully!', severity: 'success' });
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else if (params.mode === 'validate') {
        const res = await validateTwoFactorApi({ userId: params.pendingUserId, token: code });
        if (res?.token && res?.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          setUser(res.user);
          setAlert({ message: 'Authentication successful!', severity: 'success' });
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          setAlert({ message: 'Unexpected response from server', severity: 'error' });
        }
      }
    } catch (err) {
      setAlert({ message: err?.response?.data?.message || 'Invalid code. Try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <CommonSidebar imageSrc={verifyImage} title="Two-Factor Authentication" subtitle="Protect your account with an extra step." />

      <div className="form-container">
        {params.mode !== 'setup' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Box component="img" src={secureImage} alt="Secure" sx={{ width: 200, height: 200 }} />
          </Box>
        )}
        <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 800, mb: 1 }}>
          {params.mode === 'setup' ? 'Set up Authenticator' : 'Enter authentication code'}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '.015em',
            color: params.mode === 'setup' ? '#0f172a' : 'text.secondary',
            mb: 5,
          }}
        >
          {params.mode === 'setup' ? 'Scan the QR and enter a 6-digit code from your app.' : 'Enter the 6-digit code from your authenticator app.'}
        </Typography>
        {params.mode === 'setup' && (
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
            Works with Google Authenticator, Microsoft Authenticator, or Authy.
          </Typography>
        )}

        {params.mode === 'setup' && (
          <>
            {qrCode && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Card elevation={6} sx={{ borderRadius: 3, p: 1.5, background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fb 100%)' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box component="img" src={qrCode} alt="Authenticator QR" sx={{ width: 200, height: 200, borderRadius: 2 }} />
                  </CardContent>
                </Card>
              </Box>
            )}
            {otpauthUrl && (
              <Stack spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  If your camera doesn’t detect a link, use this URL:
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', userSelect: 'all' }}
                  >
                    {otpauthUrl}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy URL'} placement="top">
                    <IconButton
                      size="small"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(otpauthUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1200);
                        } catch {}
                      }}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            )}
            {secret && (
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: '0.875rem',
                    letterSpacing: '.08em',
                    color: '#5e35b1',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                  }}
                >
                  Secret:
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontWeight: 800,
                    
                    backgroundColor: 'rgba(94, 53, 177, 0.08)',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                  }}
                >
                  {secret}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                  <IconButton color="success" onClick={handleCopySecret} size="small" aria-label="Copy secret">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </>
        )}

        <Box component="form" onSubmit={onSubmit} onPaste={handlePasteOtp}>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: params.mode === 'validate' ? 3 : 2, mb: 2 }}>
            {codeDigits.map((digit, idx) => (
              <TextField
                key={idx}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                inputRef={(el) => (inputsRef.current[idx] = el)}
                inputProps={{ maxLength: 1, inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center', fontWeight: 700 } }}
                size="small"
                sx={{
                  width: 44,
                  '& .MuiInputBase-input': {
                    backgroundColor: 'rgba(94, 53, 177, 0.08)',
                    borderRadius: 1,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(94, 53, 177, 0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5e35b1',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5e35b1',
                  },
                }}
              />
            ))}
          </Stack>

          {alert.message && (
            <Alert severity={alert.severity || 'info'} sx={{ mb: 2, fontWeight: 700 }}>
              {alert.message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              backgroundColor: '#00796b',
              '&:hover': { backgroundColor: '#00695c' },
              width: 'calc(44px * 6 + 8px * 5)',
              alignSelf: 'center'
            }}
          >
            {submitting ? 'Submitting...' : params.mode === 'setup' ? 'Verify & Enable' : 'Verify Code'}
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Authenticator;
