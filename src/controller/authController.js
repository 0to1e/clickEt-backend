import User from "../models/userModel.js";
import { generateCookie } from "../utils/cookieUtil.js";

export async function initRegistration(request, response) {
  const { full_name, user_name, phone_number, email, password } =
    request.body;

  try {
    
    const user = await User.create({
      full_name,
      user_name,
      phone_number,
      email,
      password,
    });

    user.password = undefined;
    
    await generateCookie(response, user);
    
    return response
      .status(201)
      .json({ message: "User created successfully", user: user });
  } 
  
  
  
  
  catch (error) {
    console.error(`Registration Error:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function initAuthentication(requestuest, response) {
  const { user_name, password } = requestuest.body;

  try {
    const user = await User.findOne({
      $or: [{ user_name }, { email: user_name }],
    });

    if (user) {
      const authResult = await user.comparePassword(password);
      if (authResult) {
        user.password = undefined;
        const cookie = await generateCookie(response, user);
        return response.status(200).json({ message: "Login Successful" });
      }
      return response.status(401).json({ message: "Invalid Password" });
    }
    return response
      .status(404)
      .json({ message: "Invalid Account credentials" });
  } catch (error) {
    console.error(`Authentication Error: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function checkExistingAuthCredentials(request, response) {
  const { user_name, email } = request.body;

  try {
    const existingUsers = await User.find({
      $or: [{ user_name }, { email: user_name }],
    });

    const credentialConflicts = {
      user_name: false,
      email: false,
    };

    if (existingUsers.length > 0) {
      existingUsers.forEach((user) => {
        if (user.email === email) {
          credentialConflicts.email = true;
        }
        if (user.user_name === user_name) {
          credentialConflicts.user_name = true;
        }
      });

      return response.status(409).json({
        message: "Credentials already in use",
        usedCredentials: credentialConflicts,
      });
    }
  } catch (error) {
    console.error(`Credentials Validation Error: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function listAllUsers(request, response) {
  try {
    const users = await User.find({});
    return response.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}
