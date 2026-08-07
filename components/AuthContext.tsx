

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { ALL_USERS_DATA_BASE, INITIAL_CREATOR_MONETIZATION } from '../data';

// --- CONFIGURATION ---
// To enable REAL Google Login:
// 1. Go to Google Cloud Console -> APIs & Services -> Credentials.
// 2. Create an OAuth 2.0 Client ID (Web Application).
// 3. Add your domain (e.g., http://localhost:5173) to "Authorized JavaScript origins".
// 4. Paste the Client ID below or set REACT_APP_GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID in your environment.
const REAL_GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || ""; 

interface AuthContextType {
  user: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('firesocial_active_session');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem('firesocial_active_session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper to get all users (Seed Data + Local Signups)
  const getAllUsers = (): any[] => {
    const localUsersStr = localStorage.getItem('firesocial_users_db');
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
    // Map seed data to a format with a default password for demo purposes
    const seedUsers = ALL_USERS_DATA_BASE.map(p => ({
        email: p.email.toLowerCase(),
        password: 'password', // Default password for seed users
        profile: p
    }));
    return [...seedUsers, ...localUsers];
  };

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = getAllUsers();
        const foundUser = users.find(u => u.email === email.toLowerCase());

        if (foundUser) {
          if (foundUser.password === password) {
            setUser(foundUser.profile);
            localStorage.setItem('firesocial_active_session', JSON.stringify(foundUser.profile));
            resolve();
          } else {
            reject(new Error('Incorrect password'));
          }
        } else {
          reject(new Error('No account found with this email'));
        }
      }, 800); // Simulate network delay
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = getAllUsers();
        if (users.some(u => u.email === email.toLowerCase())) {
          reject(new Error('Email is already registered'));
          return;
        }

        const newProfile: Profile = {
          id: Date.now(),
          name: name,
          username: `@${name.replace(/\s+/g, '').toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
          email: email,
          bio: 'New to FireSocial! 🔥',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          followers: 0,
          following: 0,
          posts: 0,
          badges: ['🆕'],
          streak: 0,
          online: true,
          verified: false,
          privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
          notificationSettings: { push: true, email: true },
          messagingSettings: { allowDirectMessages: 'everyone', readReceipts: true },
          contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'blur' },
          language: 'en-US',
          twoFactorEnabled: false,
          mutedAccounts: [],
          restrictedAccounts: [],
          blockedAccounts: [],
          unlockedAchievements: ['first_post'],
          isCreator: true,
          creatorMonetization: { 
              ...JSON.parse(JSON.stringify(INITIAL_CREATOR_MONETIZATION)), 
              balance: 0, 
              analytics: { ...INITIAL_CREATOR_MONETIZATION.analytics, totalEarnings: 0, monthlyEarnings: [] } 
          },
          emberBalance: 1000,
          sparks: 0
        };

        // Save to local "database"
        const localUsersStr = localStorage.getItem('firesocial_users_db');
        const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
        localUsers.push({ email: email.toLowerCase(), password, profile: newProfile });
        localStorage.setItem('firesocial_users_db', JSON.stringify(localUsers));

        // Set active session
        setUser(newProfile);
        localStorage.setItem('firesocial_active_session', JSON.stringify(newProfile));
        resolve();
      }, 1200);
    });
  };

  const loginWithGoogle = async () => {
      // Check if Real Client ID is configured and Google Script is loaded
      if (REAL_GOOGLE_CLIENT_ID && (window as any).google) {
          return new Promise<void>((resolve, reject) => {
              try {
                  const client = (window as any).google.accounts.oauth2.initTokenClient({
                      client_id: REAL_GOOGLE_CLIENT_ID,
                      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                      callback: async (tokenResponse: any) => {
                          if (tokenResponse.access_token) {
                              try {
                                  // Fetch User Info from Google
                                  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                                  });
                                  const userInfo = await userInfoResponse.json();
                                  
                                  // Create Profile from Google Data
                                  const googleUser: Profile = {
                                      id: Date.now(), // Or use a hash of userInfo.sub
                                      name: userInfo.name,
                                      username: `@${userInfo.given_name.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
                                      email: userInfo.email,
                                      bio: 'Signed in via Google',
                                      avatar: userInfo.picture,
                                      followers: 0,
                                      following: 0,
                                      posts: 0,
                                      badges: ['🔥'],
                                      streak: 0,
                                      online: true,
                                      verified: true,
                                      privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
                                      notificationSettings: { push: true, email: true },
                                      messagingSettings: { allowDirectMessages: 'everyone', readReceipts: true },
                                      contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'blur' },
                                      language: 'en-US',
                                      twoFactorEnabled: false,
                                      mutedAccounts: [],
                                      restrictedAccounts: [],
                                      blockedAccounts: [],
                                      unlockedAchievements: [],
                                      isCreator: true,
                                      creatorMonetization: { 
                                          ...JSON.parse(JSON.stringify(INITIAL_CREATOR_MONETIZATION)), 
                                          balance: 0, 
                                          analytics: { ...INITIAL_CREATOR_MONETIZATION.analytics, totalEarnings: 0, monthlyEarnings: [] } 
                                      },
                                      emberBalance: 1000,
                                      sparks: 0
                                  };

                                  setUser(googleUser);
                                  localStorage.setItem('firesocial_active_session', JSON.stringify(googleUser));
                                  resolve();
                              } catch (error) {
                                  console.error("Error fetching Google user info:", error);
                                  reject(error);
                              }
                          } else {
                              reject(new Error("No access token received"));
                          }
                      },
                      error_callback: (error: any) => {
                          console.error("Google Auth Error:", error);
                          reject(error);
                      }
                  });
                  
                  // Trigger the popup
                  client.requestAccessToken();
                  
              } catch (error) {
                  console.error("Failed to initialize Google Auth:", error);
                  reject(error);
              }
          });
      } else {
          // --- FALLBACK SIMULATION ---
          // Runs if no Client ID is provided or script fails to load
          console.warn("Running Google Auth Simulation. To enable Real Login, set REACT_APP_GOOGLE_CLIENT_ID or add your ID to AuthContext.tsx.");
          return new Promise<void>((resolve) => {
              setTimeout(() => {
                  const googleUser: Profile = {
                      id: 99999,
                      name: 'Google User',
                      username: '@google_fan',
                      email: 'user@gmail.com',
                      bio: 'Signed in via Google (Simulated)',
                      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                      followers: 12,
                      following: 5,
                      posts: 0,
                      badges: ['🔥'],
                      streak: 1,
                      online: true,
                      verified: true,
                      privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
                      notificationSettings: { push: true, email: true },
                      messagingSettings: { allowDirectMessages: 'everyone', readReceipts: true },
                      contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'blur' },
                      language: 'en-US',
                      twoFactorEnabled: false,
                      mutedAccounts: [],
                      restrictedAccounts: [],
                      blockedAccounts: [],
                      unlockedAchievements: [],
                      isCreator: true,
                      creatorMonetization: { 
                          ...JSON.parse(JSON.stringify(INITIAL_CREATOR_MONETIZATION)), 
                          balance: 0, 
                          analytics: { ...INITIAL_CREATOR_MONETIZATION.analytics, totalEarnings: 0, monthlyEarnings: [] } 
                      },
                      emberBalance: 1000,
                      sparks: 0
                  };
                  setUser(googleUser);
                  localStorage.setItem('firesocial_active_session', JSON.stringify(googleUser));
                  resolve();
              }, 1500);
          });
      }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('firesocial_active_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};