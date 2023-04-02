
import ConversationModel from '../Models/conversationModel.js'
import MessageModel from '../Models/messageModel.js'

export const newConversation = async (req, res) => {
    const newConversation = new ConversationModel({
        members: [req.body.senderId, req.body.receiverId],
    });

    try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

export const addMessage = async (req, res) => {
    const newMessage = new MessageModel(req.body);
    const conversation = ConversationModel.findById(req.body.conversationId)
    console.log(req.body.conversationId);
    try {
        const savedMessage = await newMessage.save();
        conversation.updateOne({ $inc: { lastMsg: 1 } }).then(res => console.log(res))
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
}


export const getMessage = async (req, res) => {
    try {
        const messages = await MessageModel.find({
            conversationId: req.params.conversationId,
        });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
}



