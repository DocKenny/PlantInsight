import { Db } from "mongodb";
import { saveSensorData, saveErrorData, saveMCUConnection } from "./database";

interface MqttMessage {
    topic: string;
    message: string;
}

export function handleMqttMessage(message: MqttMessage, db: Db) {
    // Parse the message if it's JSON formatted
    let parsedMessage;
    try {
        parsedMessage = JSON.parse(message.message);
    } catch (e) {
        console.error("Failed to parse MQTT message:", e);
        return;
    }

    const topic = message.topic;

    if (topic.startsWith("sensor/data")) {
        console.log("Processing sensor data:", parsedMessage);
        saveSensorData(db, parsedMessage);
    } else if (topic.startsWith("sensor/error")) {
        console.log("Processing error message:", parsedMessage);
        saveErrorData(db, parsedMessage);
    } else if (topic.startsWith("mcu/heartbeat") || topic.startsWith("mcu/")) {
        console.log("Processing MCU message:", parsedMessage);
        saveMCUConnection(db, parsedMessage, topic.startsWith("mcu/heartbeat"));
    } else {
        console.log("Received message for an unknown topic:", message.topic);
    }
}
