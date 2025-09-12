import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';;
import { TemplateIdDirective } from './template-id.directive';

@Component({
  template: `<ng-template #template>test template</ng-template>`
})
class MockTemplateComponent {
  @ViewChild('template', { static: true }) public template: TemplateRef<any>;
}


describe('TemplateIdDirective', () => {
  let mockTemplateComponent: MockTemplateComponent;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockTemplateComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockTemplateComponent = TestBed.createComponent(MockTemplateComponent).componentInstance;
  });

  it('should create an instance', () => {
    const directive = new TemplateIdDirective(mockTemplateComponent.template);
    expect(directive).toBeTruthy();
  });
});
