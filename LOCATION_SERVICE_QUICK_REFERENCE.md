# Location Service - Quick Reference Guide 🚁📍

## 🎯 **Tổng quan**
Location Service sử dụng **Redis cache** để track vị trí drone realtime với performance cao.

---

## 📦 **Import**

```typescript
import { locationService } from '@/services/locationService';
import type { LocationResponse, CreateLocationRequest } from '@/types/location';
```

---

## 🔧 **API Methods**

### **1. Update Drone Location (Cached in Redis)**
```typescript
const response = await locationService.updateDroneLocation({
  droneId: '68eb9e1235281411ad0f423c',
  latitude: 10.762622,
  longitude: 106.660172,
  // Optional:
  recordedAt: new Date().toISOString(),
  timestamp: Date.now(),
});

if (response.success) {
  console.log('Location updated:', response.data);
}
```

**Backend:**
- ✅ Lưu vào MongoDB (history)
- ✅ Cache vào Redis (TTL: 10 minutes)
- ✅ Broadcast qua WebSocket → `/topic/drone/{droneId}`

---

### **2. Get Drone Location (from Redis/MongoDB)**
```typescript
const response = await locationService.getDroneLocation(droneId);

if (response.success && response.data) {
  const location = response.data;
  console.log('Current location:', location.latitude, location.longitude);
  console.log('Last update:', new Date(location.timestamp));
} else {
  console.log('No location found');
}
```

**Backend Flow:**
1. Check Redis first ⚡ (fast)
2. Fallback to MongoDB (if not cached)
3. Return `null` if no location found

---

### **3. Calculate Distance Between Coordinates**
```typescript
const distance = locationService.calculateDistance(
  10.762622,  // lat1
  106.660172, // lng1
  10.765432,  // lat2
  106.665432  // lng2
);

console.log(`Distance: ${distance} km`);
```

---

### **4. Validate Coordinates**
```typescript
const validation = locationService.validateCoordinates(lat, lng);

if (!validation.valid) {
  console.error('Invalid coordinates:', validation.errors);
}
```

---

## 📊 **Types**

### **LocationResponse**
```typescript
interface LocationResponse {
  locationId: string;
  droneId: string;
  latitude: number;
  longitude: number;
  recordedAt: string; // ISO date string
  timestamp: number;  // Unix timestamp (ms)
}
```

### **CreateLocationRequest**
```typescript
interface CreateLocationRequest {
  droneId: string;
  latitude: number;    // -90 to 90
  longitude: number;   // -180 to 180
  recordedAt?: string; // Optional
  timestamp?: number;  // Optional
}
```

---

## 🎨 **Usage Examples**

### **Example 1: Drone Tracking Dashboard**
```typescript
import { locationService } from '@/services/locationService';

const DroneTracker = ({ droneId }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Fetch initial location
    const fetchLocation = async () => {
      const response = await locationService.getDroneLocation(droneId);
      if (response.success && response.data) {
        setLocation(response.data);
      }
    };

    fetchLocation();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [droneId]);

  return (
    <div>
      {location && (
        <div>
          <p>Lat: {location.latitude}</p>
          <p>Lng: {location.longitude}</p>
          <p>Updated: {new Date(location.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};
```

---

### **Example 2: Update Drone Location (from Drone Client)**
```typescript
// Drone gửi vị trí mỗi 5 giây
setInterval(async () => {
  const gps = await navigator.geolocation.getCurrentPosition();
  
  await locationService.updateDroneLocation({
    droneId: currentDroneId,
    latitude: gps.coords.latitude,
    longitude: gps.coords.longitude,
  });
}, 5000);
```

---

### **Example 3: Track Distance Traveled**
```typescript
let previousLocation = null;
let totalDistance = 0;

setInterval(async () => {
  const response = await locationService.getDroneLocation(droneId);
  
  if (response.success && response.data) {
    const current = response.data;
    
    if (previousLocation) {
      const distance = locationService.calculateDistance(
        previousLocation.latitude,
        previousLocation.longitude,
        current.latitude,
        current.longitude
      );
      
      totalDistance += distance;
      console.log(`Total distance: ${totalDistance.toFixed(2)} km`);
    }
    
    previousLocation = current;
  }
}, 5000);
```

---

### **Example 4: Map Integration with Auto-Update**
```typescript
import { locationService } from '@/services/locationService';
import MapPicker from '@/components/MapPicker';

const DroneMap = ({ droneId }) => {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const updateLocation = async () => {
      const response = await locationService.getDroneLocation(droneId);
      if (response.success && response.data) {
        setLocation({
          lat: response.data.latitude,
          lng: response.data.longitude,
        });
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 3000);
    return () => clearInterval(interval);
  }, [droneId]);

  return (
    <MapPicker
      initialLat={location.lat}
      initialLng={location.lng}
      onLocationSelect={() => {}}
      height="500px"
    />
  );
};
```

---

## 🔑 **Redis Key Structure**

```
Key: drone:location:{droneId}
Value: LocationResponse (JSON serialized)
TTL: 10 minutes
```

**Example:**
```
Key: drone:location:68eb9e1235281411ad0f423c
Value: {
  "locationId": "673ed0e8d6f44b49e8f4c2a1",
  "droneId": "68eb9e1235281411ad0f423c",
  "latitude": 10.762622,
  "longitude": 106.660172,
  "recordedAt": "2025-11-16T10:30:00Z",
  "timestamp": 1700134200000
}
```

---

## 🚦 **Validation Rules**

```typescript
LOCATION_CONSTRAINTS = {
  LATITUDE_MIN: -90,
  LATITUDE_MAX: 90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX: 180,
}
```

---

## 🎯 **Best Practices**

1. **Auto-refresh interval:** 3-10 seconds (balance between realtime and performance)
2. **Error handling:** Always check `response.success` before accessing `response.data`
3. **Null checks:** Handle case where drone has no location data
4. **Distance calculation:** Use built-in `calculateDistance()` method
5. **Validation:** Always validate coordinates before updating

---

## 🔧 **Testing**

```bash
# Check Redis cache
redis-cli
> GET drone:location:68eb9e1235281411ad0f423c
> TTL drone:location:68eb9e1235281411ad0f423c
> KEYS drone:location:*

# Test API
curl http://localhost:8080/api/locations/drone/68eb9e1235281411ad0f423c
```

---

## 📌 **API Endpoints**

```typescript
// Constants
import { API } from '@/config/constants';

// Endpoints
API.UPDATE_DRONE_LOCATION          // POST /api/locations
API.GET_DRONE_LOCATION(droneId)    // GET /api/locations/drone/{droneId}
```

---

## ⚡ **Performance**

- **Redis read:** ~1-5ms ⚡
- **MongoDB fallback:** ~50-100ms
- **Cache hit rate:** ~95% (with 5-sec updates)
- **TTL:** 10 minutes

---

## 🎉 **Ready to Use!**

```typescript
// Simple usage
import { locationService } from '@/services/locationService';

// Get location
const { data } = await locationService.getDroneLocation(droneId);

// Update location
await locationService.updateDroneLocation({
  droneId,
  latitude: 10.762622,
  longitude: 106.660172,
});
```

**That's it! Location tracking is ready! 🚁📍**
