
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

class GeocodingCircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    isOpen: false
  };
  
  private readonly maxFailures = 3;
  private readonly resetTimeout = 60000; // 1 minute
  
  canProceed(): boolean {
    // If circuit is open, check if we should reset
    if (this.state.isOpen) {
      const timeSinceLastFailure = Date.now() - this.state.lastFailureTime;
      if (timeSinceLastFailure > this.resetTimeout) {
        console.log('Circuit breaker: Resetting after timeout');
        this.reset();
        return true;
      }
      console.log('Circuit breaker: Open, blocking geocoding requests');
      return false;
    }
    
    return true;
  }
  
  recordSuccess(): void {
    if (this.state.failures > 0) {
      console.log('Circuit breaker: Recording success, resetting failure count');
      this.state.failures = 0;
    }
  }
  
  recordFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();
    
    console.log(`Circuit breaker: Failure ${this.state.failures}/${this.maxFailures}`);
    
    if (this.state.failures >= this.maxFailures) {
      this.state.isOpen = true;
      console.log('Circuit breaker: Opening circuit due to consecutive failures');
    }
  }
  
  reset(): void {
    this.state = {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false
    };
    console.log('Circuit breaker: Reset');
  }
  
  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

export const geocodingCircuitBreaker = new GeocodingCircuitBreaker();
