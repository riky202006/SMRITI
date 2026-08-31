let mqttClient = null;

export function getMqttClient() {
  if (mqttClient) return mqttClient;
  try {
    // Dynamic import handled at call site; mqtt loaded via npm
    return null;
  } catch {
    return null;
  }
}

export function publishLocation(locData) {
  if (!mqttClient && typeof window !== 'undefined') {
    import('mqtt').then(({ default: mqtt }) => {
      try {
        mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
        mqttClient.on('connect', () => {
          mqttClient.publish('smriti/hackathon/PATIENT_DEMO_001/location', JSON.stringify(locData));
        });
      } catch {
        /* MQTT optional */
      }
    });
    return;
  }
  if (mqttClient) {
    try {
      mqttClient.publish('smriti/hackathon/PATIENT_DEMO_001/location', JSON.stringify(locData));
    } catch {
      /* ignore */
    }
  }
}

export function subscribeLocation(callback) {
  import('mqtt').then(({ default: mqtt }) => {
    try {
      if (!mqttClient) {
        mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
      }
      mqttClient.on('message', (topic, payload) => {
        if (topic.includes('location')) {
          try {
            callback(JSON.parse(payload.toString()));
          } catch {
            /* ignore */
          }
        }
      });
      mqttClient.subscribe('smriti/hackathon/PATIENT_DEMO_001/location');
    } catch {
      /* MQTT optional */
    }
  });
}
