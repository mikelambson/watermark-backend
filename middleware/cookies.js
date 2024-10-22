
import { encrypt } from '../middleware/simpleCrypto.js';

const SetCookies = ({ res, sessionId, userLogin }) => {
const isProduction = process.env.APP_ENV === 'production';
const isStaging = process.env.APP_ENV === 'staging';

const cookieMaxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

res.cookie('sessionId', sessionId, { 
    httpOnly: true, 
    secure: true,
    sameSite: 'lax',
    domain: '.watermark.work',
    maxAge: cookieMaxAge
  });

   // Encrypt the login field
   const { iv, encryptedData } = encrypt(userLogin);

  // Set login cookie
  res.cookie('loginField', `${iv}:${encryptedData}`, {  
    httpOnly: true, 
    secure: true, 
    sameSite: 'lax', // Optional, for CSRF protection
    domain: '.watermark.work',
    maxAge: cookieMaxAge
  });
}

const ClearCookies = ( res ) => {
    res.clearCookie('sessionId', {
        sameSite: 'lax', // Optional, for CSRF protection
        domain: '.watermark.work',
        httpOnly: true,
        secure: process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging',

      });

      // Clear the session cookie
      res.clearCookie('loginField', {
        sameSite: 'lax', // Optional, for CSRF protection
        domain: '.watermark.work',
        httpOnly: true,
        secure: process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging',
      });
}

export { SetCookies, ClearCookies };