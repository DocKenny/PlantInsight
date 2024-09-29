#include "sensorHelpers.h"


extern DHT dht;
extern BH1750 lightMeter;

DHTData readDHT() {
    DHTData data;
    data.temperature = dht.readTemperature();
    Serial.println(data.temperature);
    data.humidity = dht.readHumidity();
    Serial.println(data.humidity);
    
    if (isnan(data.temperature) || isnan(data.humidity)) {
        publishError("sensor/error", "Failed to read DHT sensor");
    }

    return data;
}

int readSoilHumidity() {
    digitalWrite(HUMPOWER, HIGH);
    delay(10);
    int sensorValue = analogRead(HUMPIN);

    digitalWrite(HUMPOWER, LOW);

    if (isnan(sensorValue)) {
        publishError("sensor/error", "Failed to read soil humidity sensor");
    }

    return sensorValue;
}

int readLight() {
    lightMeter.begin();
    int lightLevel = lightMeter.readLightLevel();
    if (isnan(lightLevel)) {
        publishError("sensor/error", "Failed to read light sensor");
    }
    return lightLevel;
}