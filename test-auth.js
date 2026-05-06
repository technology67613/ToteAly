const http = require('http');

async function testAuth() {
  const csrfRes = await fetch("http://127.0.0.1:3000/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  
  const rawCookies = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : [csrfRes.headers.get('set-cookie')];
  let csrfCookie = rawCookies.find(c => c.includes('csrf-token')).split(';')[0];
  let callbackCookie = rawCookies.find(c => c.includes('callback-url'))?.split(';')[0] || '';
  
  const body = new URLSearchParams();
  body.append('username', 'Nova_Cool');
  body.append('password', 'Git@Hub2006');
  body.append('redirect', 'false');
  body.append('csrfToken', csrfToken);
  body.append('callbackUrl', 'http://127.0.0.1:3000/admin');
  body.append('json', 'true');

  const loginRes = await fetch("http://127.0.0.1:3000/api/auth/callback/credentials", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': [csrfCookie, callbackCookie].filter(Boolean).join('; ')
    },
    body: body.toString()
  });
  
  console.log("Login Status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("Login Result:", loginData);
  
  const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')];
  console.log("Set-Cookies:", setCookies);
  
  const sessionTokenCookie = setCookies.find(c => c.includes('session-token'))?.split(';')[0];
  
  if (!sessionTokenCookie) {
    console.log("No session cookie found! Login failed?");
    return;
  }
  
  const sessionRes = await fetch("http://127.0.0.1:3000/api/auth/session", {
    headers: {
      'Cookie': sessionTokenCookie
    }
  });
  
  const sessionData = await sessionRes.json();
  console.log("Session JSON:", JSON.stringify(sessionData, null, 2));
}

testAuth();
