package com.example.urban_signs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
public class UrbanSignsApplication {

	@PostConstruct
	public void init() {
		// Estandariza la hora del servidor en cualquier parte del mundo (hora Bolivia UTC-4)
		TimeZone.setDefault(TimeZone.getTimeZone("America/La_Paz"));
	}

	public static void main(String[] args) {
		SpringApplication.run(UrbanSignsApplication.class, args);
	}

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}