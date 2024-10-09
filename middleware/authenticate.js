// middleware/authenticate.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).send("Not authenticated");
  }

  const session = await prisma.activeSession.findUnique({
    where: { sessionId },
    include: { user: true },
  });

  if (!session) {
    return res.status(401).send("Invalid session");
  }

  req.user = session.user; // Attach user info to the request
  next();
};

export { authenticate };
