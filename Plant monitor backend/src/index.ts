import express from "express";
import * as mqtt from "mqtt";
import WebSocket from "ws";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { handleMqttMessage } from "./mqtt-handler"; 
import { startMCUStatusChecker } from "./database";  // Importing the status checker

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000");
const mqttBrokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const wsUrl = process.env.WS_URL || "ws://localhost:9001";

const mqttClient = mqtt.connect(mqttBrokerUrl);
const mongoClient = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

let wsClient: WebSocket;

async function startServer() {
    try {
        await mongoClient.connect();
        console.log("Connected to MongoDB");

        // Start checking for inactive MCUs
        startMCUStatusChecker(mongoClient.db("plant-monitoring"));  // Start status checking here

        // Connect to the WebSocket server
        wsClient = new WebSocket(wsUrl);

        wsClient.on('open', () => {
            console.log('Connected to WebSocket server');
        });

        wsClient.on('message', (data) => {
            console.log('Received WebSocket message:', data.toString());
            // handle data from the WebSocket client
        });

        wsClient.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        mqttClient.on("connect", () => {
            console.log("Connected to MQTT broker");
            mqttClient.subscribe("sensor/#");
            mqttClient.subscribe("mcu/#");
        });

        mqttClient.on("message", (topic, message) => {
            console.log(`Received message on ${topic}: ${message.toString()}`);
            
            handleMqttMessage({ topic, message: message.toString() }, mongoClient.db("plant-monitoring"));
            
            // Send this data to the WebSocket client
            if (wsClient.readyState === WebSocket.OPEN) {
                wsClient.send(JSON.stringify({ topic, message: message.toString() }));
            }
        });

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
