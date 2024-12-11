export async function generateCookie(response, user) {
  const token = await user.generateJWTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_AUTH_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "Lax",
  };

  return response.cookie("authToken", token, options);
}

import { BlacklistedToken } from "../models/blackListedTokens.js";

export const isTokenRevoked = async (token) => {
  const blacklistedToken = await BlacklistedToken.findOne({ token });
  return blacklistedToken !== null;
};

// Middleware to add token to blacklist
export const blacklistToken = async (token) => {
  const blacklistedToken = new BlacklistedToken({ token });
  await blacklistedToken.save();
};
