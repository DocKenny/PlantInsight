#ifndef SENSORHELPERS_H
#define SENSORHELPERS_H

#include <Arduino.h>
#include <DHT.h>
#include <BH1750.h>
#include "config.h"
#include "helpers.h"

struct DHTData {
    float temperature;
    float humidity;
};

DHTData readDHT();
int readSoilHumidity();
int readLight();

#endif // SENSORHELPERS_H
