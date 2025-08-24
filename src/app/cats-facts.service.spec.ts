import { TestBed } from '@angular/core/testing';
import { CatsFactsService } from './cats-facts.service';

describe('CatsFactsService', () => {
  let service: CatsFactsService;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    // Create a spy for the global fetch function
    fetchSpy = spyOn(window, 'fetch');

    TestBed.configureTestingModule({
      providers: [CatsFactsService]
    });
    service = TestBed.inject(CatsFactsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch cat facts with the correct count', async () => {
    // Mock the fetch response
    const mockResponse = { data: ['Fact 1', 'Fact 2'] };
    fetchSpy.and.resolveTo({
      json: () => Promise.resolve(mockResponse)
    } as Response);

    // Get the current value
    const facts = await service.getCatsFacts.value();

    // Check that fetch was called with the correct URL
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://meowfacts.herokuapp.com/?count=10',
      jasmine.any(Object)
    );

    // Verify the returned data
    expect(facts).toEqual(['Fact 1', 'Fact 2']);
  });

  it('should update count and trigger a new fetch', async () => {
    // Mock the fetch responses
    const mockResponse1 = { data: ['Fact 1'] };
    const mockResponse2 = { data: ['Fact 2', 'Fact 3'] };

    fetchSpy.and.resolveTo({
      json: () => Promise.resolve(mockResponse1)
    } as Response);

    // Get initial facts
    await service.getCatsFacts.value();

    // Update to fetch spy to return different response
    fetchSpy.and.resolveTo({
      json: () => Promise.resolve(mockResponse2)
    } as Response);

    // Update count
    service.updateCount(2);

    // Get updated facts
    const updatedFacts = await service.getCatsFacts.value();

    // Verify fetch was called with new count
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://meowfacts.herokuapp.com/?count=2',
      jasmine.any(Object)
    );

    // Verify the new data
    expect(updatedFacts).toEqual(['Fact 2', 'Fact 3']);
  });

  it('should handle fetch errors', async () => {
    // Mock a fetch error
    fetchSpy.and.rejectWith(new Error('Network error'));

    // Attempt to get facts
    try {
      await service.getCatsFacts.value();
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeTruthy();
      if (error instanceof Error) {
        expect(error.message).toBe('Network error');
      }
    }
  });

  it('should provide default empty array when no data is loaded', () => {
    // Check the default value before any data is loaded
    expect(service.getCatsFacts.value()).toEqual([]);
  });

  it('should cancel ongoing requests when aborted', async () => {
    // Create an AbortController to simulate request cancellation
    const controller = new AbortController();

    // Mock fetch to check if abort signal is passed
    fetchSpy.and.callFake((url, options) => {
      // Simulate a long request that will be aborted
      return new Promise((resolve, reject) => {
        // Listen for abort signal
        options.signal.addEventListener('abort', () => {
          reject(new Error('AbortError'));
        });
      });
    });

    // Start a request that will be aborted
    const promise = service.getCatsFacts.value();

    // Abort the request
    controller.abort();

    try {
      await promise;
      fail('Should have thrown an abort error');
    } catch (error: any) {
      expect(error.message).toBe('AbortError');
    }
  });
});
