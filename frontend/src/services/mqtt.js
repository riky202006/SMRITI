let mqttClient = null;

export function getMqttClient() {
  return mqttClient;
}

export function publishLocation(locData, patientId = 'default') {
  const topic = `smriti/patient/${patientId}/location`;
  if (!mqttClient && typeof window !== 'undefined') {
    import('mqtt').then(({ default: mqtt }) => {
      try {
        mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
        mqttClient.on('connect', () => {
          mqttClient.publish(topic, JSON.stringify(locData));
        });
      } catch {
        /* MQTT optional */
      }
    });
    return;
  }
  if (mqttClient) {
    try {
      mqttClient.publish(topic, JSON.stringify(locData));
    } catch {
      /* ignore */
    }
  }
}

export function subscribeLocation(patientId = 'default', callback) {
  const topic = `smriti/patient/${patientId}/location`;
  import('mqtt').then(({ default: mqtt }) => {
    try {
      if (!mqttClient) {
        mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
      }
      mqttClient.on('message', (receivedTopic, payload) => {
        if (receivedTopic === topic || receivedTopic.includes(patientId)) {
          try {
            callback(JSON.parse(payload.toString()));
          } catch {
            /* ignore */
          }
        }
      });
      mqttClient.subscribe(topic);
    } catch {
      /* MQTT optional */
    }
  });
}
