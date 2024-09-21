const express = require('express')
const mongoose = require('mongoose')
const app = express();

app.use(express.json());


const WebHookSchema = new mongoose.Schema({
    request_id: { type: String },
    author: { type: String },
    action: { type: String },
    from_branch: { type: String },
    to_branch: { type: String },
    timestamp: { type: String }
});

mongoose.connect("mongodb+srv://ashi:123ban@cluster0.o7ipcjf.mongodb.net/webhookData").then(() => {
    console.log("Data Will Fetch")
}).catch((e) => {
    console.log(e)
})

const Webhook = mongoose.model('Webhook', WebHookSchema);

app.post('/webhook', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;
    var webhookData;
    console.log(event," Event is here also payload ",payload)
    switch (event) {
        case "push":
            const ref = payload.ref;
            webhookData = {
                request_id: null,
                author: payload.pusher.name,
                action: event,
                from_branch: ref.replace('refs/heads/', ''),
                to_branch: payload.repository.default_branch,
                timestamp: new Date().toISOString()
            }
            break;

        case 'pull_request':
            if (payload.action === 'closed' && payload.pull_request.merged) {
                webhookData = {
                    request_id: payload.pull_request.id,
                    author: payload.pull_request.user.login,
                    action: 'merged',
                    from_branch: payload.pull_request.head.ref,
                    to_branch: payload.pull_request.base.ref,
                    timestamp: new Date().toISOString(),
                };
            } else {
                // Handle other pull request actions (opened, synchronized, etc.)
                webhookData = {
                    request_id: payload.pull_request.id,
                    author: payload.pull_request.user.login,
                    action: payload.action, // e.g., 'opened', 'synchronize'
                    from_branch: payload.pull_request.head.ref,
                    to_branch: payload.pull_request.base.ref,
                    timestamp: new Date().toISOString(),
                };
            }
            break;
        case 'delete':
            webhookData = {
                request_id: null,
                author: payload.sender.login,
                action: event,
                from_branch: payload.ref.replace('refs/heads/', ''), // Deleted branch name
                to_branch: null,
                timestamp: new Date().toISOString(),
            };
            break;

        // Note: GitHub does not have a specific merge event; merging typically happens via pull requests.
        default:
            console.log(`Unhandled event type: ${event}`);
            return res.status(400).send('Event type not supported');
    }
    // Save the webhook data to MongoDB
    const gotwebhookData = new Webhook(webhookData);
    await gotwebhookData.save();

    console.log(`Received ${event} event.`);
    res.status(200).send('Event received');
});
const port = 8000 || process.env.PORT
app.listen(port, () => {
    console.log("Connection Successfull")
})
