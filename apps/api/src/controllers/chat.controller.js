"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChat = exports.getMessages = exports.getChats = void 0;
const database_1 = require("database");
// Helper to get user ID from the request object (attached by auth middleware)
const getUserId = (req) => req.user?.userId;
const getChats = async (req, res) => {
    try {
        const userId = getUserId(req);
        // Find all chats where this user is a participant
        const chats = await database_1.prisma.chat.findMany({
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
    }
    catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChats = getChats;
const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        // Verify user is part of the chat
        const chat = await database_1.prisma.chat.findFirst({
            where: {
                id: id,
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
        const messages = await database_1.prisma.message.findMany({
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
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMessages = getMessages;
const createChat = async (req, res) => {
    try {
        const { name, isGroup, userIds } = req.body;
        const currentUserId = getUserId(req);
        // Ensure current user is in the list of users
        const participants = new Set(userIds);
        participants.add(currentUserId);
        const participantIds = Array.from(participants);
        // If it's a 1-on-1 chat, check if one already exists
        if (!isGroup && participantIds.length === 2) {
            const existingChat = await database_1.prisma.chat.findFirst({
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
        const newChat = await database_1.prisma.chat.create({
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
    }
    catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createChat = createChat;
//# sourceMappingURL=chat.controller.js.map