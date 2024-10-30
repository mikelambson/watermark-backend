// routes/auth/authRoutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../../middleware/simpleCrypto.js';
import { hashPassword, verifyPassword } from '../../middleware/passwordHashing.js';
import { SetCookies, ClearCookies }  from '../../middleware/cookies.js';


const profile = express.Router();
const prisma = new PrismaClient();

profile.get('/',  async (req, res) => {
    const sessionId = req.cookies.sessionId;
    const loginField = req.cookies.loginField;
    let decryptedLoginField;
    let login;
        
    // Check if sessionId is undefined or empty
    if (!sessionId || sessionId.trim() === "") {
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    } 
    if (!loginField || loginField === undefined) {
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    }
    const [iv, encryptedData] = loginField.split(':');
    // Decrypt the login field
    try{
    decryptedLoginField = decrypt(encryptedData, iv);
    } catch {
        console.log("Tampered Cookie")
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    }

    login = decryptedLoginField;
   
    const session = await prisma.activeSessions.findUnique({
        where: { id: sessionId },
        include: { user: true } // Include user to access user details
    });
        
    if (session.user.login !== login) {
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    }
   

    const user = await prisma.Users.findUnique({ 
        where: { login },
        select: {
            id: true,
            login: true,
            // password: false,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            title: true,
            tcid_staff: true,
            protected: true,
            active: true,
            temppass: false, // Exclude temp password if not needed
            roleId: {
              include: {
                role: {
                  include: {
                    RolePermissions: true,
                  },
                },
              },
            },
            callout: true,
            TwoFactorAuth: true,
            LdapAuth: true,
            ActiveSessions: true,
            PasswordResets: true,
            AuthAuditLogs: true,
            UserMeta: true,
          },
    });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user)
        
});

profile.put('/updatepassword', async (req, res) => {
    const { oldpassword, newpassword} = req.body;
    const sessionId = req.cookies.sessionId;
    const loginField = req.cookies.loginField;
    
    let decryptedLoginField;
    let login;
        
    // Check if sessionId is undefined or empty
    if (!sessionId || sessionId.trim() === "") {
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    } 
    if (!loginField || loginField === undefined) {
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    }
    if (!oldpassword || !newpassword) {
        return res.status(401).render('forbidden', { message: 'UNAUTHORIZED' });
    }

    const [iv, encryptedData] = loginField.split(':');
    const hashnewpass = await hashPassword(newpassword)

    
    // Decrypt the login field
    try{
    decryptedLoginField = decrypt(encryptedData, iv);
    } catch {
        console.log("Tampered Cookie")
        return res.status(403).render('forbidden', { message: 'FORBIDDEN' });
    }

    login = decryptedLoginField;
   
    const session = await prisma.activeSessions.findUnique({
        where: { id: sessionId },
        include: { user: true } // Include user to access user details
    });
        
    if (session.user.login !== login) {
        return res.status(401).render('forbidden', { message: 'FORBIDDEN' });
    }

    const userId = session.user.id

    const oldhash = await prisma.Users.findUnique({
        where: { id: userId},
        select: {
            password: true,
        }
    })
    
    try {
        if (await verifyPassword(oldhash.password, oldpassword)) {
            const updatedUser = await prisma.Users.update({
                where: { id: userId },
                data: { password: hashnewpass },
            });
            res.status(200).json(updatedUser);
            
        } else {
            res.status(401).json({message: "Your old password is incorrect."})
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        console.log(hashnewpass)
    }
})

export default profile;
