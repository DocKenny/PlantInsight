#ifndef HELPERS_H
#define HELPERS_H

#include <Arduino.h>
#include "config.h"
#include "sensorHelpers.h"
#include <WiFi.h>
#include <MQTTPubSubClient.h>
#include <ArduinoJson.h>

extern uint64_t uniqueID;

void connectToWifi();
void connectToMQTT();
void publishData(const String& topic);
void publishError(const String& topic, const String& message);
void publishConnectionStatus();
void publishHeartbeat();

#endif // HELPERS_H