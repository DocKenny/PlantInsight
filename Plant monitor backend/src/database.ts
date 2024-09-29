import { Db } from "mongodb";

const HEARTBEAT_TIMEOUT = 180000; // 3 minutes
const mcuCache: Record<string, { status: string; lastSeen: Date }> = {};
const CACHE_TIMEOUT = 600000; // 10 minutes

// Save sensor data to the database
export async function saveSensorData(db: Db, data: any) {
    const { id, temperature, humidity, soil_humidity, light } = data;

    const sensorData = {
        sensor_id: id,
        temperature: temperature || null,
        humidity: humidity || null,
        soil_humidity: soil_humidity || null,
        light_level: light || null,
        timestamp: new Date()
    };

    try {
        const collection = db.collection("sensorData");
        await collection.insertOne(sensorData);
        console.log("Sensor data saved to MongoDB:", sensorData);
    } catch (error) {
        console.error("Failed to save sensor data:", error);
    }
}

// Save error data to the database
export async function saveErrorData(db: Db, data: any) {
    const { id, message } = data;

    const errorData = {
        sensor_id: id,
        message: message || "Unknown error",
        timestamp: new Date()
    };

    try {
        const collection = db.collection("errorLogs");
        await collection.insertOne(errorData);
        console.log("Error data saved to MongoDB:", errorData);
    } catch (error) {
        console.error("Failed to save error data:", error);
    }
}

// Save MCU connection status to the database
export async function saveMCUConnection(db: Db, data: any, isHeartbeat: boolean) {
    const { id } = data;
    const collection = db.collection("MCUs");
    const currentTime = new Date();

    const cachedMCU = mcuCache[id];

    if (!cachedMCU) {
        mcuCache[id] = { status: "active", lastSeen: currentTime };
        await collection.insertOne({ id, status: "active", lastSeen: currentTime });
        console.log("New MCU connected:", id);
    } else {
        const updateData = { lastSeen: currentTime, status: "active" };

        if (isHeartbeat) {
            console.log("Heartbeat received from MCU:", id);
        }

        mcuCache[id] = updateData;
        await collection.updateOne({ id }, { $set: updateData });
        console.log("MCU status updated:", id, updateData.status);
    }
}

// Update inactive MCUs in the database
export async function updateInactiveMCUs(db: Db) {
    const collection = db.collection("MCUs");
    const inactiveThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT);

    await collection.updateMany(
        { lastSeen: { $lt: inactiveThreshold }, status: "active" },
        { $set: { status: "inactive" } }
    );

    console.log("Inactive MCUs updated");
}

// Start checking for inactive MCUs
export function startMCUStatusChecker(db: Db) {
    setInterval(async () => {
        // Cleanup stale entries from cache
        const now = new Date();
        for (const id in mcuCache) {
            const lastSeen = mcuCache[id].lastSeen;

            if (now.getTime() - lastSeen.getTime() > CACHE_TIMEOUT) {
                delete mcuCache[id];
                console.log("MCU removed from cache due to timeout:", id);
            }
        }
        
        // Call to update inactive MCUs in the database
        await updateInactiveMCUs(db);
    }, 60000); // Check every minute
}