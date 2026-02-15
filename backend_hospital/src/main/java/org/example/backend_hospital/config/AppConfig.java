package org.example.backend_hospital.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "hospital")
@Data
public class AppConfig {
    private String id;
    private boolean debugMode;
}
