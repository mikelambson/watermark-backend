import { PrismaClient } from '@prisma/client';
import readline from 'readline';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function updateUserPassword() {
    rl.question('Enter user login: ', async (login) => {
        const user = await prisma.Users.findUnique({
            where: { login: login }
        });

        if (!user) {
            console.log('User not found');
            rl.close();
            return;
        }

        rl.question('Enter new password: ', async (newPassword) => {
            const hashedPassword = await argon2.hash(newPassword);

            await prisma.Users.update({
                where: { login: login },
                data: { password: hashedPassword }
            });

            console.log('Password updated successfully');
            rl.close();
        });
    });
}

updateUserPassword().catch((e) => {
    console.error(e);
    prisma.$disconnect();
});