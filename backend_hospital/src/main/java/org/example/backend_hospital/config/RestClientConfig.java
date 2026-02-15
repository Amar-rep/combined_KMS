package org.example.backend_hospital.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${kms.url}")
    private String kmsUrl;

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .baseUrl(kmsUrl)
                .build();
    }
}
