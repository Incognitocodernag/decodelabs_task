import { Request, Response } from 'express';
import { prisma } from 'database';

// Helper to get user ID from the request object (attached by auth middleware)
const getUserId = (req: Request) => (req as any).user?.userId;

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    
    // Find all chats where this user is a participant
    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId
          }
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only fetch the latest message for preview
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    // Verify user is part of the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        users: {
          some: {
            id: userId
          }
        }
      }
    });

    if (!chat) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: id
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Oldest first for chat history
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, isGroup, userIds } = req.body;
    const currentUserId = getUserId(req);

    // Ensure current user is in the list of users
    const participants = new Set(userIds);
    participants.add(currentUserId);
    const participantIds = Array.from(participants) as string[];

    // If it's a 1-on-1 chat, check if one already exists
    if (!isGroup && participantIds.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            { users: { some: { id: participantIds[0] } } },
            { users: { some: { id: participantIds[1] } } }
          ]
        },
        include: {
          users: true
        }
      });

      if (existingChat) {
        res.status(200).json(existingChat);
        return;
      }
    }

    const newChat = await prisma.chat.create({
      data: {
        name: isGroup ? name : null,
        isGroup: isGroup || false,
        users: {
          connect: participantIds.map((id) => ({ id }))
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
