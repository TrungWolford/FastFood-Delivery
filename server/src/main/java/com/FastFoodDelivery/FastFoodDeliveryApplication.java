package com.FastFoodDelivery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FastFoodDeliveryApplication {

	public static void main(String[] args) {
		SpringApplication.run(FastFoodDeliveryApplication.class, args);
	}

}
