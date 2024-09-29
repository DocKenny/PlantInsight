#include "helpers.h"

// Declare these variables as extern if they're defined in main.cpp
extern MQTTPubSubClient mqtt;

void connectToWifi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println(" connected!");
}

void connectToMQTT() {
    Serial.print("Connecting to MQTT...");
    while (!mqtt.connect("esp32")) {  // Use a client ID here
        Serial.print(".");
        delay(1000);
    }
    Serial.println(" connected!");
}

void publishData(const String& topic) {
    JsonDocument doc;

    // Convert uniqueID to a string to ensure compatibility with JSON
    char uniqueIDStr[21];  // 64-bit integer max length is 20 digits + null terminator
    sprintf(uniqueIDStr, "%llu", uniqueID);  // %llu for 64-bit unsigned integer

    doc["id"] = uniqueIDStr; 
    DHTData dhtData = readDHT();
    doc["temperature"] = dhtData.temperature;
    doc["humidity"] = dhtData.humidity;

    doc["soil_humidity"] = readSoilHumidity();
    doc["light_level"] = readLight();

    String payload;
    serializeJson(doc, payload);
    mqtt.publish(topic, payload);
}

void publishError(const String& topic, const String& message) {
    JsonDocument doc; 
    // Convert uniqueID to a string to ensure compatibility with JSON
    char uniqueIDStr[21];  // 64-bit integer max length is 20 digits + null terminator
    sprintf(uniqueIDStr, "%llu", uniqueID);  // %llu for 64-bit unsigned integer

    doc["id"] = uniqueIDStr;
    doc["message"] = message;
    String payload;
    serializeJson(doc, payload);
    mqtt.publish(topic, payload);
}

void publishConnectionStatus() {
    JsonDocument doc; 
    doc["id"] = uniqueID;
    doc["status"] = "active";

    String payload;
    serializeJson(doc, payload);
    mqtt.publish("mcu/status", payload);
}

void publishHeartbeat() {
    JsonDocument doc; 
    doc["id"] = uniqueID;
    doc["status"] = "heartbeat";

    String payload;
    serializeJson(doc, payload);
    mqtt.publish("mcu/heartbeat", payload);
}
