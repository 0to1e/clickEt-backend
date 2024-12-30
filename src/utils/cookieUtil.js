// src/utils/cookieUtil.js
export const setTokenCookie = (response, cookie_name, tokenValue) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: process.env.JWT_REFRESH_EXPIRY * 24 * 60 * 60 * 1000,
    path: "/",
  };

  response.cookie(cookie_name, tokenValue, cookieOptions);
};

import { BlacklistedToken } from "../models/blackListedTokens.js";

// export const isTokenRevoked = async (token) => {
//   const blacklistedToken = await BlacklistedToken.findOne({ token });
//   return blacklistedToken !== null;
// };

// // Middleware to add token to blacklist
// export const blacklistToken = async (token) => {
//   const blacklistedToken = new BlacklistedToken({ token });
//   await blacklistedToken.save();
// };
