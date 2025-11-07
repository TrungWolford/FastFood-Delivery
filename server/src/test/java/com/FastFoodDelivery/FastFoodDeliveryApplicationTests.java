package com.FastFoodDelivery;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
	"spring.autoconfigure.exclude=" +
		"org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration," +
		"org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration," +
		"org.springframework.boot.autoconfigure.data.mongo.MongoAutoConfiguration," +
		"org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration"
})
class FastFoodDeliveryApplicationTests {

	@Test
	void contextLoads() {
		// This test verifies that the Spring application context loads successfully
	}

}
