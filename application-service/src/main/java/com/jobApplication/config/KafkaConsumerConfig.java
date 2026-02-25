// package com.jobApplication.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.kafka.annotation.EnableKafka;
// import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
// import org.springframework.kafka.core.ConsumerFactory;
// import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
// import org.springframework.kafka.listener.ContainerProperties;
// import org.springframework.kafka.support.serializer.JsonDeserializer;
// import org.apache.kafka.clients.consumer.ConsumerConfig;
// import org.apache.kafka.common.serialization.StringDeserializer;
// import com.jobApplication.model.Application;
// import java.util.HashMap;
// import java.util.Map;

// @Configuration
// @EnableKafka
// public class KafkaConsumerConfig {

//     /**
//      * Kafka Consumer Factory for Application events
//      */
//     @Bean
//     public ConsumerFactory<String, Application> consumerFactory() {
//         Map<String, Object> configProps = new HashMap<>();
//         configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
//         configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "application-service-group");
//         configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
//         configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
//         configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.jobApplication.model.Application");
//         configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
//         configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
//         configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
//         configProps.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 1000);
//         return new DefaultKafkaConsumerFactory<>(configProps);
//     }

//     /**
//      * Kafka Listener Container Factory
//      */
//     @Bean
//     public ConcurrentKafkaListenerContainerFactory<String, Application> kafkaListenerContainerFactory() {
//         ConcurrentKafkaListenerContainerFactory<String, Application> factory =
//                 new ConcurrentKafkaListenerContainerFactory<>();
//         factory.setConcurrency(3);
//         factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);
//         factory.setConsumerFactory(consumerFactory());
//         return factory;
//     }
// }
