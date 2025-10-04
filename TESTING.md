# 🧪 Excalidraw Server Testing Guide

## Server Status
Your Excalidraw collaboration server is running on **http://localhost:3002**

---

## Testing Methods

### 1. ✅ Quick HTTP Health Check

Test if the server is running:

```bash
curl http://localhost:3002/
```

**Expected Response:**
```
Excalidraw collaboration server is up :)
```

---

### 2. 🤖 Automated Node.js Test (RECOMMENDED)

Run the automated test script that simulates two clients collaborating:

```bash
node test-server.js
```

**What it tests:**
- ✅ Socket.IO connection
- ✅ Room joining
- ✅ Multi-user collaboration
- ✅ Broadcasting messages between clients
- ✅ User presence detection

**Expected Output:**
```
✅ Client 1 connected!
✅ Client 2 connected!
🚪 Clients joining room
👥 Room users changed - 2 user(s)
📤 Client 2: Sending test broadcast...
📡 Client 1: Received broadcast
```

---

### 3. 🌐 Interactive Web Test Client

Open the HTML test client in your browser:

```bash
# Serve the test client
python3 -m http.server 8000 -d /tmp &
```

Then open in your browser:
**http://localhost:8000/test-client.html**

**Features:**
- 🔌 Connect/Disconnect from server
- 🚪 Join/leave rooms
- 📡 Send broadcasts
- 👥 Test user following
- 📝 Real-time event log

**Multi-Client Testing:**
1. Open the test client in **multiple browser tabs**
2. Use the **same room ID** in all tabs
3. Send messages and see them received in other tabs

---

### 4. 🎨 Test with Real Excalidraw

1. **Go to:** https://excalidraw.com/
2. **Click:** Share button (top right)
3. **Enable:** Live collaboration
4. **Configure:** Point to your server at `http://localhost:3002`
   - Open browser console
   - Set custom portal: `localStorage.setItem('excalidraw-portal', 'http://localhost:3002')`
   - Refresh the page
5. **Test:** Share the link with another browser/device

---

### 5. 📊 Monitor Server Logs

Watch real-time server activity:

```bash
tail -f /tmp/app.log
```

Enable debug logs for more details:

```bash
# Stop current server
pkill -f ts-node-dev

# Start with debug enabled
DEBUG=* yarn start:dev
```

**Debug Namespaces:**
- `server` - Server startup events
- `io` - Socket.IO connection events
- `socket` - Individual socket events

---

### 6. 🧪 Manual Socket.IO Testing with curl

Test WebSocket upgrade (limited, but useful for basic connectivity):

```bash
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     http://localhost:3002/socket.io/?EIO=4&transport=websocket
```

---

## 🔍 What Each Feature Does

### Room Management
- **join-room**: Users join a collaboration room
- **first-in-room**: Fired when you're the first user in a room
- **new-user**: Notifies when another user joins
- **room-user-change**: Updates list of all users in room

### Broadcasting
- **server-broadcast**: Send persistent updates to all room members
- **server-volatile-broadcast**: Send non-critical updates (can be dropped)
- **client-broadcast**: Receive updates from other users

### User Following
- **user-follow**: Follow another user's cursor/actions
- **user-follow-room-change**: Updates list of followers
- **broadcast-unfollow**: Notifies when all followers leave

---

## 📋 Test Scenarios

### Scenario 1: Two-User Collaboration
1. Run `node test-server.js` ✅ **(Already tested!)**
2. Verify both clients connect
3. Verify both join the same room
4. Verify broadcast from one client reaches the other

### Scenario 2: Multi-Tab Browser Test
1. Open `/tmp/test-client.html` in browser
2. Open 3-4 tabs with the same test client
3. Connect all tabs to server
4. Join same room ID in all tabs
5. Send broadcasts from any tab
6. Verify all other tabs receive the messages

### Scenario 3: Follow Feature
1. Open 2 tabs with test client
2. Connect both and note their Socket IDs
3. In tab 1, enter tab 2's socket ID and click "Follow"
4. Verify tab 2 receives follower notification
5. Click "Unfollow" in tab 1
6. Verify tab 2 receives unfollow notification

### Scenario 4: Load Testing
```bash
# Install artillery if needed
npm install -g artillery

# Create load test config
cat > artillery-test.yml << EOF
config:
  target: "http://localhost:3002"
  socketio:
    transports: ["websocket"]
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - engine: socketio
    flow:
      - emit:
          channel: "join-room"
          data: "test-room"
      - think: 5
      - emit:
          channel: "server-broadcast"
          data: 
            roomId: "test-room"
            message: "test"
EOF

# Run load test
artillery run artillery-test.yml
```

---

## 🐛 Troubleshooting

### Server not responding?
```bash
# Check if server is running
ps aux | grep ts-node-dev

# Check server logs
tail -50 /tmp/app.log

# Restart server
pkill -f ts-node-dev
yarn start:dev
```

### Port already in use?
```bash
# Find process using port 3002
lsof -i :3002

# Kill the process
kill -9 <PID>
```

### Connection errors?
- Check CORS settings in `src/index.ts`
- Verify firewall isn't blocking port 3002
- Try both `localhost` and `127.0.0.1`

---

## 📈 Performance Monitoring

```bash
# Monitor CPU/Memory usage
top -p $(pgrep -f ts-node-dev)

# Check active connections
# (requires debug mode)
DEBUG=socket node test-server.js
```

---

## 🎯 Next Steps

1. ✅ **Basic Test Complete** - The automated test passed!
2. 🌐 Try the interactive HTML client
3. 🎨 Test with real Excalidraw app
4. 🚀 Deploy to production with PM2:
   ```bash
   yarn build
   pm2 start pm2.json
   ```

---

## 📚 Additional Resources

- **Socket.IO Docs**: https://socket.io/docs/v4/
- **Excalidraw GitHub**: https://github.com/excalidraw/excalidraw
- **Server Code**: `src/index.ts`
- **Test Client**: `/tmp/test-client.html`
- **Test Script**: `test-server.js`
