import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatFactsComponent } from './cats-facts.component';
import { CatsFactsService } from './cats-facts.service';
import { ResourceStatusPipe } from './resource-status.pipe';
import { By } from '@angular/platform-browser';

describe('CatFactsComponent', () => {
  let component: CatFactsComponent;
  let fixture: ComponentFixture<CatFactsComponent>;
  let service: jasmine.SpyObj<CatsFactsService>;

  beforeEach(async () => {
    // Create spy object for CatsFactsService
    service = jasmine.createSpyObj('CatsFactsService', ['updateCount'], {
      // Mock the getCatsFacts resource
      getCatsFacts: {
        value: () => ['Test fact 1', 'Test fact 2'],
        hasValue: () => true,
        status: () => 'success',
        isLoading: () => false,
        error: () => null,
        reload: jasmine.createSpy('reload')
      }
    });

    await TestBed.configureTestingModule({
      imports: [CatFactsComponent, ResourceStatusPipe],
      providers: [
        { provide: CatsFactsService, useValue: service }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatFactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.count()).toBe(5);
    expect(component.factsResource.value()).toEqual(['Test fact 1', 'Test fact 2']);
  });

  it('should call updateCount with random value when loadRandomFacts is called', () => {
    // Call the method
    component.loadRandomFacts();

    // Verify that updateCount was called
    expect(service.updateCount).toHaveBeenCalled();

    // Verify the random value is within expected range (1-100)
    const calledValue = service.updateCount.calls.mostRecent().args[0];
    expect(calledValue).toBeGreaterThanOrEqual(1);
    expect(calledValue).toBeLessThanOrEqual(100);
  });

  it('should call reload when restartFacts is called', () => {
    // Call the method
    component.restartFacts();

    // Verify that reload was called
    expect(component.factsResource.reload).toHaveBeenCalled();
  });

  it('should display cat facts in the template', () => {
    fixture.detectChanges();
    const factsElements = fixture.debugElement.queryAll(By.css('.fact-item'));
    expect(factsElements.length).toBe(2);
    expect(factsElements[0].nativeElement.textContent).toContain('Test fact 1');
    expect(factsElements[1].nativeElement.textContent).toContain('Test fact 2');
  });

  it('should show loading state when isLoading is true', () => {
    // Override the isLoading spy
    Object.defineProperty(component.factsResource, 'isLoading', {
      value: () => true
    });

    fixture.detectChanges();
    const loadingElement = fixture.debugElement.query(By.css('.loading-indicator'));
    expect(loadingElement).toBeTruthy();
  });

  it('should show error state when there is an error', () => {
    // Override the error spy
    Object.defineProperty(component.factsResource, 'error', {
      value: () => new Error('Test error')
    });

    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(By.css('.error-message'));
    expect(errorElement).toBeTruthy();
  });
});
