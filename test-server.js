#!/usr/bin/env node
/**
 * Simple Node.js test script for Excalidraw collaboration server
 * Run with: node /tmp/test-server.js
 */

const io = require('socket.io-client');

console.log('🎨 Excalidraw Server Test Script\n');
console.log('Connecting to http://localhost:3002...\n');

// Create two clients to simulate collaboration
const client1 = io('http://localhost:3002', {
    transports: ['websocket', 'polling']
});

const client2 = io('http://localhost:3002', {
    transports: ['websocket', 'polling']
});

const testRoomId = 'test-room-' + Date.now();

// Client 1 event handlers
client1.on('connect', () => {
    console.log('✅ Client 1 connected! Socket ID:', client1.id);
});

client1.on('init-room', () => {
    console.log('📨 Client 1: Received init-room event');
    // Join a test room
    setTimeout(() => {
        console.log(`🚪 Client 1: Joining room "${testRoomId}"`);
        client1.emit('join-room', testRoomId);
    }, 500);
});

client1.on('first-in-room', () => {
    console.log('🎉 Client 1: First in room!');
});

client1.on('new-user', (socketId) => {
    console.log(`👤 Client 1: New user joined - ${socketId}`);
});

client1.on('room-user-change', (users) => {
    console.log(`👥 Client 1: Room users changed - ${users.length} user(s):`, users);
});

client1.on('client-broadcast', (data, iv) => {
    console.log(`📡 Client 1: Received broadcast (${data.byteLength} bytes)`);
    const decoder = new TextDecoder();
    const message = decoder.decode(data);
    console.log(`   Message: "${message}"`);
});

// Client 2 event handlers
client2.on('connect', () => {
    console.log('✅ Client 2 connected! Socket ID:', client2.id);
});

client2.on('init-room', () => {
    console.log('📨 Client 2: Received init-room event');
    // Join the same room after a delay
    setTimeout(() => {
        console.log(`🚪 Client 2: Joining room "${testRoomId}"`);
        client2.emit('join-room', testRoomId);
    }, 1500);
});

client2.on('new-user', (socketId) => {
    console.log(`👤 Client 2: New user joined - ${socketId}`);
});

client2.on('room-user-change', (users) => {
    console.log(`👥 Client 2: Room users changed - ${users.length} user(s):`, users);
    
    // Send a test broadcast after both clients are in the room
    if (users.length === 2) {
        setTimeout(() => {
            console.log('\n📤 Client 2: Sending test broadcast...');
            const encoder = new TextEncoder();
            const testMessage = 'Hello from Client 2!';
            const data = encoder.encode(testMessage);
            const iv = new Uint8Array(16); // Mock IV
            client2.emit('server-broadcast', testRoomId, data.buffer, iv);
        }, 500);
    }
});

client2.on('client-broadcast', (data, iv) => {
    console.log(`📡 Client 2: Received broadcast (${data.byteLength} bytes)`);
    const decoder = new TextDecoder();
    const message = decoder.decode(data);
    console.log(`   Message: "${message}"`);
});

// Error handlers
client1.on('connect_error', (error) => {
    console.error('❌ Client 1 connection error:', error.message);
});

client2.on('connect_error', (error) => {
    console.error('❌ Client 2 connection error:', error.message);
});

// Cleanup after 5 seconds
setTimeout(() => {
    console.log('\n✅ Test completed! Disconnecting...');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
}, 5000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
});
