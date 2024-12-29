export const setTokenCookie = (response, cookie_name, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: process.env.JWT_REFRESH_EXPIRY,
    path: "/",
  };

  response.cookie(cookie_name, refreshToken, cookieOptions);
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
