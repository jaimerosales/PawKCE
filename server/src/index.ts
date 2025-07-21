import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import open from 'open';
import cors from 'cors';

dotenv.config();

// console.log("ENV Loaded:", {
//   domain: process.env.AUTH0_DOMAIN,
//   clientId: process.env.AUTH0_CLIENT_ID,
//   redirectUri: process.env.AUTH0_REDIRECT_URI
// });

const app = express();
const port = 3001;

let codeVerifier: string;
let accessToken: string | null = null;

const generatePKCE = () => {
  codeVerifier = crypto.randomBytes(64).toString('hex');
  const base64Digest = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return base64Digest;
};

// Allow frontend on port 3000 to access backend on 3001
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get('/login', async (_req, res) => {
  const codeChallenge = generatePKCE();
  const authUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.AUTH0_CLIENT_ID}&` +
    `redirect_uri=${process.env.AUTH0_REDIRECT_URI!}&` +
    `scope=openid profile email&` +
    `code_challenge=${codeChallenge}&` +
    `code_challenge_method=S256`;

  await open(authUrl); // opens the browser
  res.send('Redirecting to Auth0 login...');
});

app.get('/callback', async (req, res) => {
  const code = req.query.code as string;

  try {
    const tokenRes = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      code_verifier: codeVerifier,
      code,
      redirect_uri: process.env.AUTH0_REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    accessToken = tokenRes.data.access_token;
    res.redirect('http://localhost:3000?auth=success');
  } catch (err) {
    console.error(err);
    res.status(500).send('Token exchange failed.');
  }
});

app.get('/profile', async (_req, res) => {
  if (!accessToken) {
    return res.status(401).send('Not logged in');
  }

  try {
    const profileRes = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(profileRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch profile');
  }
});

app.get('/logout', (_req, res) => {
  // Clear any in-memory session or access token
  accessToken = null;

  // Redirect to frontend after logout
  res.redirect('http://localhost:3000');
});

app.listen(port, () => {
  console.log(`🟠 Auth0 PKCE demo server running on http://localhost:${port}`);
  console.log(`➡️  Start login flow at: http://localhost:${port}/login`);
});
