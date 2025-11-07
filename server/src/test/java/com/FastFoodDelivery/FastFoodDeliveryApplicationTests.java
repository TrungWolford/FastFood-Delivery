package com.FastFoodDelivery;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic Spring Boot test to verify the application context can load.
 * This test uses a minimal configuration and excludes MongoDB and Redis to avoid
 * requiring those services during testing.
 */
@SpringBootTest(
		webEnvironment = SpringBootTest.WebEnvironment.NONE,
		classes = FastFoodDeliveryApplicationTests.MinimalTestConfiguration.class
)
@ActiveProfiles("test")
class FastFoodDeliveryApplicationTests {

	@Test
	void contextLoads() {
		// This test verifies that a minimal Spring application context loads successfully
		// without requiring MongoDB or Redis instances
	}

	/**
	 * Minimal test configuration that excludes MongoDB and Redis autoconfiguration
	 */
	@Configuration
	@EnableAutoConfiguration(exclude = {
			MongoAutoConfiguration.class,
			MongoDataAutoConfiguration.class,
			MongoRepositoriesAutoConfiguration.class,
			RedisAutoConfiguration.class,
			RedisRepositoriesAutoConfiguration.class
	})
	static class MinimalTestConfiguration {
	}

}
