#include <Arduino.h>
#include <WiFi.h>
#include <MQTTPubSubClient.h>
#include "helpers.h"
#include "sensorHelpers.h"
#include "config.h"

WiFiClient wifiClient;
MQTTPubSubClient mqtt;

uint64_t uniqueID = ESP.getEfuseMac();

DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter(BH1750::ONE_TIME_HIGH_RES_MODE);

void setup() {
    Serial.begin(9600);
    pinMode(HUMPIN, INPUT);
    
    connectToWifi();

    wifiClient.connect(MQTT_SERVER, MQTT_PORT);

    mqtt.begin(wifiClient);

    connectToMQTT();

    publishConnectionStatus();

    // Subscribe callback for other messages
    mqtt.subscribe([](const String& topic, const String& payload, const size_t size) {
        Serial.println("mqtt received: " + topic + " - " + payload);
    });
}

void loop() {
    mqtt.update();  // should be called

    if (!mqtt.isConnected()) {
        connectToMQTT();
    }
    
    static uint32_t prev_ms = millis();
    static uint32_t heartbeat_prev_ms = millis(); // for heartbeat tracking


    if (millis() > prev_ms + UPDATE_INTERVAL) {
        prev_ms = millis();

        publishData("sensor/data");

        Serial.println("published");
    }

    if (millis() > heartbeat_prev_ms + 60000) { // every 60 seconds
        heartbeat_prev_ms = millis();
        publishHeartbeat();
    }   
}